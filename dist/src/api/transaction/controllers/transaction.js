"use strict";
/**
 * transaction controller
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const ajv_1 = __importDefault(require("ajv"));
const transaction_token_generate_json_1 = __importDefault(require("../schemas/transaction-token-generate.json"));
const transaction_token_validate_json_1 = __importDefault(require("../schemas/transaction-token-validate.json"));
const ajv = new ajv_1.default();
const validateGeneration = ajv.compile(transaction_token_generate_json_1.default);
const validateValidation = ajv.compile(transaction_token_validate_json_1.default);
exports.default = strapi_1.factories.createCoreController('api::transaction.transaction', ({ strapi }) => ({
    async generate(ctx) {
        const valid = validateGeneration(ctx.request.body);
        if (!valid) {
            return ctx.badRequest('Validation Error', { errors: validateGeneration.errors });
        }
        try {
            ctx.body = 'ok';
        }
        catch (err) {
            ctx.body = err;
        }
    },
    async validate(ctx) {
        const valid = validateValidation(ctx.request.body);
        if (!valid) {
            return ctx.badRequest('Validation Error', { errors: validateValidation.errors });
        }
        try {
            ctx.body = 'ok';
        }
        catch (err) {
            ctx.body = err;
        }
    },
    async register(ctx) {
        try {
            ctx.body = 'ok';
        }
        catch (err) {
            ctx.body = err;
        }
    }
}));
