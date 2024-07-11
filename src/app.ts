import express from "express";
import "express-async-errors";
import cors from "cors";
import initializeRoutes from "./startup/routes";
import errorHandler from "./middlewares/errorHandler";

const app = express();

if (process.env.NODE_ENV === "development") {
    app.use(cors({
        credentials: true,
        origin: ["http://localhost:3000", "*"],
    }));
}

// increase the payload size
app.use(express.json({limit: "2048mb"}));

// apply production settings and protections
// if (process.env.NODE_ENV === "production") prod(app);

initializeRoutes(app);

// handle and log async errors
app.use(errorHandler);

export default app;
