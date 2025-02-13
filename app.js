require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const responseHandler = require("./src/helpers/responseHandler");
const {
  swaggerUi,
  swaggerSpec,
  swaggerOptions,
} = require("./src/swagger/swagger");
const path = require("path");
const adminRoute = require("./src/routes/admin");
const projectRoute = require("./src/routes/project");
const mtoRoute = require("./src/routes/mto");

const app = express();
const { PORT, API_VERSION, NODE_ENV } = process.env;

//* Use volleyball for request logging
app.use(volleyball);
//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());
//* Parse JSON request bodies
app.use(express.json());
//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;
//* Import database connection module
require("./src/helpers/connection");
app.set("trust proxy", true);
const uploadDir = path.join(__dirname, "src/excel_report");
console.log("🚀 ~ uploadDir:", uploadDir)

app.use("/images", express.static(uploadDir));

//! Define the absolute path to the frontend build directory
const frontendBuildPath = "/var/www/html/Metal-Craft";

// !Serve static files from the frontend build directory
app.use("/", express.static(frontendBuildPath));

//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return responseHandler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master 🗝️?"
  );
});

//* Swagger setup
app.use(
  `${BASE_PATH}/api-docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerOptions)
);

//* Configure routes for user API
app.use(`${BASE_PATH}/admin`, adminRoute);
app.use(`${BASE_PATH}/project`, projectRoute);
app.use(`${BASE_PATH}/mto`, mtoRoute);

app.get("*", (req, res) => {
  res.sendFile(`${frontendBuildPath}/index.html`);
});

app.listen(PORT, () => {
  const portMessage = clc.redBright(`✓ App is running on port: ${PORT}`);
  const envMessage = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  console.log(`${portMessage}\n${envMessage}`);
});
