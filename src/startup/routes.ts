import {Express} from "express";
import cookieParser from "cookie-parser";
import me from "../api/me/meController";
import auth from "../api/auth/authController";
import attributes from "../api/attributes/attributesController";
import { authorize } from "../middlewares/auth";
import enrollment from "../api/enrollment/enrollmentController";
import booksController from "../api/books/booksController";


const initializeRoutes = (app: Express): void => {
    app.use(cookieParser());

    app.use("/api/attributes", attributes);
    app.use("/api/me", authorize, me);
    app.use("/api/auth", auth);
    app.use("/api/enrollments", enrollment);
    app.use("/api/books", booksController);
}

export default initializeRoutes;