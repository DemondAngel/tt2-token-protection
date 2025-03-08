/**
 * card service
 */

import { factories } from '@strapi/strapi';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export default factories.createCoreService('api::card.card', ({strapi}) => ({
    async createCard(uuid_nfc: string){
        let entry = null;
        let response = null;
        try{

            const nfcReader = await strapi.db.query('api::nfc-reader.nfc-reader').findOne({
                where: {
                    uuid_nfc: uuid_nfc
                },
                select: ['id']
            })

            if(nfcReader !== null){
                do{
                    const uuid = uuidv4();
    
                    const query = await strapi.db.query("api::card.card").findOne({
                        where: {
                            uuid_card: uuid,
                        },
                        select: ['uuid_card']
                    });
    
                    console.log(query);
                    
                    if(query == null || query){
    
                        entry = await strapi.db.query('api::card.card').create({
                            data: {
                                uuid_card: uuid,
                                nfc_reader: nfcReader.id
                            }
                        });
                        response = {
                            'status': 200,
                            'card': {
                                'uuid': uuid
                            }
                        };
                    }
                }
                while(entry == null);
            } else{

                response = {
                    status: 404,
                    message: 'NFC reader does not exists'
                };
            }
        }
        catch(exception) {
            console.log(exception);
            response = {
                'status': 500,
                'error': exception
            }
        }

        return response;
    },

    async generateToken(uuid_nfc: string, uuid_card: string) {

        try{
            const nfcReader = await strapi.db.query('api::nfc-reader.nfc-reader').findOne({
                where: {
                    uuid_nfc: uuid_nfc
                },
                select: ['uuid_nfc'],
                populate: {
                    "pair_key": true
                }
            });

            if(!nfcReader || nfcReader === null)
                return {
                    status: 404,
                    message: 'Does not exists NFC reader'
                };
    
            const card = await strapi.db.query('api::card.card').findOne({
                where: {
                    uuid_card: uuid_card
                },
                select: ['uuid_card'],
                populate: {
                    "nfc_reader": true
                }
            });

            if(!card || card === null)
                return {
                    status: 404,
                    message: 'Card does not exists'
                };
            
            const tokensVersion = await strapi.service('api::tokens-version.tokens-version').renovateVersion();
            console.log(`tokensVersion ${JSON.stringify(tokensVersion)}`);
            if(tokensVersion.status === 200){
                console.log(`Generating payload`);
                const payload = {
                    'uuid_nfc': nfcReader.uuid_nfc,
                    'uuid_nfc_key': nfcReader.pair_key.uuid,
                    'uuid_card': card.uuid_card,
                    'uuid_nfc_register': card.nfc_reader.uuid_nfc,
                    'uuid_tokens_version': tokensVersion.tokensVersion.uuid,
                    'uuid_tokens_version_key': tokensVersion.tokensVersion.uuidKey,
                    'hops': 10
                };
                const privateKey = tokensVersion.tokensVersion.privateKey;
                const token = jwt.sign(payload, privateKey, {
                    algorithm: 'ES256',
                    expiresIn: 60 * 60 * 24 * 365
                });
                
                console.log(`token ${token}`);

                const registerTransaction = await strapi.service('api::transaction.transaction').registerTransaction('CREATED',token,nfcReader.id,card.id);

                if(registerTransaction.status === 204){
                    return {
                        status: 200,
                        token: token,
                        uuid_tokens_version: tokensVersion.tokensVersion.uuid
                    };
                }

                return {
                    status: 500,
                    message: "Transaction not registerd"
                };
            }
            else{
                return {
                    status: 500,
                    error: tokensVersion.error
                };
            }

        }
        catch(exception) {
            console.log(exception);
            return {
                status: 500,
                error: exception
            };
        }

    },

    async validateToken(jwt_card: string, uuid_card: string, uuid_tokens_version: string){

        console.log(`There is the token ${jwt_card}`);
        console.log(`There is the uuid_card ${uuid_card}`);
        try{
            const verifyUsage = await strapi.service("api::transaction.transaction").verifyTokenUsage(jwt_card);

            console.log(`Verify usage ${JSON.stringify(verifyUsage)}`);

            if(verifyUsage.status === 200){
                const retrievePublicKey = await strapi.service("api::tokens-version.tokens-version").retrievePublicKey(uuid_tokens_version);

                if(retrievePublicKey.status === 200){
                    const publicKey = retrievePublicKey.publicKey;
                    
                    try{
                        const decoded:any = jwt.verify(jwt_card, publicKey, {algorithms: ['ES256']});
                        console.log(`Decoded JSON ${JSON.stringify(decoded)}`);

                        if(uuid_card === decoded.uuid_card){
                            
                            const verifyCard = await strapi.service("api::dark-list.dark-list").verifyCard(verifyUsage.id_card);

                            if(verifyCard.locked){
                                return {
                                    status: 403,
                                    message: "Not authorized"
                                }
                            }
                            else{

                                // actualización de la transaccion
                                const entry = await strapi.db.query("api::transaction.transaction").update({
                                    where: {id: verifyUsage.id_transaction },
                                    data:{
                                        action: "USED"
                                    }
                                });

                                return {
                                    status: 204,
                                };
                            }

                        }
                        else {

                            const lockCard = await strapi.service("api::dark-list.dark-list").lockCard(verifyUsage.id_card, verifyUsage.id_transaction);

                            if(lockCard.status === 204){
                                return {
                                    status: 403,
                                    message: "Not authorized"
                                };
                            }
                            else{
                                return {
                                    status: 500,
                                    message: lockCard.message
                                };
                            }
                        }

                    }
                    catch(exception){
                        console.log("token not validated"); // Verificar escenarios
                        const lockCard = await strapi.service("api::dark-list.dark-list").lockCard(verifyUsage.id_card, verifyUsage.id_transaction);

                        if(lockCard.status === 204){
                            return {
                                status: 403,
                                message: "Not authorized"
                            };
                        }
                        else{
                            return {
                                status: 500,
                                message: lockCard.message
                            };
                        }
                    }
                    
                }
                else if(retrievePublicKey.status === 404) {
                    return {
                        status: 404,
                        message: 'Key not found'
                    };
                }
                else {
                    return {
                        status: 500,
                        message: retrievePublicKey.message
                    };
                }

            }
            else if(verifyUsage.status === 400){
                const lockCard = await strapi.service("api::dark-list.dark-list").lockCard(verifyUsage.id_card, verifyUsage.id_transaction);
                console.log("locked");
                if(lockCard.status === 204){
                    return {
                        status: 403,
                        message: "Not authorized"
                    };
                }
                else{
                    return {
                        status: 500,
                        message: lockCard.message
                    };
                }

            }
            else if(verifyUsage.status === 404){
                return {
                    status: 404,
                    message: "token do not encountered"
                };
            }
            else{
                return {
                    status: 500,
                    message: verifyUsage.message
                };
            }
        }
        catch(exception){
            console.log(exception);
            return {
                status: 500,
                message: exception
            };
        }
    }
}));
