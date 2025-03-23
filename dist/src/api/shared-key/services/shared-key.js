"use strict";
/**
 * shared-key service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
exports.default = strapi_1.factories.createCoreService('api::shared-key.shared-key', ({ strapi }) => ({
    async generateSharedKey() {
        let response = null;
        try {
            let entry = null;
            const pairKey = await strapi.service('api::pair-key.pair-key').generateKeys();
            console.log(`Este es el pairKey: ${JSON.stringify(pairKey)}`);
            do {
                const bigUuid = (0, uuid_1.v4)();
                const uuid = (0, crypto_1.createHash)('sha256').update(bigUuid).digest('hex').substring(0, 16);
                const randomSalt = (0, crypto_1.randomBytes)(16);
                const sharedKey = (0, crypto_1.createHash)('sha256')
                    .update(pairKey.private_key)
                    .update(uuid)
                    .update(randomSalt)
                    .digest('hex');
                entry = await strapi.db.query('api::shared-key.shared-key').findOne({
                    select: ['uuid', 'shared_key'],
                    where: { shared_key: sharedKey, uuid: uuid }
                });
                if (entry === null) {
                    console.log("Registra SharedKey");
                    entry = await strapi.db.query("api::shared-key.shared-key").create({
                        data: {
                            uuid: uuid,
                            shared_key: sharedKey,
                            pair_key: pairKey.id,
                            valid_to: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
                        }
                    });
                    console.log("Se ha registrado exitosamente SharedKey");
                    if (entry !== null) {
                        response = entry;
                        break;
                    }
                }
            } while (entry !== null);
        }
        catch (error) {
            console.error(error);
            response = error;
        }
        return response;
    },
    async renovateSharedKey(sharedKeyUuid) {
        console.log(`Este es el sharedKeyUuid: ${sharedKeyUuid}`);
        const entry = await strapi.db.query("api::shared-key.shared-key").findOne({
            where: {
                uuid: sharedKeyUuid
            },
            populate: {
                pair_key: true,
                nfc_reader: true,
            }
        });
        if (entry !== null && entry !== undefined) {
            const today = new Date();
            const validToDateShared = new Date(entry.valid_to);
            const validToDatePairKey = new Date(entry.pair_key.valid_to);
            if (today >= validToDateShared || today >= validToDatePairKey) {
                let sharedKeyGenerated = await this.generateSharedKey();
                return {
                    renovated: true,
                    sharedKey: sharedKeyGenerated
                };
            }
            return {
                renovated: false,
                sharedKey: entry
            };
        }
    }
}));
