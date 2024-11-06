import {config} from 'dotenv';
import path from 'path';
import {pathToFileURL} from 'url';
import {readdir, writeFile} from 'fs/promises';
import {CamelCasePlugin, Kysely, PostgresDialect} from 'kysely';
import pg from 'pg';
import {createClient} from '@supabase/supabase-js';

config();

const defaultSeedContent = `import {Kysely} from 'kysely'
import type {SupabaseClient} from '@supabase/supabase-js';

import type {Database} from '$lib/kysely/gen/Database'

export const seed = async (kysely: Kysely<Database>, client: SupabaseClient) => {
    // await kysely.insertInto('public.users').defaultValues.execute();
}
`;

const seedFolder = './database/seeds';

const operation = process.argv[2] as string | undefined;
if (!operation) {
    console.error(`command expected: "new" or the name of the seed to run`);
    process.exit(1);
}

async function createNewSeed() {
    const name = process.argv[3];
    if (!name) {
        console.error(`a name is required to create a new sid\nExample: kysely:seed new user`);
        process.exit(1);
    }
    const fileName = `${name}.ts`;
    await writeFile(pathToFileURL(path.resolve(path.posix.join(seedFolder, fileName))), defaultSeedContent, {encoding: 'utf-8'});
    console.log(`seed file ${fileName} created`);
}

async function runSeed() {
    const files = await readdir(seedFolder);
    for (const file of files) {
        const seedName = path.basename(file, '.ts');
        if (seedName === operation) {
            const db = new Kysely<unknown>({
                dialect: new PostgresDialect({
                    pool: new pg.Pool({
                        connectionString: process.env.DATABASE_URL,
                    }),
                }),
                plugins: [new CamelCasePlugin()],
            });
            const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
            const url = pathToFileURL(path.resolve(path.posix.join(seedFolder, file)));
            const {seed} = await import(url.toString());
            await db.transaction().execute(async trx => {
                await seed(trx, client);
            });
            db.destroy();
            return;
        }
    }
    console.error(`seed ${operation} not found`);
}

(async () => {
    switch (operation) {
        case 'new': {
            await createNewSeed();
            break;
        }
        default: {
            await runSeed();
            break;
        }
    }
})();
