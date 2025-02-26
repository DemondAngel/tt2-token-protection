/**
 * card controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::card.card', ({strapi}) => ({
    async generate(ctx){
        try{
            ctx.body = 'ok';
        }
        catch(err){
            ctx.body = err;
        }
    },
    async validate(ctx){
        try{
            ctx.body = 'ok';
        }
        catch(err){
            ctx.body = err;
        }
    }
}));
