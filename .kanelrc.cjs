/* eslint-disable @typescript-eslint/no-require-imports */
const {makeKyselyHook, kyselyCamelCaseHook} = require('kanel-kysely');
const {resolveType, escapeIdentifier} = require('kanel');
const dotenv = require('dotenv');

dotenv.config();

const tablesToIgnore = ['kysely_migration', 'kysely_migration_lock'];
module.exports = {
    schemas: ['public', 'auth'],
    connection: process.env.DATABASE_URL,

    typeFilter: type => (type.kind === 'table' && tablesToIgnore.includes(type.name) ? false : true),
    enumStyle: 'type',
    preDeleteOutputFolder: true,
    outputPath: './src/lib/kysely/gen',
    preRenderHooks: [makeKyselyHook({includeSchemaNameInTableName: true}), kyselyCamelCaseHook],

    // removes branded types pk + prefix types with schema to avoid conflicts
    generateIdentifierType: (column, details, config) => {
        function toPascalCase(str) {
            const words = str.split(/[-_\s]+/);
            const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            return capitalizedWords.join('');
        }
        const name = escapeIdentifier(toPascalCase(details.schemaName) + toPascalCase(details.name) + toPascalCase(column.name));
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
