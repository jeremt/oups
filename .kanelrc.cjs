/* eslint-disable @typescript-eslint/no-require-imports */
const {makeKyselyHook} = require('kanel-kysely');
const dotenv = require('dotenv');

dotenv.config();

const tablesToIgnore = ['kysely_migration', 'kysely_migration_lock'];
module.exports = {
    schemas: ['public'],
    connection: process.env.DATABASE_URL,

    typeFilter: type => (type.kind === 'table' && tablesToIgnore.includes(type.name) ? false : true),
    enumStyle: 'type',
    preDeleteOutputFolder: true,
    outputPath: './src/lib/kysely/gen',
    preRenderHooks: [makeKyselyHook()],
};
