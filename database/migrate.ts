import * as path from 'path';
import pg from 'pg';
import {promises as fs} from 'fs';
import {Kysely, Migrator, PostgresDialect, MigrationResult} from 'kysely';
import {config} from 'dotenv';
import {pathToFileURL} from 'url';

config();

const defaultMigrationContent = `
import { Kysely } from 'kysely'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function up(db: Kysely<any>): Promise<void> {
  // Migration code
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function down(db: Kysely<any>): Promise<void> {
  // Migration code
}
`;
type MigrateOperation = 'up' | 'down' | 'latest';
type CommandOperation = MigrateOperation | 'new';

const migrationFolder = './database/migrations';

const operation = process.argv[2] as CommandOperation | undefined;
if (!operation) {
    console.error(`need an operation to execute, command expected: "up", "down", "latest" or "new"`);
    process.exit(1);
}

async function migrate() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = new Kysely<any>({
        dialect: new PostgresDialect({
            pool: new pg.Pool({
                connectionString: process.env.DATABASE_URL,
            }),
        }),
    });

    const migrator = new Migrator({
        db,
        provider: {
            async getMigrations() {
                const migrations = {};
                const files = await fs.readdir(migrationFolder);
                for (const fileName of files) {
                    const url = pathToFileURL(path.resolve(path.posix.join(migrationFolder, fileName)));
                    const migration = await import(url.toString());
                    const migrationKey = fileName.substring(0, fileName.lastIndexOf('.'));
                    const d = migration?.default;
                    if (typeof d === 'function' || (typeof d === 'object' && d !== null)) {
                        migrations[migrationKey] = d;
                    } else if (typeof migration === 'function' || (typeof migration === 'object' && migration !== null)) {
                        migrations[migrationKey] = migration;
                    }
                }
                return migrations;
            },
        },
    });

    let error: unknown | undefined;
    let results: MigrationResult[] | undefined;

    switch (operation) {
        case 'up': {
            ({error, results} = await migrator.migrateUp());
            break;
        }
        case 'down': {
            ({error, results} = await migrator.migrateDown());
            break;
        }
        case 'latest': {
            ({error, results} = await migrator.migrateToLatest());

            break;
        }
    }
    results?.forEach(it => {
        if (it.status === 'Success' && it.direction === `Up`) {
            console.log(`${new Date().toISOString()} - migration "${it.migrationName}" was executed successfully`);
        } else if (it.status === 'Success' && it.direction === `Down`) {
            console.log(`${new Date().toISOString()} - migration "${it.migrationName}" was reverted successfully`);
        } else if (it.status === 'Error') {
            console.error(`${new Date().toISOString()} - failed to execute migration "${it.migrationName}"`);
        }
    });
    if (results?.length === 0 && operation !== 'down') {
        console.log(`${new Date().toISOString()} - Migrations are up to date`);
    } else if (results?.length === 0 && operation === 'down') {
        console.log(`${new Date().toISOString()} - No migration to rollback: database is in its initial state`);
    }
    await db.destroy();

    if (error) {
        console.error(`${new Date().toISOString()} - failed to migrate`);
        console.error(error);
        process.exit(1);
    }
}

async function createNewMigration() {
    const name = process.argv[3];
    if (!name) {
        console.error(`a name is required to create a new migration\nExample: kysely:migrate new add-table-products`);
        process.exit(1);
    }
    const date = new Date();
    const fileName = `${date.getUTCFullYear()}${(date.getUTCMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date
        .getHours()
        .toString()
        .padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}-${name}.ts`;
    await fs.writeFile(pathToFileURL(path.resolve(path.posix.join(migrationFolder, fileName))), defaultMigrationContent, {encoding: 'utf-8'});
    console.log(`migration file ${fileName} created`);
}

(async () => {
    switch (operation) {
        case 'new': {
            await createNewMigration();
            break;
        }
        default: {
            await migrate();
            break;
        }
    }
})();
