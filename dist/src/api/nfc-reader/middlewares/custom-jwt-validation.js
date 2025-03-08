"use strict";
/**
 * `custom-jwt-validation` middleware
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.default = (config, { strapi }) => {
    // Add your own logic here.
    return async (ctx, next) => {
        const authHeader = ctx.request.headers.authorization;
        if (!authHeader) {
            return ctx.unauthorized('Token no proporcionado');
        }
        const token = authHeader.split(' ')[1]; // Bearer <token>
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET); // Reemplaza con tu clave secreta JWT
            //valida datos del payload aqui.
            if (decoded['nfc-reader']) {
                ctx.state.user = decoded; // Almacena la información decodificada en ctx.state.user
                await next(); // Continúa con la siguiente función middleware o controlador
            }
            else {
                return ctx.unauthorized('Token invalido');
            }
        }
        catch (error) {
            return ctx.unauthorized('Token inválido');
        }
    };
};
