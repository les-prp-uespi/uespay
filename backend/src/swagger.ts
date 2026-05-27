import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UesPay API',
            version: '1.0.0',
            description: 'API para o sistema de carteira digital universitária UesPay.',
        },
        servers: [
            {
                url: BASE_URL,
                description: 'Servidor da API',
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Caminho para os arquivos com anotações JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Documentação Swagger disponível em ${BASE_URL}/api-docs`);
};
