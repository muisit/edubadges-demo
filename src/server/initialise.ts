import Debug from 'debug';
const debug = Debug('edubadges:server');

import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import cors from 'cors'
import passport from 'passport';
import { Strategy } from 'passport-http-bearer';
import { getOffer } from './getOffer';
import { checkOffer } from './checkOffer';
import { callback } from './callback';
import { getCredentials } from './getCredentials';


function bearerAdmin() {
    debug("initialising bearer token passport");
    passport.use('admin', new Strategy(
        function (token:string, done:Function) {
            debug("checking bearer token on incomming call");
            if (token == process.env.VITE_BEARER_TOKEN) {
                return done(null, true);
            }
            debug("bearer token mismatch, not allowed");
            return done(null, false);
        }
    ));
}

export const initialise = async () => {
    debug("initialising server");
    const app = express();
    app.use(morgan('combined')); // use combined logging output
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(cors({origin: '*', credentials: true, optionsSuccessStatus: 204}));
  
    const router = express.Router();
    app.use('/', router);

    bearerAdmin();
    debug("creating offer route");
    router.post('/offer',
        passport.authenticate('admin', { session: false }),
        getOffer
    );
    debug("creating check route");
    router.post('/check',
        passport.authenticate('admin', { session: false }),
        checkOffer
    );
    debug("creating callback route");
    router.post('/callback/:session',
        callback
    );
    debug("creating list route");
    router.get('/list', getCredentials);

    const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 5000
    const ADDRESS = process.env.LISTEN_ADDRESS ?? '0.0.0.0'
    debug("listening to server at " + PORT);
    await app.listen(PORT, ADDRESS);
    debug("end of server initialisation");
}
  