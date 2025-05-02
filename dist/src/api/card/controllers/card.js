"use strict";
/**
 * card controller
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ajv_1 = __importDefault(require("ajv"));
const create_card_schema_json_1 = __importDefault(require("../schemas/create-card-schema.json"));
const generate_card_schema_json_1 = __importDefault(require("../schemas/generate-card-schema.json"));
const validate_card_shema_json_1 = __importDefault(require("../schemas/validate-card-shema.json"));
const strapi_1 = require("@strapi/strapi");
const ajv = new ajv_1.default();
const validateCreate = ajv.compile(create_card_schema_json_1.default);
const validateGenerate = ajv.compile(generate_card_schema_json_1.default);
const validateValidate = ajv.compile(validate_card_shema_json_1.default);
exports.default = strapi_1.factories.createCoreController('api::card.card', ({ strapi }) => ({
    async create(ctx) {
        const valid = validateCreate(ctx.request.body);
        if (!valid) {
            return ctx.badRequest('Validation Error', { errors: validateCreate.errors });
        }
        let body = ctx.request.body;
        const nfcUuid = body.nfcUuid;
        try {
            let responseCreateService = await strapi.service('api::card.card').createCard(nfcUuid);
            if (responseCreateService.status === 200) {
                return responseCreateService;
            }
            else if (responseCreateService.status === 404) {
                console.log("Return error");
                ctx.status = 404;
                ctx.body = responseCreateService.message;
            }
            else {
                ctx.status = 500;
                ctx.body = responseCreateService;
            }
        }
        catch (err) {
            console.log(err);
            ctx.body = err;
        }
    },
    async generate(ctx) {
        const valid = validateGenerate(ctx.request.body);
        if (!valid) {
            return ctx.badRequest('Validation Error', { errors: validateGenerate.errors });
        }
        let body = ctx.request.body;
        const nfcUuid = body.nfcUuid;
        const cardUuid = body.cardUuid;
        try {
            let responseCreateService = await strapi.service('api::card.card').generateToken(nfcUuid, cardUuid);
            if (responseCreateService.status === 200) {
                console.log(responseCreateService);
                return responseCreateService;
            }
            else if (responseCreateService.status === 404) {
                ctx.status = 404;
                ctx.body = responseCreateService.error;
            }
            else {
                ctx.status = 500;
                ctx.body = responseCreateService.error;
            }
        }
        catch (err) {
            console.log(err);
            ctx.body = err;
        }
    },
    async validate(ctx) {
        console.log(`Esto es lo que esta llegando al controlador de validate ${JSON.stringify(ctx.request.body)}`);
        const valid = validateValidate(ctx.request.body);
        if (!valid) {
            return ctx.badRequest('Validation Error', { errors: validateGenerate.errors });
        }
        try {
            const body = ctx.request.body;
            let token = "";
            for (let i = 0; i < body.jwtCard.length; i++)
                token += body.jwtCard[i];
            const responseValidation = await strapi.service("api::card.card").validateToken(token, body.cardUuid, body.tokensVersionUuid, body.nfcUuid);
            return responseValidation;
        }
        catch (exception) {
            ctx.body = exception;
        }
    }
}));
