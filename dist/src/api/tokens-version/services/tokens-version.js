"use strict";
/**
 * tokens-version service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const uuid_1 = require("uuid");
exports.default = strapi_1.factories.createCoreService('api::tokens-version.tokens-version', ({ strapi }) => ({
    async createVersion(lastVersion, pairKeyId) {
        try {
            let entry = null;
            do {
                const uuid = (0, uuid_1.v4)().replace(/-/g, "");
                const querying = await strapi.db.query('api::tokens-version.tokens-version').findOne({
                    where: {
                        uuid: uuid
                    },
                    select: ['uuid']
                });
                if (querying === null) {
                    entry = await strapi.db.query('api::tokens-version.tokens-version').create({
                        data: {
                            uuid: uuid,
                            version: lastVersion + 1,
                            pair_key: pairKeyId,
                            valid_to: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
                        }
                    });
                    return {
                        status: 200,
                        tokensVersion: {
                            uuid: entry.uuid,
                            version: entry.version,
                            pairKey: pairKeyId,
                            valid_to: entry.valid_to
                        }
                    };
                }
            } while (entry === null);
        }
        catch (exception) {
            return {
                'status': 500,
                'error': exception
            };
        }
    },
    async renovateVersion() {
        try {
            const latestEntries = await strapi.db.query('api::tokens-version.tokens-version').findMany({
                orderBy: { createdAt: 'desc' },
                populate: {
                    pair_key: true
                },
                limit: 1
            });
            if (!latestEntries || latestEntries.length == 0) {
                const version = 0;
                const pairGenerated = await strapi.service('api::pair-key.pair-key').generateKeys();
                let tokensVersion = await strapi.service('api::tokens-version.tokens-version').createVersion(version, pairGenerated.id);
                console.log("tokenVersion generated");
                return {
                    status: 200,
                    tokensVersion: {
                        ...tokensVersion.tokensVersion,
                        publicKey: pairGenerated.public_key,
                        privateKey: pairGenerated.private_key,
                        uuidKey: pairGenerated.uuid
                    }
                };
            }
            const latestEntry = latestEntries[0];
            const today = new Date();
            console.log(`This is latestEntry ${JSON.stringify(latestEntry)}`);
            const validToDate = new Date(latestEntry['valid_to']);
            let idPairKey = latestEntry.pair_key.id;
            let publicKey = latestEntry.pair_key.public_key;
            let privateKey = latestEntry.pair_key.private_key;
            let uuidKey = latestEntry.pair_key.uuid;
            const renovatedPairKeys = await strapi.service('api::pair-key.pair-key').renovateKeys(latestEntry.pair_key.public_key);
            if (today >= validToDate || renovatedPairKeys.renovated) {
                if (renovatedPairKeys.renovated) {
                    idPairKey = renovatedPairKeys.keys.id;
                    publicKey = renovatedPairKeys.keys.publicKey;
                    privateKey = renovatedPairKeys.keys.privateKey;
                    uuidKey = renovatedPairKeys.keys.uuid;
                }
                let tokensVersion = await strapi.service('api::tokens-version.tokens-version').createVersion(latestEntry.version, idPairKey);
                return {
                    status: 200,
                    tokensVersion: {
                        ...tokensVersion.tokensVersion,
                        publicKey: publicKey,
                        privateKey: privateKey,
                        uuidKey: uuidKey
                    }
                };
            }
            return {
                status: 200,
                tokensVersion: {
                    uuid: latestEntry.uuid,
                    version: latestEntry.version,
                    pairKey: latestEntry.id,
                    valid_to: latestEntry.valid_to,
                    uuidKey: uuidKey,
                    publicKey: publicKey,
                    privateKey: privateKey,
                }
            };
        }
        catch (exception) {
            console.log(exception);
            return {
                status: 500,
                error: exception
            };
        }
    },
    async retrievePublicKey(tokensVersionUuid) {
        let response = null;
        try {
            const entry = await strapi.db.query("api::tokens-version.tokens-version").findOne({
                where: {
                    uuid: tokensVersionUuid
                },
                populate: {
                    pair_key: true
                }
            });
            if (entry && entry !== null) {
                return {
                    status: 200,
                    publicKey: entry.pair_key.public_key
                };
            }
            return {
                status: 404,
                message: 'Tokens version did not located'
            };
        }
        catch (exception) {
            console.log("Cae en este error");
            console.log(exception);
            response = {
                status: 500,
                message: exception
            };
        }
        return response;
    }
}));
