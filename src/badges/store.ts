import fs from 'fs';

interface Documents {
  [x:string]: any;
}

const BADGEPATH='./src/badges';

class DocumentStore {
    private configuration:Documents = {};

    private async readFromFile()
    {
        try {
            const fileNames = fs.readdirSync(BADGEPATH).filter((file:string) => file.match(/\.json$/));
            fileNames.forEach((fileName: string) => {
                let typeName = fileName.match(/(^.*?)\.json/)
                if (typeName && typeName[1] && typeName[1].length) {
                    try {
                        const object = JSON.parse(fs.readFileSync(BADGEPATH + '/' + fileName, 'utf8').toString());
                        this.configuration[typeName[1]] = object;
                    }
                    catch (e) {
                        console.error("Error reading json file ", fileName);
                    }
                }
            });
        }
        catch (e) {
            console.error("Error reading badges", e);
        }
    }

    public async init()
    {
        await this.readFromFile();
    }

    public get(key:string) {
        if (this.configuration[key]) {
            return this.configuration[key];
        }
        return null;
    }

    public getDocuments() {
        const keys = Object.keys(this.configuration);
        const retval:any = {};
        for (const key of keys) {
            retval[key] = this.configuration[key].credentialSubject.achievement.name;
        }
        return retval;
    }
}

var _documentStore: DocumentStore = new DocumentStore();
export const getDocumentStore = (): DocumentStore => _documentStore;
