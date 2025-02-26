export default {
    routes: [
        {
            method: 'POST',
            path: '/transactions/tokens/generate',
            handler: 'transaction.generate',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
                description: 'Custom NFC Reader route',
                tags: ['Transaction'],
                summary: 'Create a new token',
            },
        },
        {
            method: 'POST',
            path: '/transactions/tokens/validate',
            handler: 'transaction.validate',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
                description: 'Custom NFC Reader route',
                tags: ['Transaction'],
                summary: 'Create a new token',
            },
        },
        {
            method: 'POST',
            path: '/transactions/tokens/register',
            handler: 'transaction.register',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
                description: 'Custom NFC Reader route',
                tags: ['Transaction'],
                summary: 'Create a new token',
            },
        },
    ]
}