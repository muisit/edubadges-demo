import { getDocumentStore } from '@/badges/store';
import { getSessionById } from '@/sessions'
import { Request, Response } from 'express'

interface CallbackRequest {
    user_id?: string;
    state?:string;
}

export async function callback(request: Request<CallbackRequest>, response: Response) {
    try {
        const session = getSessionById(request.params.session);
        if (!session.issuer_state) {
            return response.status(404).json({error:"Could not find session"});
        }
        if (session.issuer_state != request.body.state) {
            return response.status(404).json({error:"Could not find session(2)"});
        }

        // retrieve the example badge based on the badge id in the session
        const store = getDocumentStore();
        const badge = store.get(session.badgeid!);

        const data = {
            credential: badge
        };

        return response.status(200).json(data);
    }
    catch (e) {
        return response.status(500).json({error:e});
    }
}