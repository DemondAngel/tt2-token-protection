/**
 * shared-key controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::shared-key.shared-key', ({strapi}) => ({

    async findOne(ctx){
        const { uuid } = ctx.params;

        //Invocar servicios para buscar el uuId de la sharedKey
        let responseGetByUuidService: SharedKey | undefined | null = await strapi.service('api::shared-key.shared-key').getByUuid(uuid);

        if(responseGetByUuidService === null || responseGetByUuidService === undefined){
            ctx.status = 404;
            ctx.body = 'Not found';
        }
        else{
            return {
                'sharedKey': responseGetByUuidService.shared_key
            };
        }
    }

}));
