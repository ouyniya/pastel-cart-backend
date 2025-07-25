const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { dynamicCorsOptions } = require("./configs/cors");

// Swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation for my project",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// middleware
app.use(cors(dynamicCorsOptions));
app.use(morgan("dev"));
app.use(express.json());

// router
fs.readdirSync("./routes")
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const router = require(path.join(__dirname, "routes", file));
    if (typeof router === "function" || (router && router.stack)) {
      app.use("/api", router);
    } else {
      console.warn(`Skipping file ${file}, not a valid router`);
    }
  });

// =====  404 Not Found Handler (ต้องอยู่ล่างสุดเสมอ) =====
app.use((req, res) => {
  res.status(404).json({ errors: "Page not found" });
});

// start server
app.listen(5001, () => console.log("server is running on port 5001"));
