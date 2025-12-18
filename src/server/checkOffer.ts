import Debug from 'debug';
const debug = Debug('endpoint:checkOffer');

import { getSessionById, updateSession } from '@/sessions'
import { Response } from 'express'

interface OfferRequest {
    id:string;
}

export async function checkOffer(request: OfferRequest, response: Response) {
    try {
        debug("checking offer with back-end for session:", request.id);
        const session = getSessionById(request.id);
        if (!session.issuer_state) {
            debug("no session issuer_state, session not found");
            return response.status(404).json({error:"Could not find session"});
        }

        // create the offer in the back-end
        const data = {
            id: session.issuer_state
        };
        debug("calling backend for check-offer with state", data);
        const res = await fetch(process.env.ISSUER_URL + '/api/check-offer', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + process.env.ISSUER_TOKEN
            },
            body: JSON.stringify(data),
        });

        if (!(res && res.status && res.status == 200)) {
            debug("backend returns error", res);
            return response.status(500).json({error:"Could not check offer on remote issuer"});
        }

        const json = await res.json();
        debug("backend returns ", json);
        session.status = json.status;
        updateSession(session);

        debug("returning offer status", session.status);
        return response.status(200).json({status:session.status});
    }
    catch (e) {
        return response.status(500).json({error:e});
    }
}