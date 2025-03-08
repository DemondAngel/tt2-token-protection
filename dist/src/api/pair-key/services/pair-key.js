"use strict";
/**
 * pair-key service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
exports.default = strapi_1.factories.createCoreService('api::pair-key.pair-key', ({ strapi }) => ({
    async generateKeys() {
        console.log("generateKeys");
        const { privateKey, publicKey } = (0, crypto_1.generateKeyPairSync)("ec", {
            namedCurve: "P-256",
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" }
        });
        let response = null;
        try {
            let entry = null;
            do {
                console.log("comienza consulta");
                const uuid = (0, uuid_1.v4)();
                entry = await strapi.db.query('api::pair-key.pair-key').findOne({
                    select: ['uuid', 'private_key'],
                    where: { private_key: privateKey, uuid: uuid }
                });
                if (entry === null) {
                    console.log("crea llaves");
                    entry = await strapi.db.query('api::pair-key.pair-key').create({
                        data: {
                            uuid: uuid,
                            private_key: privateKey,
                            public_key: publicKey,
                            valid_to: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
                        },
                    });
                    if (entry !== null) {
                        response = {
                            'id': entry.id,
                            "uuid": uuid,
                            "privateKey": privateKey,
                            "publicKey": publicKey
                        };
                    }
                }
            } while (entry === null);
        }
        catch (error) {
            console.error(error);
            response = error;
        }
        return response;
    },
    async renovateKeys(public_key) {
        console.log("Public key");
        console.log(public_key);
        const entry = await strapi.db.query('api::pair-key.pair-key').findOne({
            where: {
                public_key: {
                    $eq: public_key,
                }
            }
        });
        if (entry !== null && entry !== '') {
            const today = new Date();
            const validToDate = new Date(entry['valid_to']);
            if (today >= validToDate) {
                let responseGenerateKeys = await strapi.service('api::pair-key.pair-key').generateKeys();
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
            };
        }
        return null;
    }
}));
