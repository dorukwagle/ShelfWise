import express, {Express} from "express";
import cookieParser from "cookie-parser";
import me from "../api/me/meController";
import auth from "../api/auth/authController";
import { authorize } from "../middlewares/auth";


const initializeRoutes = (app: Express): void => {
    app.use(cookieParser());

    app.use("/api/me", authorize, me);
    app.use("/api/auth", auth)
}

export default initializeRoutes;