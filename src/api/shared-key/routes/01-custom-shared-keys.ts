export default {
    routes: [
        {
            method: 'GET',
            path: '/shared-keys/:uuid',
            handler: 'shared-key.findOne',
            config: {
                auth: false,
                policies: [],
                middlewares: ['api::nfc-reader.custom-jwt-validation'],
                description: 'Custom Card route generate',
                tags: ['SharedKey querying'],
                summary: 'Querying shared key',
            },
        },
    ]
}