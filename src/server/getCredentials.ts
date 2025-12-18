import { getDocumentStore } from '@/badges/store';
import { Response } from 'express'

interface OfferRequest {
    badge:string
}

export async function getCredentials(request: OfferRequest, response: Response) {
    try {
        const store = getDocumentStore();
        return response.status(200).json(store.getDocuments());
    }
    catch (e) {
        return response.status(500).json({error:e});
    }
}