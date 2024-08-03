import ModelReturnTypes from "../../entities/ModelReturnTypes";
import BookInfo, {BookInfoType} from "../../validations/BookInfo";
import formatValidationErrors from "../../utils/formatValidationErrors";

const addBook = async (req: BookInfoType, coverPhoto: Express.Multer.File | undefined) => {
    const res = {statusCode: 400} as ModelReturnTypes;
// check barcodes length equal total pieces
    const validation = await BookInfo.safeParseAsync(req);

    const errRes = formatValidationErrors(validation);
    if (errRes) return errRes;


    const data = validation.data!;
    if (data.totalPieces !== data.barcodes.length) {
        res.error = {error: "totalPieces count and barcodes count mismatch"}
    }
    return res;
}

export {
    addBook
}