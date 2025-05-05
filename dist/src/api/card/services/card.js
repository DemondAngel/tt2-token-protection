"use strict";
/**
 * card service
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.default = strapi_1.factories.createCoreService('api::card.card', ({ strapi }) => ({
    async createCard(nfcUuid) {
        let entry = null;
        let response = null;
        try {
            const nfcReader = await strapi.db.query('api::nfc-reader.nfc-reader').findOne({
                where: {
                    uuid: nfcUuid
                },
                select: ['id']
            });
            if (nfcReader !== null) {
                do {
                    const uuid = (0, uuid_1.v4)().replace(/-/g, "");
                    const query = await strapi.db.query("api::card.card").findOne({
                        where: {
                            uuid: uuid,
                        },
                        select: ['uuid']
                    });
                    console.log(query);
                    if (query == null || query) {
                        entry = await strapi.db.query('api::card.card').create({
                            data: {
                                uuid: uuid,
                                nfc_reader: nfcReader.id
                            }
                        });
                        let responseGenerateToken = await this.generateToken(nfcUuid, uuid);
                        if (responseGenerateToken.status !== 200) {
                            return responseGenerateToken;
                        }
                        response = {
                            ...responseGenerateToken,
                            'card': {
                                'uuid': uuid
                            }
                        };
                    }
                } while (entry == null);
            }
            else {
                response = {
                    status: 404,
                    message: 'NFC reader does not exists'
                };
            }
        }
        catch (exception) {
            console.log(exception);
            response = {
                'status': 500,
                'error': exception
            };
        }
        return response;
    },
    async generateToken(nfcUuid, cardUuid) {
        try {
            const nfcReader = await strapi.db.query('api::nfc-reader.nfc-reader').findOne({
                where: {
                    uuid: nfcUuid
                },
                select: ['uuid'],
                populate: {
                    "shared_key": true
                }
            });
            if (!nfcReader || nfcReader === null)
                return {
                    status: 404,
                    message: 'Does not exists NFC reader'
                };
            const card = await strapi.db.query('api::card.card').findOne({
                where: {
                    uuid: cardUuid
                },
                select: ['uuid'],
                populate: {
                    "nfc_reader": true
                }
            });
            if (!card || card === null)
                return {
                    status: 404,
                    message: 'Card does not exists'
                };
            const tokensVersion = await strapi.service('api::tokens-version.tokens-version').renovateVersion();
            console.log(`tokensVersion ${JSON.stringify(tokensVersion)}`);
            if (tokensVersion.status === 200) {
                console.log(`Generating payload`);
                const payload = {
                    'cardUuid': card.uuid,
                    'tokenVersionUuid': tokensVersion.tokensVersion.uuid,
                    'sharedKeyUuid': nfcReader.shared_key.uuid,
                };
                const privateKey = tokensVersion.tokensVersion.privateKey;
                const token = jsonwebtoken_1.default.sign(payload, privateKey, {
                    algorithm: 'ES256',
                    expiresIn: 60 * 60 * 24 * 365
                });
                const tokenDivided = await this.divideTokenInto256Chars(token);
                console.log(`token ${token}`);
                const registerTransaction = await strapi.service('api::transaction.transaction').registerTransaction('CREATED', token, nfcReader.id, card.id);
                if (registerTransaction.status === 204) {
                    console.log("Se regreso token");
                    return {
                        status: 200,
                        token: tokenDivided,
                        tokensVersionUuid: tokensVersion.tokensVersion.uuid
                    };
                }
                return {
                    status: 500,
                    message: "Transaction not registerd"
                };
            }
            else {
                return {
                    status: 500,
                    error: tokensVersion.error
                };
            }
        }
        catch (exception) {
            console.log(exception);
            return {
                status: 500,
                error: exception
            };
        }
    },
    async divideTokenInto256Chars(token) {
        const chunkSize = 255;
        const chunks = [];
        for (let i = 0; i < token.length; i += chunkSize) {
            chunks.push(token.substring(i, i + chunkSize));
        }
        return chunks;
    },
    async validateToken(jwtCard, cardUuid, tokensVersionUuid, nfcUuid) {
        console.log(`There is the token ${jwtCard}`);
        console.log(`There is the uuid_card ${cardUuid}`);
        try {
            const verifyUsage = await strapi.service("api::transaction.transaction").verifyTokenUsage(jwtCard);
            console.log(`Verify usage ${JSON.stringify(verifyUsage)}`);
            if (verifyUsage.status === 200) {
                const retrievePublicKey = await strapi.service("api::tokens-version.tokens-version").retrievePublicKey(tokensVersionUuid);
                if (retrievePublicKey.status === 200) {
                    const publicKey = retrievePublicKey.publicKey;
                    try {
                        const decoded = jsonwebtoken_1.default.verify(jwtCard, publicKey, { algorithms: ['ES256'] });
                        console.log(`Decoded JSON ${JSON.stringify(decoded)}`);
                        if (cardUuid === decoded.cardUuid) {
                            const verifyCard = await strapi.service("api::dark-list.dark-list").verifyCard(verifyUsage.id_card);
                            if (verifyCard.locked) {
                                return {
                                    status: 403,
                                    message: "Not authorized"
                                };
                            }
                            else {
                                // actualización de la transaccion
                                const entry = await strapi.db.query("api::transaction.transaction").update({
                                    where: { id: verifyUsage.id_transaction },
                                    data: {
                                        action: "USED"
                                    }
                                });
                                console.log("Si llega a generar el token cuando se esta validando");
                                let responseGenerateToken = await this.generateToken(nfcUuid, cardUuid);
                                return responseGenerateToken;
                            }
                        }
                        else {
                            const lockCard = await strapi.service("api::dark-list.dark-list").lockCard(verifyUsage.id_card, verifyUsage.id_transaction);
                            if (lockCard.status === 204) {
                                return {
                                    status: 403,
                                    message: "Not authorized"
                                };
                            }
                            else {
                                return {
                                    status: 500,
                                    message: lockCard.message
                                };
                            }
                        }
                    }
                    catch (exception) {
                        console.log("token not validated"); // Verificar escenarios
                        const lockCard = await strapi.service("api::dark-list.dark-list").lockCard(verifyUsage.id_card, verifyUsage.id_transaction);
                        if (lockCard.status === 204) {
                            return {
                                status: 403,
                                message: "Not authorized"
                            };
                        }
                        else {
                            return {
                                status: 500,
                                message: lockCard.message
                            };
                        }
                    }
                }
                else if (retrievePublicKey.status === 404) {
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
            else if (verifyUsage.status === 400) {
                const lockCard = await strapi.service("api::dark-list.dark-list").lockCard(verifyUsage.id_card, verifyUsage.id_transaction);
                console.log("locked");
                if (lockCard.status === 204) {
                    return {
                        status: 403,
                        message: "Not authorized"
                    };
                }
                else {
                    return {
                        status: 500,
                        message: lockCard.message
                    };
                }
            }
            else if (verifyUsage.status === 404) {
                return {
                    status: 404,
                    message: "token do not encountered"
                };
            }
            else {
                return {
                    status: 500,
                    message: verifyUsage.message
                };
            }
        }
        catch (exception) {
            console.log(exception);
            return {
                status: 500,
                message: exception
            };
        }
    }
}));
