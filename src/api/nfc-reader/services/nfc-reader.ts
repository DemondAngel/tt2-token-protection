/**
 * nfc-reader service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::nfc-reader.nfc-reader', ({strapi}) => ({
    
    async authNFCReader(user: string, pass: string) {
        console.log(user);
        console.log(pass);
        const nfcReader = await strapi.db.query('api::nfc-reader.nfc-reader').findOne({
            'where': {
                '$and': [
                    {
                        'user': user,
                    },
                    {
                        'pass': pass
                    }
                ]
            },
            'populate': {
                'pair_key': true
            }
        });
        
        if(nfcReader !== null){ 
            console.log(`This are the NFC reader backed: ${JSON.stringify(nfcReader)}`);
            console.log(nfcReader);

            let uuidKey = nfcReader.pair_key.uuid;
            let publicKey = nfcReader.pair_key.public_key;
            let privateKey = nfcReader.pair_key.private_key;

            let responseRenovateKeys = await strapi.service('api::pair-key.pair-key').renovateKeys(nfcReader.pair_key.public_key);

            if(responseRenovateKeys.renovated){
                console.log("Keys renovating store them");

                uuidKey = responseRenovateKeys.keys.uuid;
                publicKey = responseRenovateKeys.keys.publicKey;
                privateKey = responseRenovateKeys.keys.privateKey;
                
                console.log(`Este es responseRenovateKeys ${JSON.stringify(responseRenovateKeys)}`);

                const updateEntry = await strapi.db.query('api::nfc-reader.nfc-reader').update({
                    'where': {
                        uuid_nfc: nfcReader.uuid_nfc
                    },
                    data: {
                        pair_key: responseRenovateKeys.keys.id
                    }
                });
                
                if(updateEntry && updateEntry != null){
                    console.log("nfc_reader_updated");
                }
            }

            const jwt = strapi.plugin('users-permissions').service('jwt').issue({
                'nfc-reader': {
                    'user': nfcReader.user,
                    'uuid': nfcReader.uuid_nfc,
                    'uuid_pair_key': uuidKey
                }
            });
            
            console.log(jwt);

            return {
                'token': jwt,
                'public_key': publicKey,
                'private_key': privateKey,
                'uuid_pair_key': uuidKey
            }
        }

        return {
            message: 'Not found'
        };
    }
}));
