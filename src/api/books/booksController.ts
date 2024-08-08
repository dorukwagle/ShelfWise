import express, {NextFunction, Request, RequestHandler, Response} from "express";
import {assistantManagerAuth, memberAuth} from "../../middlewares/auth";
import {imageUpload} from "../../utils/fileUpload";
import SessionRequest from "../../entities/SessionRequest";
import {
    addBook,
    updateAuthors, updateBarcode,
    updateBookInfo,
    updateCoverPhoto,
    updateGenres,
    updateISBNs,
    updatePurchase
} from "./booksModel";
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

// booksController.put("/info/:infoId/update_barcode", assistantManagerAuth, async (req: SessionRequest<{ infoId: string }>, res) => {
//     if (!req.body.barcode) return res.status(400).json({error: "barcode is required cover photo"});
//
//     const {data, statusCode, error} = await updateBarcode(req.params.infoId, req.body.barcode);
//     res.status(statusCode).json(error ? error : data);
// });



export default booksController;