import ModelReturnTypes from "../../entities/ModelReturnTypes";
import BookValidator, {
    BookAuthorsOnlyType,
    BookGenresOnlyType,
    BookInfoOnlyType,
    BookInfoType, BookPurchaseOnlyType, ISBNsOnlyType
} from "../../validations/BookInfo";
import formatValidationErrors from "../../utils/formatValidationErrors";
import prismaClient from "../../utils/prismaClient";
import * as fs from "node:fs";
import path from "path";
import {IMAGE_UPLOAD_PATH} from "../../constants/constants";
import {BookInfo} from "@prisma/client";
import {z} from "zod";

const v = new BookValidator();

const findBookOrFail = async (bookInfoId: string) => {
    const res = {statusCode: 404} as ModelReturnTypes<BookInfo>;

    const bookInfo = await prismaClient.bookInfo.findUnique({
        where: {bookInfoId}
    });

    if (!bookInfo)
        res.error = {error: "Book not found"};
    else
        res.data = bookInfo;

    return res;
}

const addBook = async (req: BookInfoType, coverPhoto: Express.Multer.File) => {
    const res = {statusCode: 400} as ModelReturnTypes;
    const validation = await v.BookInfo().safeParseAsync(req);

    const errRes = formatValidationErrors(validation);
    if (errRes) return errRes;

    const data = validation.data!;
    if (data.totalPieces !== data.barcodes.length) {
        res.error = {error: "totalPieces count and barcodes count mismatch"};
        return res;
    }

    const bookAuthorsData = data.bookAuthors.map(author => ({authorId: author}));
    const isbnsData = data.isbns.map(isbn => ({isbn: isbn}));
    const genresData = data.bookGenres.map(genre => ({genreId: genre}));
    const barcodesData = data.barcodes.map(bar => ({barcode: bar}));

    res.data = await prismaClient.bookInfo.create({
        data: {
            classNumber: data.classNumber,
            coverPhoto: coverPhoto.filename,
            bookNumber: data.bookNumber,
            numberOfPages: data.numberOfPages,
            seriesStatement: data.seriesStatement,
            publisherId: data.publisherId,
            addedDate: data.addedDate,
            subTitle: data.subTitle,
            editionStatement: data.editionStatement,
            title: data.title,
            publicationYear: data.publicationYear,
            bookAuthors: {
                createMany: {
                    data: bookAuthorsData
                }
            },
            purchases: {
                create: {
                    totalPieces: data.totalPieces,
                    pricePerPiece: data.pricePerPiece
                }
            },
            isbns: {
                createMany: {
                    data: isbnsData
                }
            },
            bookGenres: {
                createMany: {
                    data: genresData
                }
            },
            books: {
                createMany: {
                    data: barcodesData
                }
            }
        },
        include: {
            bookGenres: true,
            isbns: true,
            books: true,
            purchases: true,
            publisher: true
        }
    });

    res.statusCode = 200;
    return res;
};

const updateBookInfo = async (bookInfoId: string, data: BookInfoOnlyType) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const bookInfo = await findBookOrFail(bookInfoId);
    if (bookInfo.error) return bookInfo;

    const exclude = {column: "bookInfoId", value: bookInfo.data.bookInfoId};

    const validations = await v.BookInfoOnly(exclude).safeParseAsync(data);

    const errRes = formatValidationErrors(validations);
    if (errRes) return errRes;

    res.data = await prismaClient.bookInfo.update({
        where: {bookInfoId: bookInfo.data.bookInfoId},
        data: validations.data!
    })

    res.statusCode = 200;
    return res;
};

const updateCoverPhoto = async (bookInfoId: string, file: Express.Multer.File) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const bookInfo = await findBookOrFail(bookInfoId);
    if (bookInfo.error) return bookInfo;

    res.data = await prismaClient.bookInfo.update({
        where: {bookInfoId},
        data: {
            coverPhoto: file.filename
        }
    });

    fs.unlinkSync(path.join(IMAGE_UPLOAD_PATH, bookInfo.data.coverPhoto));

    res.statusCode = 200;
    return res;
}

const updateGenres = async (bookInfoId: string, data: BookGenresOnlyType) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const bookInfo = await findBookOrFail(bookInfoId);
    if (bookInfo.error) return bookInfo;

    const validation = await v.BookGenresOnly().safeParseAsync(data);
    const errRes = formatValidationErrors(validation);
    if (errRes) return errRes;

    await prismaClient.bookWithGenres.deleteMany({
        where: {bookInfoId}
    });

    const updates = validation.data!.bookGenres.map(genreId => ({bookInfoId, genreId}));

    res.data = await prismaClient.bookWithGenres.createMany({
        data: updates,
    });

    res.statusCode = 200;
    return res;
}

const updateAuthors = async (bookInfoId: string, data: BookAuthorsOnlyType) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const bookInfo = await findBookOrFail(bookInfoId);
    if (bookInfo.error) return bookInfo;

    const validation = await v.BookAuthorsOnly().safeParseAsync(data);
    const errRes = formatValidationErrors(validation);
    if (errRes) return errRes;

    await prismaClient.bookWithAuthors.deleteMany({
        where: {bookInfoId}
    });

    const updates = validation.data!.bookAuthors.map(authorId => ({bookInfoId, authorId}));

    res.data = await prismaClient.bookWithAuthors.createMany({
        data: updates,
    });

    res.statusCode = 200;
    return res;
}

const updateISBNs = async (bookInfoId: string, data: ISBNsOnlyType) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const bookInfo = await findBookOrFail(bookInfoId);
    if (bookInfo.error) return bookInfo;

    const validation = await v.ISBNsOnly({column: "bookInfoId", value: bookInfoId}).safeParseAsync(data);
    const errRes = formatValidationErrors(validation);
    if (errRes) return errRes;

    await prismaClient.isbns.deleteMany({
        where: {bookInfoId}
    });

    const updates = validation.data!.isbns.map(isbn => ({bookInfoId, isbn}));

    res.data = await prismaClient.isbns.createMany({
        data: updates,
    });

    res.statusCode = 200;
    return res;
}

const updatePurchase = async (purchaseId: string, pricePerPiece:string) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const purchase = await prismaClient.bookPurchases.findUnique({where: {purchaseId}});
    if (!purchase) {
        res.statusCode = 404;
        res.error = {error: "purchaseId not found"};
        return res;
    }

    const validation = (z.coerce.number({required_error: "pricePerPiece is required"})
        .min(0)).safeParse(pricePerPiece);
    const errRes = formatValidationErrors(validation);
    if (errRes) return errRes;

    res.data = await prismaClient.bookPurchases.update({
        where: {purchaseId},
        data: {
            pricePerPiece: validation.data!
        }
    });

    res.statusCode = 200;
    return res;
}

const updateBarcode = async (bookId: string, barcode: string) => {

}

const deleteSingleCopy  = async (bookId: string) => {

}

const deleteWhole = async (bookId: string) => {

}

export {
    addBook,
    updateBookInfo,
    updateCoverPhoto,
    updateGenres,
    updateAuthors,
    updateISBNs,
    updatePurchase,
    updateBarcode,
    deleteSingleCopy,
    deleteWhole
};