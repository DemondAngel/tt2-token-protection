/**
 * card controller
 */

import Ajv, { ErrorObject} from 'ajv';
import createSchema from '../schemas/create-card-schema.json';
import generateCardSchema from '../schemas/generate-card-schema.json';
import validateCardSchema from '../schemas/validate-card-shema.json';

import { factories } from '@strapi/strapi'

const ajv = new Ajv();
const validateCreate = ajv.compile(createSchema);
const validateGenerate = ajv.compile(generateCardSchema);
const validateValidate = ajv.compile(validateCardSchema);

export default factories.createCoreController('api::card.card', ({strapi}) => ({
    
    async create(ctx: any) {

        const valid = validateCreate(ctx.request.body);

        if(!valid) {
            return ctx.badRequest('Validation Error', {errors: validateCreate.errors});
        }

        let body = ctx.request.body;

        const uuid_nfc: string = body.uuid_nfc;
        try{
            
            let responseCreateService = await strapi.service('api::card.card').createCard(uuid_nfc);

            if(responseCreateService.status === 200){
                return responseCreateService;
            }
            else if(responseCreateService.status === 404){
                console.log("Return error")
                ctx.status = 404;
                ctx.body = responseCreateService.message;
            }
            else{
                ctx.status = 500;
                ctx.body= responseCreateService;
            }
        }
        catch(err){
            ctx.body = err;
        }
    },

    async generate(ctx: any){


        const valid = validateGenerate(ctx.request.body);

        if(!valid) {
            return ctx.badRequest('Validation Error', {errors: validateGenerate.errors});
        }

        let body = ctx.request.body;

        const uuid_nfc: string = body.uuid_nfc;
        const uuid_card: string = body.uuid_card;

        try{
            
            let responseCreateService = await strapi.service('api::card.card').generateToken(uuid_nfc, uuid_card);

            if(responseCreateService.status === 200){
                console.log(responseCreateService);
                return responseCreateService;
            }
            else if(responseCreateService.status === 404){
                ctx.status = 404;
                ctx.body = responseCreateService.error;
            }
            else{
                ctx.status = 500;
                ctx.body= responseCreateService.error;
            }
        }
        catch(err){
            ctx.body = err;
        }
    },

    async validate(ctx: any){

        const valid = validateValidate(ctx.request.body);

        if(!valid) {
            return ctx.badRequest('Validation Error', {errors: validateGenerate.errors});
        }

        try{
            const body = ctx.request.body 

            const responseValidation = await strapi.service("api::card.card").validateToken(body.jwt_card, body.uuid_card, body.uuid_tokens_version);

            return responseValidation;

        }
        catch(exception) {
            ctx.body = exception;

        }

    }
}));
