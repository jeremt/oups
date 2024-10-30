/* eslint-disable @typescript-eslint/no-require-imports */
const {makeKyselyHook, kyselyCamelCaseHook} = require('kanel-kysely');
const {resolveType, escapeIdentifier} = require('kanel');
const customTypes = require('./src/lib/kysely/types.json');
const dotenv = require('dotenv');
const {sep} = require('path');

dotenv.config();

const tablesToIgnore = ['kysely_migration', 'kysely_migration_lock'];
module.exports = {
    schemas: ['public', 'auth'],
    connection: process.env.DATABASE_URL,

    typeFilter: type => (type.kind === 'table' && tablesToIgnore.includes(type.name) ? false : true),
    enumStyle: 'type',
    preDeleteOutputFolder: true,
    outputPath: './src/lib/kysely/gen',
    preRenderHooks: [makeKyselyHook({includeSchemaNameInTableName: true}), kyselyCamelCaseHook, namedExportsHook, extractCustomJSONTypes],

    // removes branded types pk + prefix types with schema to avoid conflicts
    generateIdentifierType: (column, details, config) => {
        const name = escapeIdentifier(snakeToPascalCase(details.schemaName) + snakeToPascalCase(details.name) + snakeToPascalCase(column.name));
        const innerType = resolveType(column, details, {
            ...config,
            // Explicitly disable identifier resolution so we get the actual inner type here
            generateIdentifierType: undefined,
        });
        const imports = [];

        let type = innerType;
        if (typeof innerType === 'object') {
            // Handle non-primitives
            type = innerType.name;
            imports.push(...innerType.typeImports);
        }

        return {
            declarationType: 'typeDeclaration',
            name,
            exportAs: 'named',
            typeDefinition: [type],
            typeImports: imports,
            comment: [`Identifier type for ${details.schemaName}.${details.name}`],
        };
    },
    customTypeMap: {
        'pg_catalog.tsvector': 'Set<string>',
        'pg_catalog.int8': 'number',
        'pg_catalog.bytea': 'string',
    },
};

function snakeToPascalCase(str) {
    const words = str.split(/[-_\s]+/);
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join('');
}

/**
 *
 * @param {import('kanel').Output} output
 */
function extractCustomJSONTypes(output) {
    for (const [path, type] of Object.entries(customTypes)) {
        const [schema, table, column] = path.split('.');
        for (const [filePath, {declarations}] of Object.entries(output)) {
            const split = filePath.split(sep);
            const [schemaName, tableName] = split.slice(-2);
            const typeName = snakeToPascalCase(`${schema}_${table}_${column}`);
            if (schemaName === schema && tableName === snakeToPascalCase(table)) {
                declarations.splice(1, 0, {
                    name: typeName,
                    declarationType: 'typeDeclaration',
                    exportAs: 'named',
                    comment: [`Custom JSON type`],
                    typeDefinition: [type],
                });

                for (const declaration of declarations) {
                    for (const property of declaration.properties ?? []) {
                        if (property.name === column) {
                            property.typeName = property.typeName.replaceAll('unknown', typeName);
                        }
                    }
                }
            }
        }
    }
    return output;
}

/**
 *
 * @param {import('kanel').Output} output
 */
function namedExportsHook(output) {
    for (const [, {declarations}] of Object.entries(output)) {
        for (const declaration of declarations) {
            declaration.exportAs = 'named';
            for (const typeImport of declaration.typeImports ?? []) {
                typeImport.isDefault = false;
                typeImport.importAsType = true;
            }
            for (const property of declaration.properties ?? []) {
                for (const typeImport of property.typeImports ?? []) {
                    typeImport.isDefault = false;
                }
            }
        }
    }
    return output;
}
