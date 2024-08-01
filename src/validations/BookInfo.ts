import {z} from "zod";

// unique array values shouldn't be duplicate in requests too

const BookInfo = z.object({
    classNumber: z.string({required_error: "class number is required"}), //unique
    bookNumber: z.string({required_error: "book number is required"}), //unique
    title: z.string({required_error: "title is required"}),
    subTitle: z.string().optional(),
    editionStatement: z.string().optional(),
    numberOfPages: z.number({required_error: "number of pages is required"})
        .min(1, "can't be less than 1"),
    publicationYear: z.string({required_error: "publicationYear is required"}),
    seriesStatement: z.string().optional(),
    addedDate: z.coerce.date().optional(),
    coverPhoto: z.string({required_error: "cover photo is required"}),
    publisherId: z.string({required_error: "publisher is required"}), //exists
    bookAuthors: z.string().array(), // each exists
    isbns: z.string().array(), // unique
    bookGenres: z.string().array(), //each exists
    pricePerPiece: z.coerce.number().min(0),
    totalPieces: z.coerce.number().min(1),
    barcodes: z.string().array(), // each unique, length equal to totalPieces
});

export type BookInfoType = z.infer<typeof BookInfo>;
export default BookInfo;