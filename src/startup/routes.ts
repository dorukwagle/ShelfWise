import {Express} from "express";
import cookieParser from "cookie-parser";
import me from "../api/me/meController";
import auth from "../api/auth/authController";
import attributes from "../api/attributes/attributesController";
import { assistantManagerAuth, authorize } from "../middlewares/auth";
import enrollment from "../api/enrollment/enrollmentController";
import booksController from "../api/books/booksController";
import reservationController from "../api/bookflow/reservations/reservationController";
import issuance from "../api/bookflow/issuance/issuanceController";


const route = (route: string): string => `/api/${route}`;

const initializeRoutes = (app: Express): void => {
    app.use(cookieParser());

    app.use(route("attributes"), attributes);
    app.use(route("me"), authorize, me);
    app.use(route("auth"), auth);
    app.use(route("enrollments"), enrollment);
    app.use(route("books"), booksController);
    app.use(route("bookflow/reservations"), reservationController);
    app.use(route("bookflow/issuance"), assistantManagerAuth, issuance);
    
}

export default initializeRoutes;