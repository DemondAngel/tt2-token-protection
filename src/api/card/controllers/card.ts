/**
 * card controller
 */

import Ajv from 'ajv';
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

        const nfcUuid: string = body.nfcUuid;
        try{
            
            let responseCreateService = await strapi.service('api::card.card').createCard(nfcUuid);

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
            console.log(err);
            ctx.body = err;
        }
    },

    async generate(ctx: any){


        const valid = validateGenerate(ctx.request.body);

        if(!valid) {
            return ctx.badRequest('Validation Error', {errors: validateGenerate.errors});
        }

        let body = ctx.request.body;

        const nfcUuid: string = body.nfcUuid;
        const cardUuid: string = body.cardUuid;

        try{
            
            let responseCreateService = await strapi.service('api::card.card').generateToken(nfcUuid, cardUuid);

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
            console.log(err);
            ctx.body = err;
        }
    },

    async validate(ctx: any){
        console.log(`Esto es lo que esta llegando al controlador de validate ${JSON.stringify(ctx.request.body)}`);
        const valid = validateValidate(ctx.request.body);

        if(!valid) {
            return ctx.badRequest('Validation Error', {errors: validateGenerate.errors});
        }

        try{
            const body = ctx.request.body 

            let token: string = "";

            for(let i = 0; i < body.jwtCard.length; i++)
                token += body.jwtCard[i];
            
            const responseValidation = await strapi.service("api::card.card").validateToken(token, body.cardUuid, body.tokensVersionUuid, body.nfcUuid);

            return responseValidation;

        }
        catch(exception) {
            ctx.body = exception;

        }

    }
}));
