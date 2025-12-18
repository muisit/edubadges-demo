import Debug from 'debug';
const debug = Debug('endpoint:getOffer');

import { getDocumentStore } from '@/badges/store';
import { getSessionById, updateSession } from '@/sessions'
import { Request, Response } from 'express'
import { v4 } from 'uuid';

interface OfferRequest {
    badge:string
}

export async function getOffer(request: Request<OfferRequest>, response: Response) {
    try {
        debug("creating offer for badge ", request.body.badge);
        const session = getSessionById('');
        session.badgeid = request.body.badge;
        const store = getDocumentStore();
        const doc = store.get(session.badgeid ?? '');
        if (!doc) {
            debug("badge not available");
            return response.status(404).json({error:"Badge not found"});
        }

        // create the offer in the back-end
        const stateid = v4();
        const data = {
            credentials: [process.env.ISSUER_CREDENTIAL],
            grants: {authorization_code:{issuer_state:stateid}},
            credential_callback: process.env.VITE_BASE_URL + '/callback/' + session.id
        };
        debug("fetching offer from back-end");
        const res = await fetch(process.env.ISSUER_URL + '/api/create-offer', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + process.env.ISSUER_TOKEN
            },
            body: JSON.stringify(data),
        });

        if (!(res && res.status && res.status == 200)) {
            debug("response from back-end is invalid", res);
            return response.status(500).json({error:"Could not create offer on remote issuer"});
        }

        const json = await res.json();
        session.issuer_state = stateid;
        session.issuer_session = json.id;
        session.offer_url = json.uri;
        updateSession(session);

        debug("returnning session id for back-end offer", session.id, session.offer_url);
        return response.status(200).json({session:session.id,url:session.offer_url});
    }
    catch (e) {
        console.error('Caught error while creating back-end offer', e);
        return response.status(500).json({error:e});
    }
}