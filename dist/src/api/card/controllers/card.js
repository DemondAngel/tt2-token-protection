"use strict";
/**
 * card controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::card.card', ({ strapi }) => ({
    async generate(ctx) {
        try {
            ctx.body = 'ok';
        }
        catch (err) {
            ctx.body = err;
        }
    },
    async validate(ctx) {
        try {
            ctx.body = 'ok';
        }
        catch (err) {
            ctx.body = err;
        }
    }
}));
