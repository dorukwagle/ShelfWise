import ModelReturnTypes from "../../entities/ModelReturnTypes";
import BookInfo, {BookInfoType} from "../../validations/BookInfo";
import formatValidationErrors from "../../utils/formatValidationErrors";
import prismaClient from "../../utils/prismaClient";

const addBook = async (req: BookInfoType, coverPhoto: Express.Multer.File) => {
    const res = {statusCode: 400} as ModelReturnTypes;
    const validation = await BookInfo.safeParseAsync(req);

    const errRes = formatValidationErrors(validation);
    if (errRes) return errRes;

    const data = validation.data!;
    if (data.totalPieces !== data.barcodes.length) {
        res.error = {error: "totalPieces count and barcodes count mismatch"}
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
                    pricePerPiece: data.pricePerPiece,
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
            },
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
}

export {
    addBook
}