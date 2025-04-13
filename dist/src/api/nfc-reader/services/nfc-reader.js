"use strict";
/**
 * nfc-reader service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService('api::nfc-reader.nfc-reader', ({ strapi }) => ({
    async authNFCReader(userName, pass) {
        console.log(userName);
        console.log(pass);
        //await strapi.db.query('api::shared-key.shared-key').deleteMany({});
        let sharedKeyUuid = "";
        let sharedKey = "";
        let iv = "";
        let sharedKeyId = 0;
        const nfcReader = await strapi.db.query('api::nfc-reader.nfc-reader').findOne({
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
        if (nfcReader !== null) {
            console.log(`This are the NFC reader backed: ${JSON.stringify(nfcReader)}`);
            console.log(nfcReader);
            if (nfcReader.shared_key === null || nfcReader.shared_key === undefined) {
                let responseGenerateSharedKey = await strapi.service('api::shared-key.shared-key').generateSharedKey();
                console.log(`El sharedKey generado: ${responseGenerateSharedKey}`);
                sharedKeyId = responseGenerateSharedKey.id;
                sharedKeyUuid = responseGenerateSharedKey.uuid;
                sharedKey = responseGenerateSharedKey.shared_key;
                iv = responseGenerateSharedKey.iv;
            }
            else {
                console.log(`Renovating shared key`);
                let responseRenovateSharedKey = await strapi.service('api::shared-key.shared-key').renovateSharedKey(nfcReader.shared_key.uuid, nfcReader.id);
                if (responseRenovateSharedKey.renovated) {
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
            if (updateEntry && updateEntry != null) {
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
            };
        }
        return {
            message: 'Not found'
        };
    }
}));
