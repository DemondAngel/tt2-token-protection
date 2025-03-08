"use strict";
/**
 * pair-key controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::pair-key.pair-key', ({ strapi }) => ({
    async create(ctx) {
        try {
            let responseService = await strapi.service('api::pair-key.pair-key').generateKeys();
            console.log(responseService);
            ctx.body = responseService;
        }
        catch (err) {
            console.error(`Error: ${err}`);
            ctx.body = err;
        }
    },
    async renovateKey(ctx) {
        let public_key = ctx.request.body.public_key;
        try {
            let responseService = await strapi.service('api::pair-key.pair-key').renovateKeys(public_key);
            console.log(responseService);
            ctx.body = responseService;
        }
        catch (err) {
            console.error(`Error: ${err}`);
            ctx.body = err;
        }
    }
}));
