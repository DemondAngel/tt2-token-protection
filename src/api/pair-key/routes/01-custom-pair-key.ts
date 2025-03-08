export default {
    routes: [
        {
            method: 'POST',
            path: '/pair-keys/renovate',
            handler: 'pair-key.renovateKey',
            config: {
                auth: false,
                policies: [],
                description: 'Custom NFC Reader route',
                tags: ['NFC Reader'],
                summary: 'Retrieve custom data for NFC Reader',
                middlewares: ["api::nfc-reader.custom-jwt-validation"],
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
        {
          method: 'POST',
          path: '/pair-keys',
          handler: 'pair-key.create',
          config: {
              middlewares: ['api::nfc-reader.custom-jwt-validation'],
              auth: false,
              policies: [],
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