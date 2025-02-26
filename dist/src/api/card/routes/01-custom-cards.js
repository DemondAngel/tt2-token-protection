"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        {
            method: 'POST',
            path: '/cards/generate',
            handler: 'card.generate',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
                description: 'Custom Card route generate',
                tags: ['Card validation'],
                summary: 'Generate data for route',
            },
        },
        {
            method: 'POST',
            path: '/cards/validate',
            handler: 'card.validate',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
                description: 'Custom Card route generate',
                tags: ['Card validation'],
                summary: 'Generate data for route',
            },
        },
    ]
};
