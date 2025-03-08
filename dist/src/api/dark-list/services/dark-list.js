"use strict";
/**
 * dark-list service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService('api::dark-list.dark-list', ({ strapi }) => ({
    async lockCard(id_card, id_transaction) {
        try {
            const entry = await strapi.db.query("api::dark-list.dark-list").create({
                data: {
                    date_time: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
                    card: id_card,
                    transaction: id_transaction
                }
            });
            if (entry) {
                return {
                    "status": 204
                };
            }
            return {
                "status": 400,
                "message": "Card already exists"
            };
        }
        catch (exception) {
            return {
                "status": 500,
                "message": exception
            };
        }
    },
    async verifyCard(id_card) {
        try {
            const entry = await strapi.db.query("api::dark-list.dark-list").findOne({
                where: {
                    "card": id_card
                }
            });
            if (entry) {
                return {
                    status: 200,
                    locked: true
                };
            }
            return {
                status: 200,
                locked: false
            };
        }
        catch (exception) {
            return {
                "status": 500,
                "message": exception
            };
        }
    },
}));
