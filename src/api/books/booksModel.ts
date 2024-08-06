import ModelReturnTypes from "../../entities/ModelReturnTypes";
import BookValidator, {BookInfoOnlyType, BookInfoType} from "../../validations/BookInfo";
import formatValidationErrors from "../../utils/formatValidationErrors";
import prismaClient from "../../utils/prismaClient";
import * as fs from "node:fs";
import path from "path";
import {IMAGE_UPLOAD_PATH} from "../../constants/constants";

const v = new BookValidator();

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

    const bookInfo = await prismaClient.bookInfo.findUnique({
        where: {bookInfoId}
    });

    if (!bookInfo) {
        res.statusCode = 404;
        res.error = {error: "Book not found"};
        return res;
    }
    const exclude = {column: "bookInfoId", value: bookInfo.bookInfoId};

    const validations = await v.BookInfoOnly(exclude).safeParseAsync(data);

    const errRes = formatValidationErrors(validations);
    if (errRes) return errRes;

    res.data = await prismaClient.bookInfo.update({
        where: {bookInfoId: bookInfo.bookInfoId},
        data: validations.data!
    })

    res.statusCode = 200;
    return res;
};

const updateCoverPhoto = async (bookInfoId: string, file: Express.Multer.File) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const bookInfo = await prismaClient.bookInfo.findUnique({
        where: {bookInfoId}
    });

    if (!bookInfo) {
        res.statusCode = 404;
        res.error = {error: "Book not found"};
        return res;
    }

    res.data = await prismaClient.bookInfo.update({
        where: {bookInfoId},
        data: {
            coverPhoto: file.filename
        }
    });

    fs.unlinkSync(path.join(IMAGE_UPLOAD_PATH, bookInfo.coverPhoto));
    
    res.statusCode = 200;
    return res;
}

export {
    addBook,
    updateBookInfo,
    updateCoverPhoto
};