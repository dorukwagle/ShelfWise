import express, {NextFunction, Request, RequestHandler, Response} from "express";
import {assistantManagerAuth, memberAuth} from "../../middlewares/auth";
import {imageUpload} from "../../utils/fileUpload";
import SessionRequest from "../../entities/SessionRequest";
import {
    addBook, addExistingBook, deleteSingleCopy, deleteWhole,
    updateAuthors, updateBarcode,
    updateBookInfo,
    updateCoverPhoto,
    updateGenres,
    updateISBNs,
    updatePurchase
} from "./booksModel";
import {BookInfoType} from "../../validations/BookInfo";
import {findBooks, searchBooks} from "./booksQueryModel";
import {BookFilterType} from "../../validations/BookFilter";
import {FilterParamsType} from "../../validations/FilterParams";


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

booksController.get("/", memberAuth, async (req: SessionRequest<{}, any, any, BookFilterType>, res) => {
    const {data, statusCode, info } = await searchBooks(req.query);
    res.status(statusCode).json({data, info});
});

booksController.get("/find", assistantManagerAuth, async (req: SessionRequest<{}, any, any, FilterParamsType>, res) => {
    if (!req.query.seed) return res.status(200).json([]);

    const {data, statusCode, info } = await findBooks(req.query.seed, req.query);
    res.status(statusCode).json({data, info});
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

booksController.put("/info/:infoId/genres", assistantManagerAuth, async (req: SessionRequest<{ infoId: string }>, res) => {
    const {data, statusCode, error} = await updateGenres(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
});

booksController.put("/info/:infoId/authors", assistantManagerAuth, async (req: SessionRequest<{ infoId: string }>, res) => {
    const {data, statusCode, error} = await updateAuthors(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
});

booksController.put("/info/:infoId/isbns", assistantManagerAuth, async (req: SessionRequest<{ infoId: string }>, res) => {
    const {data, statusCode, error} = await updateISBNs(req.params.infoId, req.body);
    res.status(statusCode).json(error ? error : data);
});


//infoId is purchaseId
booksController.put("/info/:infoId/purchase", assistantManagerAuth, async (req: SessionRequest<{ infoId: string }>, res) => {
    const {data, statusCode, error} = await updatePurchase(req.params.infoId, req.body.pricePerPiece);
    res.status(statusCode).json(error ? error : data);
});

//infoId is bookId
booksController.put("/info/:infoId/barcode", assistantManagerAuth, async (req: SessionRequest<{ infoId: string }>, res) => {
    if (!req.body.barcode) return res.status(400).json({error: "barcode is required"});

    const {data, statusCode, error} = await updateBarcode(req.params.infoId, req.body.barcode);
    res.status(statusCode).json(error ? error : data);
});

booksController.delete("/single/:id", assistantManagerAuth, async (req: SessionRequest<{ id: string }>, res) => {
   await deleteSingleCopy(req.params.id);
   res.status(200).json({message: "Given copy of book deleted successfully."});
});

booksController.delete("/whole/:id", assistantManagerAuth, async (req: SessionRequest<{ id: string }>, res) => {
   await deleteWhole(req.params.id);
   res.status(200).json({message: "Given Book deleted successfully."});
});

booksController.post("/add-existing/:infoId", assistantManagerAuth, async (req: SessionRequest<{ infoId: string }>, res) => {
   const {data, statusCode, error} = await addExistingBook(req.params.infoId, req.body);
   res.status(statusCode).json(error ? error : data);
});

export default booksController;