/**
 * transaction controller
 */

import { factories } from '@strapi/strapi'
import Ajv, { ErrorObject} from 'ajv';
import generateTokenSchema from '../schemas/transaction-token-generate.json';
import validateTokenSchema from '../schemas/transaction-token-validate.json';


const ajv = new Ajv();
const validateGeneration = ajv.compile(generateTokenSchema);
const validateValidation = ajv.compile(validateTokenSchema);

export default factories.createCoreController('api::transaction.transaction', ({strapi}) => ({
    async generate(ctx: any){

        const valid = validateGeneration(ctx.request.body);

        if(!valid){
            return ctx.badRequest('Validation Error', {errors: validateGeneration.errors});
        }

        try{
            ctx.body = 'ok';
        }
        catch(err){
            ctx.body = err;
        }
    },
    async validate(ctx: any){

        const valid = validateValidation(ctx.request.body);

        if(!valid){
            return ctx.badRequest('Validation Error', {errors: validateValidation.errors});
        }

        try{
            ctx.body = 'ok';
        }
        catch(err){
            ctx.body = err;
        }
    },

    async register(ctx: any){

        try{
            ctx.body = 'ok';
        }
        catch(err){
            ctx.body = err;
        }
    }
}));
