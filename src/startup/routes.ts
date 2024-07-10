import express, {Express} from "express";
import cookieParser from "cookie-parser";
import me from "../api/me/meController";
import auth from "../api/auth/authController";


const initializeRoutes = (app: Express): void => {
    app.use(cookieParser());

    app.use("/api/me", me);
    app.use("/api/auth", auth)
}

export default initializeRoutes;