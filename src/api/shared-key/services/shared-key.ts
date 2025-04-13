/**
 * shared-key service
 */

import { factories } from '@strapi/strapi';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes, createHash } from 'crypto';

export default factories.createCoreService('api::shared-key.shared-key', ({strapi}) => ({

    async generateSharedKey() {

      let response: PairKey | null | undefined | any = null;

      try{
        let entry: SharedKey | null | undefined = null; 
        const pairKey: PairKey = await strapi.service('api::pair-key.pair-key').generateKeys();
        console.log(`Este es el pairKey: ${JSON.stringify(pairKey)}`);
        do{
          const uuid = uuidv4().replace(/-/g, "");
          const randomSalt = randomBytes(16);
          const sharedKeyHash = createHash('sha256')
            .update(pairKey.private_key)
            .update(uuid)
            .update(randomSalt)
            .digest('hex');

          const sharedKey = sharedKeyHash.substring(0,16);

          entry = await strapi.db.query('api::shared-key.shared-key').findOne({
          select: ['uuid', 'shared_key'],
              where: {shared_key: sharedKey, uuid: uuid}
          });

          if(entry === null){
            console.log("Registra SharedKey");
            entry = await strapi.db.query("api::shared-key.shared-key").create({
              data: {
                  uuid: uuid,
                  shared_key: sharedKey,
                  pair_key: pairKey.id,
                  valid_to: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
              }
            });
            console.log("Se ha registrado exitosamente SharedKey");
            if(entry !== null){
              response = entry;
              break;
            }
          }

        }
        while(entry !== null);
      }
      catch(error){
        console.error(error);
            response = error;
      }

        return response;

    },

    async renovateSharedKey(sharedKeyUuid: string){
      console.log(`Este es el sharedKeyUuid: ${sharedKeyUuid}`);

      const entry: SharedKey | null | undefined = await strapi.db.query("api::shared-key.shared-key").findOne({
        where: {
          uuid: sharedKeyUuid
        },
        populate: {
          pair_key: true,
          nfc_reader: true,
        }
      });

      if(entry !== null && entry !== undefined) {
        const today = new Date();
        const validToDateShared = new Date(entry.valid_to);
        const validToDatePairKey = new Date(entry.pair_key.valid_to);

        if(today >= validToDateShared || today >= validToDatePairKey) {
          let sharedKeyGenerated = await this.generateSharedKey();
          return {
            renovated: true,
            sharedKey: sharedKeyGenerated
          };
        }

        return {
          renovated: false,
          sharedKey: entry
        };
      }

    },
    async getByUuid(uuid: string) {
      
      const entry: SharedKey | null | undefined = await strapi.db.query("api::shared-key.shared-key").findOne({
        where: {
          uuid: uuid
        },
        populate: {
          pair_key: true,
          nfc_reader: true,
        }
      });

      return entry;

    }
}));
