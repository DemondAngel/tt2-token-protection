/**
 * pair-key service
 */

import { factories } from '@strapi/strapi';
import { v4 as uuidv4 } from 'uuid';
import { generateKeyPairSync } from "crypto";

export default factories.createCoreService('api::pair-key.pair-key', ({strapi}) => ({
    async generateKeys() {
        console.log("generateKeys");

        const { privateKey, publicKey } = generateKeyPairSync("ec", {
            namedCurve: "P-256",
            publicKeyEncoding: { type: "spki", format: "pem"},
            privateKeyEncoding: { type: "pkcs8", format: "pem"}
        });

        let response = null;
        try{
            let entry = null;
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
                        response = {
                            'id': entry.id,
                            "uuid": uuid,
                            "privateKey": privateKey,
                            "publicKey": publicKey
                        };
                    }  
                }

            }
            while(entry === null);
            
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
        const entry = await strapi.db.query('api::pair-key.pair-key').findOne({
            where: {
                public_key: {
                    $eq: public_key,
                }
            }
        });

        if(entry !== null && entry !== '' ){
            const today = new Date();
            const validToDate = new Date(entry['valid_to']);

            if(today >= validToDate){
                let responseGenerateKeys= await strapi.service('api::pair-key.pair-key').generateKeys();
                
                console.log(`Id Generado ${responseGenerateKeys['id']}`);

                return {
                    renovated: true,
                    keys: {
                        'id': responseGenerateKeys['id'],
                        'uuid': responseGenerateKeys['uuid'],
                        "privateKey": responseGenerateKeys['privateKey'],
                        "publicKey": responseGenerateKeys['publicKey'],
                    }
                };
            }

            return {
                renovated: false,
                keys: {
                    'id': entry['id'],
                    'uuid': entry['uuid'],
                    "privateKey": entry['private_key'],
                    "publicKey": entry['public_key'],
                }
            }
        }

        return null;
    }

}));
