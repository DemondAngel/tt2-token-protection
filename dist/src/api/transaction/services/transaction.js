"use strict";
/**
 * transaction service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const uuid_1 = require("uuid");
exports.default = strapi_1.factories.createCoreService('api::transaction.transaction', ({ strapi }) => ({
    async registerTransaction(action, token, nfcReaderId, cardId) {
        let entry = null;
        let response = null;
        do {
            const uuid = (0, uuid_1.v4)();
            const query = await strapi.db.query("api::card.card").findOne({
                where: {
                    uuid: uuid,
                },
                select: ['uuid']
            });
            console.log(query);
            if (query == null || query) {
                entry = await strapi.db.query('api::transaction.transaction').create({
                    data: {
                        uuid: uuid,
                        nfc_reader: nfcReaderId,
                        card: cardId,
                        token: token,
                        action: action,
                    }
                });
                response = {
                    'status': 204
                };
            }
        } while (entry === null);
        return response;
    },
    async verifyTokenUsage(token) {
        let response = null;
        try {
            const entry = await strapi.db.query("api::transaction.transaction").findOne({
                where: {
                    token: token
                },
                populate: {
                    "card": true
                },
                select: ['action', 'token', 'id']
            });
            if (entry && entry !== null) {
                if (entry.action === 'CREATED') {
                    return {
                        status: 200,
                        id_transaction: entry.id,
                        id_card: entry.card.id,
                        message: "Not used"
                    };
                }
                return {
                    status: 400,
                    id_transaction: entry.id,
                    id_card: entry.card.id,
                    message: "Used"
                };
            }
            return {
                status: 404,
                message: "Token does not located"
            };
        }
        catch (exception) {
            console.log(exception);
            response = {
                status: 500,
                message: exception
            };
        }
        return response;
    },
    async lockTokenUsage(token) {
        let response = null;
        try {
            const entry = await strapi.db.query("api::transaction.transaction").findOne({
                where: {
                    token: token
                },
                select: ['id']
            });
            const updateEntry = await strapi.db.query("api::transaction.transaction").update({
                where: { id: entry.id },
                data: {
                    action: "DETECTED"
                }
            });
            return updateEntry;
        }
        catch (exception) {
            console.log(exception),
                response = {
                    status: 500,
                    message: exception
                };
        }
        return response;
    }
}));
