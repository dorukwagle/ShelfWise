import express, {Express} from "express";
import cookieParser from "cookie-parser";


const initializeRoutes = (app: Express): void => {
    app.use(cookieParser());


}

export default initializeRoutes;