import {z} from "zod";
import {exists, unique} from "../utils/dbValidation";

const hasDuplicates = (data: any[]) => (new Set(data)).size !== data.length;

// unique array values shouldn't be duplicate in requests too
const uniqueClassNumber = async (cn: string) => unique("bookInfo", "classNumber", cn);

const uniqueBookNumber = async  (bookNumber: string) => unique("bookInfo", "bookNumber", bookNumber);

const publisherExists = async (publisherId: string) => exists("publishers", "publisherId", publisherId);

const eachBookAuthorsExists = async (authorIds: string[]) => {
    if (hasDuplicates(authorIds)) return false;

    for (const authorId of authorIds) {
        let exist = await exists("authors", "authorId", authorId);
        if (!exist)
            return false;
    }

    return true;
}

const eachUniqueIsbn = async (isbns: string[]) => {
    if (hasDuplicates(isbns)) return false;

    for (const isbn of isbns) {
        let exist = await exists("isbns", "isbn", isbn);
        if (exist)
            return false;
    }

    return true;
}

const eachBookGenreExists = async (genreIds: string[]) => {
    if (hasDuplicates(genreIds)) return false;

    for (const genreId of genreIds) {
        let exist = await exists("genres", "genreId", genreId);
        if (!exist)
            return false;
    }

    return true;
}

const eachUniqueBarcode = async (barcodes: string[]) => {
    if (hasDuplicates(barcodes)) return false;

    for (const barcode of barcodes) {
        let exist = await exists("books", "barcode", barcode);
        if (exist)
            return false;
    }

    return true;
}

const BookInfo = z.object({
    classNumber: z.string({required_error: "class number is required"})
        .refine(uniqueClassNumber, "each class number must be unique"),
    bookNumber: z.string({required_error: "book number is required"})
        .refine(uniqueBookNumber, "each book number must be unique"),
    title: z.string({required_error: "title is required"}),
    subTitle: z.string().optional(),
    editionStatement: z.string().optional(),
    numberOfPages: z.coerce.number({required_error: "number of pages is required"})
        .min(1, "can't be less than 1"),
    publicationYear: z.string({required_error: "publicationYear is required"}),
    seriesStatement: z.string().optional(),
    addedDate: z.coerce.date().optional(),
    publisherId: z.string({required_error: "publisher is required"})
        .refine(publisherExists, "publisher not found"),
    bookAuthors: z.coerce.string().array()
        .refine(eachBookAuthorsExists, "book authors not found or duplicate entry"),
    isbns: z.string().array()
        .refine(eachUniqueIsbn, "each isbn must be unique"),
    bookGenres: z.coerce.string().array()
        .refine(eachBookGenreExists, "book genre not found is duplicate entry"),
    pricePerPiece: z.coerce.number().min(0),
    totalPieces: z.coerce.number().min(1),
    barcodes: z.string().array() // length equal to totalPieces
        .refine(eachUniqueBarcode, "each barcode must be unique"),
});

export type BookInfoType = z.infer<typeof BookInfo>;
export default BookInfo;