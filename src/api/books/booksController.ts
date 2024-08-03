import express, {NextFunction, Request, RequestHandler, Response} from "express";
import {memberAuth} from "../../middlewares/auth";
import {imageUpload} from "../../utils/fileUpload";
import SessionRequest from "../../entities/SessionRequest";
import {addBook} from "./booksModel";
import {BookInfoType} from "../../validations/BookInfo";


const booksController = express.Router();

const uploadHandler = (cb: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        cb(req, res, err => {
            if (err)
                return res.status(400).json({error: err.message});
            return next();
        });
    };
};

booksController.get("/", memberAuth, async (req, res) => {

});

booksController.post("/",
    [memberAuth, uploadHandler(imageUpload.single("coverPhoto"))],
    async (req: SessionRequest<{}, any, BookInfoType>, res: Response) => {
        if (!req.file) return res.status(400).json({error: "please upload cover photo"});

        const {data, statusCode, error} = await addBook(req.body, req.file);

        res.status(statusCode).json(error ? error : data);
    });

export default booksController;