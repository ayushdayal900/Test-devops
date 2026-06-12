const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mahalxmi Tailors API',
            version: '1.0.0',
            description: 'API documentation for the Mahalxmi Tailors E-Commerce Platform',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development Server',
            },
            {
                url: 'https://your-production-url.com/api',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsDoc(options);
module.exports = specs;
