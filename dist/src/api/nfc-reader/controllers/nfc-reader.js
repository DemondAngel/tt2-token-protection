"use strict";
/**
 * nfc-reader controller
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const auth_nfcreader_json_1 = __importDefault(require("../schemas/auth-nfcreader.json"));
const strapi_1 = require("@strapi/strapi");
const ajv = new ajv_1.default();
const validate = ajv.compile(auth_nfcreader_json_1.default);
exports.default = strapi_1.factories.createCoreController('api::nfc-reader.nfc-reader', ({ strapi }) => ({
    async authNfcReader(ctx) {
        const valid = validate(ctx.request.body);
        if (!valid) {
            return ctx.badRequest('Validation Error', { errors: validate.errors });
        }
        let body = ctx.request.body;
        try {
            let responseService = await strapi.service('api::nfc-reader.nfc-reader').authNFCReader(body.username, body.pass);
            console.log(responseService);
            return responseService;
        }
        catch (err) {
            console.log(`There was an error ${err}`);
            ctx.body = err;
        }
    }
}));
