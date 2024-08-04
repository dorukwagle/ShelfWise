import express from "express";
import "express-async-errors";
import cors from "cors";
import initializeRoutes from "./startup/routes";
import errorHandler from "./middlewares/errorHandler";
import routesLogger from "./utils/routesLogger";
import "./utils/bigintSerializer"

const app = express();

if (process.env.NODE_ENV === "development") {
    app.use(cors({
        credentials: true,
        origin: ["http://localhost:5173", "*"],
    }));
}

// increase the payload size
app.use(express.json({limit: "2048mb"}));

// apply production settings and protections
// if (process.env.NODE_ENV === "production") prod(app);

if (process.env.NODE_ENV === "development")
    app.use(routesLogger);

initializeRoutes(app);

app.get("/", (req, res) => {
    res.json({"message": "Welcome to my app"});
});

// handle and log async errors
app.use(errorHandler);

export default app;
