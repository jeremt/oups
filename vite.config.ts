import ts from 'typescript';
import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig, type Plugin} from 'vitest/config';
import path from 'path';
import {writeFile} from 'fs/promises';

export default defineConfig({
    plugins: [sveltekit(), P()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
});

function P(): Plugin {
    let config: ts.ParsedCommandLine;
    let host: ts.CompilerHost;
    let program: ts.Program;
    let projectPath = '';
    let serverEndpointPathRegex: RegExp;

    async function parseProject() {
        const output: Record<string, {method: string; returnType: unknown}[]> = {};

        host = ts.createCompilerHost(config.options);

        program = ts.createProgram({
            rootNames: config.fileNames,
            options: config.options,
            oldProgram: program,
            host: host,
        });

        const sourceFiles = program.getSourceFiles();
        const typeChecker = program.getTypeChecker();

        for (const sourceFile of sourceFiles) {
            const relativePath = sourceFile.fileName.replace(`${projectPath}/src/routes`, '').replace('+server.ts', '');

            if (serverEndpointPathRegex.test(sourceFile.fileName)) {
                ts.forEachChild(sourceFile, node => {
                    if (!ts.canHaveModifiers(node) || !node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
                        return;
                    }
                    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
                        if (node.body) {
                            ts.forEachChild(node.body, child => {
                                if (ts.isReturnStatement(child)) {
                                    const expression = child.expression;
                                    if (expression && ts.isCallExpression(expression) && expression.expression.getText() === 'json') {
                                        const type = typeChecker.getTypeAtLocation(expression.arguments[0]);
                                        const returnType = renderType(typeChecker, child, type);
                                        const s = output[relativePath];
                                        if (s) {
                                            s.push({method: node.name!.text, returnType});
                                        } else {
                                            output[relativePath] = [{method: node.name!.text, returnType}];
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }

        await writeFile(`${projectPath}/src/lib/api.ts`, `export type Api = ${stringify(output)}`);
    }
    return {
        name: 'svelteAPI',
        apply: 'serve',
        configureServer: async server => {
            projectPath = server.config.root;

            const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists, 'tsconfig.json');
            if (!configPath) {
                throw new Error("Could not find a valid 'tsconfig.json'.");
            }
            serverEndpointPathRegex = RegExp(`^(?:${projectPath}/)?src/routes(/.*)?/\\+server\\.(ts|js)$`);
            config = ts.parseJsonConfigFileContent(
                ts.readConfigFile(configPath, ts.sys.readFile).config,
                ts.sys,
                projectPath,
                {
                    noEmit: true,
                    checkJs: false,
                    skipLibCheck: true,
                    incremental: true,
                    tsBuildInfoFile: path.join(projectPath, 'tsbuildinfo'),
                },
                configPath,
            );

            await parseProject();
        },

        handleHotUpdate: async ctx => {
            if (serverEndpointPathRegex.test(ctx.file)) {
                parseProject();
            }
        },
    };
}

function renderType(typeChecker: ts.TypeChecker, node: ts.Node, type: ts.Type) {
    const typeInfo = analyzeType(node, type, typeChecker);

    const render = ({kind, typeName, subtypes}: TypeInfo): string | undefined => {
        switch (kind) {
            case 'function': {
                return '';
            }
            case 'object': {
                if (typeName === 'Date') {
                    return 'Date';
                }
                return `{${subtypes!.map(p => `${p.name}: ${render(p)}`).join('; ')}}`;
            }
            case 'array': {
                return `(${subtypes!.map(render)})[]`;
            }
            case 'union': {
                return subtypes!.map(render).join(' | ');
            }
            case 'literal':
            case 'primitive': {
                return typeName;
            }
        }
    };

    return render(typeInfo) ?? typeChecker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation);
}

// Array<{}>
function stringify(obj: unknown, indent = 4, level = 0): string {
    // Handle null and undefined
    if (obj === null) {
        return 'null';
    }
    if (obj === undefined) {
        return 'undefined';
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
        if (typeof obj === 'string') return `'${obj}'`;
        return String(obj);
    }

    // Handle Date objects
    if (obj instanceof Date) {
        return `${obj.toISOString()}`;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            return '[]';
        }

        const items = obj.map((item: unknown) => ' '.repeat(level + indent) + stringify(item, indent, level + indent)).join(',\n');

        return `[\n${items}\n${' '.repeat(level)}]`;
    }

    // Handle regular objects
    const entries = Object.entries(obj);
    if (entries.length === 0) {
        return '{}';
    }

    const properties = entries
        .map(([key, value]: [string, unknown]) => {
            const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
            const isReturnType = formattedKey === 'returnType';
            const finalValue = isReturnType && value === '{}' ? 'Record<string, never>' : isReturnType ? value : stringify(value, indent, level + indent);
            return `${' '.repeat(level + indent)}${formattedKey}: ${finalValue}`;
        })
        .join(';\n');

    return `{\n${properties}\n${' '.repeat(level)}}`;
}

interface TypeInfo {
    kind: 'object' | 'array' | 'literal' | 'circular-reference' | 'union' | 'intersection' | 'class/interface' | 'type-parameter' | 'primitive' | 'function';
    name?: string;
    typeName: string;
    subtypes: TypeInfo[];
}

function analyzeType(node: ts.Node, type: ts.Type, checker: ts.TypeChecker, seen = new Set<ts.Type>(), propertyName?: string): TypeInfo {
    const typeName = checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation);
    // Prevent infinite recursion with circular types
    if (seen.has(type)) {
        return {
            typeName,
            kind: 'circular-reference',
            subtypes: [],
        };
    }
    seen.add(type);

    const typeInfo: TypeInfo = {
        typeName,
        name: propertyName,
        kind: getTypeKindString(checker, type),
        subtypes: [],
    };

    if (type.getCallSignatures().length > 0) {
        return {
            typeName,
            kind: 'function',
            subtypes: [],
        };
    }
    // Handle union types
    if (type.isUnion() || type.isIntersection()) {
        typeInfo.subtypes = type.types.map(t => analyzeType(node, t, checker, new Set(seen)));
        return typeInfo;
    }

    // Handle generic types
    if (type.aliasTypeArguments) {
        typeInfo.subtypes = type.aliasTypeArguments.map(t => analyzeType(node, t, checker, new Set(seen)));
        return typeInfo;
    }

    // Handle array types
    if (checker.isArrayType(type)) {
        const elementType = checker.getTypeArguments(type as ts.TypeReference)[0];
        typeInfo.subtypes = [analyzeType(node, elementType, checker, new Set(seen))];
        return typeInfo;
    }

    // Handle object types and interfaces
    if (type.isClassOrInterface() || type.flags === ts.TypeFlags.Object) {
        const properties = type.getProperties();
        typeInfo.subtypes = properties.map(prop => {
            const propType = checker.getTypeOfSymbolAtLocation(prop, node);
            return analyzeType(node, propType, checker, new Set(seen), prop.getName());
        });
        return typeInfo;
    }

    // Handle tuple types
    if (checker.isTupleType(type)) {
        const tupleTypes = checker.getTypeArguments(type as ts.TypeReference);
        typeInfo.subtypes = tupleTypes.map(t => analyzeType(node, t, checker, new Set(seen)));
        return typeInfo;
    }

    return typeInfo;
}

function getTypeKindString(checker: ts.TypeChecker, type: ts.Type): TypeInfo['kind'] {
    if (type.getFlags() === ts.TypeFlags.Object) {
        return checker.isArrayType(type) ? 'array' : 'object';
    }
    if (type.isLiteral()) return 'literal';
    if (type.isUnion()) return 'union';
    if (type.isIntersection()) return 'intersection';
    if (type.isClassOrInterface()) return 'class/interface';
    if (type.isTypeParameter()) return 'type-parameter';
    return 'primitive';
}
