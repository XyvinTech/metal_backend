const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { PORT, API_VERSION } = process.env;

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "METAL API Documentation",
    version: "1.0.0",
    description: "API documentation for METAL application",
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api/${API_VERSION}`,
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      // ApiKeyAuth: {
      //   type: "apiKey",
      //   in: "header",
      //   name: "api-key",
      //   description: "API Key for accessing protected endpoints",
      // },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
    // {
    //   ApiKeyAuth: [],
    // },
  ],
};
const options = {
  swaggerDefinition,
  apis: ["./src/swagger/paths/*.js"],
};

const swaggerOptions = {
  swaggerOptions: {
    docExpansion: "none",
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
  },
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec, swaggerOptions };
