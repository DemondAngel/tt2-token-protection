/**
 * `custom-jwt-validation` middleware
 */

import type { Core } from '@strapi/strapi';
import jwt from 'jsonwebtoken';

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const authHeader = ctx.request.headers.authorization;

    if (!authHeader) {
      return ctx.unauthorized('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string); // Reemplaza con tu clave secreta JWT
      //valida datos del payload aqui.
      if(decoded['nfcReader']){
          ctx.state.user = decoded; // Almacena la información decodificada en ctx.state.user
          await next(); // Continúa con la siguiente función middleware o controlador
      } else {
        return ctx.unauthorized('Token invalido');
      }

    } catch (error) {
      return ctx.unauthorized('Token inválido');
    }
  };
};
