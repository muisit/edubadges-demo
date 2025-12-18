import Debug from 'debug';
const debug = Debug('endpoint:callback');

import { getDocumentStore } from '@/badges/store';
import { getSessionById } from '@/sessions'
import { Request, Response } from 'express'

interface CallbackRequest {
    user_id?: string;
    state?:string;
}

export async function callback(request: Request<CallbackRequest>, response: Response) {
    try {
        debug('Callback for session', request.params.session);
        debug('Callback user', request.body.user_id,' and state ', request.body.state);
        const session = getSessionById(request.params.session);
        if (!session.issuer_state) {
            debug("no issuer state in the session, not a valid session");
            return response.status(404).json({error:"Could not find session"});
        }
        if (session.issuer_state != request.body.state) {
            debug("state in session does not match that of request", session.issuer_state, request.body.state);
            return response.status(404).json({error:"Could not find session(2)"});
        }

        // retrieve the example badge based on the badge id in the session
        const store = getDocumentStore();
        const badge = store.get(session.badgeid!);

        debug('Callback: returning badge', badge);
        return response.status(200).json(badge);
    }
    catch (e) {
        console.error("Callback error", e);
        return response.status(500).json({error:e});
    }
}