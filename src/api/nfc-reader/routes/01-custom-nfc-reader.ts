export default {
    routes: [
        {
            method: 'POST',
            path: '/nfc-readers/auth',
            handler: 'nfc-reader.authNfcReader',
            config: {
                auth: false,
                policies: [],
                middlewares: [],
                description: 'Custom NFC Reader route',
                tags: ['NFC Reader'],
                summary: 'Retrieve custom data for NFC Reader',
                responses: {
                  200: {
                    description: 'Successful response',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            message: {
                              type: 'string',
                              example: 'Custom route for NFC Reader',
                            },
                          },
                        },
                      },
                    },
                  },
                },
            },
        },
    ]
}