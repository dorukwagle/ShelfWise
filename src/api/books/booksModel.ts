import ModelReturnTypes from "../../entities/ModelReturnTypes";
import BookInfo, {BookInfoType} from "../../validations/BookInfo";

const invalidResponse = <D = {}, E = {}>(validation: any) => {
    const res = {} as ModelReturnTypes<D, E>;
    res.statusCode = 400;

    if (Object.keys(validation.error?.formErrors?.fieldErrors || {}).length)
        res.error = validation.error?.formErrors.fieldErrors;
    else if (validation.error)
        res.error = validation.error;

    return res.error ? res : null;
};

const addBook = async (req: BookInfoType, coverPhoto: Express.Multer.File | undefined) => {
    const res = {statusCode: 400} as ModelReturnTypes;
// check barcodes length equal total pieces
    const validation = await BookInfo.safeParseAsync(req);

    const errRes = invalidResponse(validation);
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