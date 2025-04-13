/**
 * nfc-reader service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::nfc-reader.nfc-reader', ({strapi}) => ({
    
    async authNFCReader(userName: string, pass: string) {
        console.log(userName);
        console.log(pass);
        //await strapi.db.query('api::shared-key.shared-key').deleteMany({});
        let sharedKeyUuid: string = "";
        let sharedKey: string = "";
        let iv: string = "";
        let sharedKeyId: number = 0;
        const nfcReader: NFCReader = await strapi.db.query('api::nfc-reader.nfc-reader').findOne({
            'where': {
                '$and': [
                    {
                        'user_name': userName,
                    },
                    {
                        'pass': pass
                    }
                ]
            },
            'populate': {
                'shared_key': true
            }
        });
        
        if(nfcReader !== null){ 
            console.log(`This are the NFC reader backed: ${JSON.stringify(nfcReader)}`);
            console.log(nfcReader);
            
            if(nfcReader.shared_key === null || nfcReader.shared_key === undefined){
                let responseGenerateSharedKey = await strapi.service('api::shared-key.shared-key').generateSharedKey();
                console.log(`El sharedKey generado: ${responseGenerateSharedKey}`);
                sharedKeyId = responseGenerateSharedKey.id;
                sharedKeyUuid = responseGenerateSharedKey.uuid;
                sharedKey = responseGenerateSharedKey.shared_key;
                iv = responseGenerateSharedKey.iv;
            }
            else{
                console.log(`Renovating shared key`);
                let responseRenovateSharedKey = await strapi.service('api::shared-key.shared-key').renovateSharedKey(nfcReader.shared_key.uuid, nfcReader.id);

                if(responseRenovateSharedKey.renovated){
                    console.log("Keys renovating store them");
                }
                sharedKeyId = responseRenovateSharedKey.sharedKey.id;
                sharedKeyUuid = responseRenovateSharedKey.sharedKey.uuid;
                sharedKey = responseRenovateSharedKey.sharedKey.shared_key;
                iv = responseRenovateSharedKey.sharedKey.iv;
            }

            const updateEntry = await strapi.db.query('api::nfc-reader.nfc-reader').update({
                'where': {
                    uuid: nfcReader.uuid
                },
                data: {
                    shared_key: sharedKeyId
                }
            });
            
            if(updateEntry && updateEntry != null){
                console.log("nfc_reader_updated");
            }

            const jwt = strapi.plugin('users-permissions').service('jwt').issue({
                'nfcReader': {
                    'uuid': nfcReader.uuid
                }
            }, { expiresIn: '1h' });
            
            console.log(jwt);

            return {
                'token': jwt,
                //'public_key': publicKey,
                //'private_key': privateKey,
                'NFCReaderUuid': nfcReader.uuid,
                'sharedKeyUuid': sharedKeyUuid,
                'sharedKey': sharedKey,
                'iv': iv
            }
        }

        return {
            message: 'Not found'
        };
    }
}));
