/**
 * nfc-reader controller
 */

import Ajv, { ErrorObject} from 'ajv';
import authNfcReaderSchema from '../schemas/auth-nfcreader.json';

import { factories } from '@strapi/strapi'

const ajv = new Ajv();
const validate = ajv.compile(authNfcReaderSchema);

export default factories.createCoreController('api::nfc-reader.nfc-reader', ({strapi}) => ({
    async authNfcReader(ctx: any){

        const valid = validate(ctx.request.body);

        if(!valid){
            return ctx.badRequest('Validation Error', {errors: validate.errors});
        }

        try{
            ctx.body = 'ok';
        }
        catch(err){
            ctx.body = err;
        }
    }
}));
