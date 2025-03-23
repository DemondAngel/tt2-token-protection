/**
 * pair-key service
 */

import { factories } from '@strapi/strapi';
import { v4 as uuidv4 } from 'uuid';
import { generateKeyPairSync } from "crypto";

export default factories.createCoreService('api::pair-key.pair-key', ({strapi}) => ({
    async generateKeys(): Promise<PairKey | null | undefined | any> {
        console.log("generateKeys");

        const { privateKey, publicKey } = generateKeyPairSync("ec", {
            namedCurve: "P-256",
            publicKeyEncoding: { type: "spki", format: "pem"},
            privateKeyEncoding: { type: "pkcs8", format: "pem"}
        });

        let response: PairKey | null | undefined | any = null;

        try{
            let entry: PairKey | null | undefined = null;
            do{
                console.log("comienza consulta");
                const uuid = uuidv4();
                entry = await strapi.db.query('api::pair-key.pair-key').findOne({
                    select: ['uuid', 'private_key'],
                    where: {private_key: privateKey, uuid: uuid}
                });

                if(entry === null){
                    console.log("crea llaves");
                    entry = await strapi.db.query('api::pair-key.pair-key').create({
                        data: {
                          uuid: uuid,
                          private_key: privateKey,
                          public_key: publicKey,
                          valid_to: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
                        },
                      });

                    if(entry !== null) {
                        response = entry;
                        break;
                    }  
                }

            }
            while(entry !== null);
            
        }
        catch(error){
            console.error(error);
            response = error;
        }

        return response;
    },

    async renovateKeys(public_key: string){
        console.log("Public key");
        console.log(public_key);
        const entry: PairKey | null | undefined = await strapi.db.query('api::pair-key.pair-key').findOne({
            where: {
                public_key: {
                    $eq: public_key,
                }
            }
        });

        if(entry !== null && entry !== undefined ){
            const today = new Date();
            const validToDate = new Date(entry['valid_to']);

            if(today >= validToDate){
                let responseGenerateKeys: PairKey | null | undefined | any = await this.generateKeys();
                
                console.log(`Id Generado ${responseGenerateKeys.id}`);

                return {
                    renovated: true,
                    keys: {
                        'id': responseGenerateKeys.id,
                        'uuid': responseGenerateKeys.uuid,
                        "privateKey": responseGenerateKeys.private_key,
                        "publicKey": responseGenerateKeys.public_key,
                    }
                };
            }

            return {
                renovated: false,
                keys: {
                    'id': entry.id,
                    'uuid': entry.uuid,
                    "privateKey": entry.private_key,
                    "publicKey": entry.public_key,
                }
            }
        }

        return null;
    }

}));
