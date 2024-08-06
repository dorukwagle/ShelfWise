import express, {NextFunction, Request, RequestHandler, Response} from "express";
import {assistantManagerAuth, memberAuth} from "../../middlewares/auth";
import {imageUpload} from "../../utils/fileUpload";
import SessionRequest from "../../entities/SessionRequest";
import {addBook, updateBookInfo, updateCoverPhoto} from "./booksModel";
import {BookInfoType} from "../../validations/BookInfo";
import multer from "multer";


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
    [assistantManagerAuth, uploadHandler(imageUpload.single("coverPhoto"))],
    async (req: SessionRequest<{}, any, BookInfoType>, res: Response) => {
        if (!req.file) return res.status(400).json({error: "please upload cover photo"});

        const {data, statusCode, error} = await addBook(req.body, req.file);
        res.status(statusCode).json(error ? error : data);
    });

booksController.put("/info/:infoId", assistantManagerAuth, async (req: SessionRequest<{
    infoId: string
}>, res: Response) => {
    const {data, statusCode, error} = await updateBookInfo(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
});

booksController.put("/info/:infoId/coverphoto",
    [assistantManagerAuth, uploadHandler(imageUpload.single("coverPhoto"))],
    async (req: SessionRequest<{ infoId: string }>, res: Response) => {
        if (!req.file) return res.status(400).json({error: "please upload cover photo"});

        const {data, statusCode, error} = await updateCoverPhoto(req.params.infoId, req.file);
        res.status(statusCode).json(error ? error : data);
    });

export default booksController;