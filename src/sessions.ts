import { v4 } from "uuid";

export interface Session {
    id:string;
    badgeid?:string;
    badge?:any;
    issuer_session?:string;
    issuer_state?:string;
    offer_url?:string;
    status?:string;
}

const _sessions=new Map<string,Session>();
export function getSessions() {
    return _sessions;
}
export function getSessionById(id:string) {
    let session = _sessions.get(id);
    if (!session) {
        session = {
            id: v4()
        }
        _sessions.set(session.id, session);
    }
    return session;
}
export function updateSession(session:Session)
{
    _sessions.set(session.id, session);
}
