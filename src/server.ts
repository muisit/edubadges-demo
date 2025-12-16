import Debug from 'debug';
const debug = Debug('edubadges:main')
import {config as dotenvConfig} from "dotenv-flow";
dotenvConfig()

import { initialise } from "./server/initialise";
import { getDocumentStore } from './badges/store';

async function main()
{
    debug("initialising badge store");
    const store = getDocumentStore();
    await store.init();

    debug("initialising the server");
    await initialise();

    debug("end of main");
}

main();