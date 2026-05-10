import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node API with PostgreSQL',
            version: '1.0.0',
            description: 'Production-grade REST API',
        },

        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],

        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'accessToken',
                },

                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key',
                },
            },

            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            example: 1,
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe',
                        },
                        email: {
                            type: 'string',
                            example: 'john@test.com',
                        },
                    },
                },

                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Unauthorized',
                        },
                        code: {
                            type: 'string',
                            example: 'UNAUTHORIZED',
                        },
                    },
                },
            },
        },

        security: [
            {
                apiKeyAuth: [],
            },
            {
                cookieAuth: [],
            },
        ],
    },

    apis: ['./routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec