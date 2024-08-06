import {z} from "zod";
import {exists, unique} from "../utils/dbValidation";

const hasDuplicates = (data: any[]) => (new Set(data)).size !== data.length;

type Exclude = {column: string, value: any} | undefined;

class BookInfoValidator {
    private exclude: Exclude;

    private readonly uniqueClassNumber = async (cn: string, exclude: Exclude=undefined) => unique("bookInfo", "classNumber", cn, exclude);

    private readonly uniqueBookNumber = async  (bookNumber: string, exclude: Exclude=undefined) => unique("bookInfo", "bookNumber", bookNumber, exclude);

    private readonly publisherExists = async (publisherId: string, exclude:Exclude=undefined) => exists("publishers", "publisherId", publisherId, exclude);

    private readonly eachBookAuthorsExists = async (authorIds: string[], exclude:Exclude=undefined) => {
        if (hasDuplicates(authorIds)) return false;

        for (const authorId of authorIds) {
            let exist = await exists("authors", "authorId", authorId, exclude);
            if (!exist)
                return false;
        }

        return true;
    }

    private readonly eachUniqueIsbn = async (isbns: string[], exclude:Exclude=undefined) => {
        if (hasDuplicates(isbns)) return false;

        for (const isbn of isbns) {
            let exist = await exists("isbns", "isbn", isbn, exclude);
            if (exist)
                return false;
        }

        return true;
    }

    private readonly eachBookGenreExists = async (genreIds: string[], exclude:Exclude=undefined) => {
        if (hasDuplicates(genreIds)) return false;

        for (const genreId of genreIds) {
            let exist = await exists("genres", "genreId", genreId, exclude);
            if (!exist)
                return false;
        }

        return true;
    }

    private readonly eachUniqueBarcode = async (barcodes: string[], exclude:Exclude=undefined) => {
        if (hasDuplicates(barcodes)) return false;

        for (const barcode of barcodes) {
            let exist = await exists("books", "barcode", barcode, exclude);
            if (exist)
                return false;
        }

        return true;
    }

    private readonly BookInfoSchema = z.object({
        classNumber: z.string({required_error: "class number is required"})
            .refine(val => this.uniqueClassNumber(val, this.exclude), "each class number must be unique"),
        bookNumber: z.string({required_error: "book number is required"})
            .refine(val => this.uniqueBookNumber(val, this.exclude), "each book number must be unique"),
        title: z.string({required_error: "title is required"}),
        subTitle: z.string().optional(),
        editionStatement: z.string().optional(),
        numberOfPages: z.coerce.number({required_error: "number of pages is required"})
            .min(1, "can't be less than 1"),
        publicationYear: z.string({required_error: "publicationYear is required"}),
        seriesStatement: z.string().optional(),
        addedDate: z.coerce.date().optional(),
        publisherId: z.string({required_error: "publisher is required"})
            .refine(this.publisherExists, "publisher not found"),
        bookAuthors: z.coerce.string().array().nonempty("at least one author is required")
            .refine(this.eachBookAuthorsExists, "book authors not found or duplicate entry"),
        isbns: z.string().array().nonempty("at least one isbn is required")
            .refine(val => this.eachUniqueIsbn(val, this.exclude), "each isbn must be unique"),
        bookGenres: z.coerce.string().array().nonempty("at least one genre is required")
            .refine(this.eachBookGenreExists, "book genre not found is duplicate entry"),
        pricePerPiece: z.coerce.number().min(0),
        totalPieces: z.coerce.number().min(1),
        barcodes: z.string().array().nonempty("at least one barcode is required")
            .refine(val => this.eachUniqueBarcode(val, this.exclude), "each barcode must be unique"),
    });

    private readonly BookInfoOnlySchema = this.BookInfoSchema.omit({
        bookGenres: true,
        bookAuthors: true,
        isbns: true,
        pricePerPiece: true,
        totalPieces: true,
        barcodes: true
    });

    private readonly BookGenresOnlySchema = this.BookInfoSchema.pick({
        bookGenres: true,
    });

    private readonly BookAuthorsOnlySchema = this.BookInfoSchema.pick({
        bookAuthors: true,
    });

    private readonly ISBNsOnlySchema = this.BookInfoSchema.pick({
        isbns: true
    });

    private readonly BookPurchaseOnlySchema = this.BookInfoSchema.pick({
        pricePerPiece: true,
        totalPieces: true,
        barcodes: true
    });

    public readonly BookInfo = (exclude: Exclude = undefined) => {
        this.exclude = exclude;
        return this.BookInfoSchema;
    };

    public readonly BookInfoOnly = (exclude: Exclude = undefined) => {
        this.exclude = exclude;
        return this.BookInfoOnlySchema;
    };

    public readonly BookGenresOnly = (exclude: Exclude = undefined) => {
        this.exclude = exclude;
        return this.BookGenresOnlySchema;
    };

    public readonly BookAuthorsOnly = (exclude: Exclude = undefined) => {
        this.exclude = exclude;
        return this.BookAuthorsOnlySchema;
    };

    public readonly BookPurchaseOnly = (exclude: Exclude = undefined) => {
        this.exclude = exclude;
        return this.BookPurchaseOnlySchema;
    };

    public readonly ISBNsOnly = (exclude: Exclude = undefined) => {
        this.exclude = exclude;
        return this.ISBNsOnlySchema;
    };
}

const v = new BookInfoValidator();
const a = v.BookInfo();
const b = v.BookInfoOnly();
const g = v.BookGenresOnly();
const aut = v.BookAuthorsOnly();
const i = v.ISBNsOnly();
const p = v.BookPurchaseOnly();

export type BookInfoType = z.infer<typeof a>;
export type BookInfoOnlyType = z.infer<typeof b>;
export type BookGenresOnlyType = z.infer<typeof g>;
export type BookAuthorsOnlyType = z.infer<typeof aut>;
export type ISBNsOnlyType = z.infer<typeof i>;
export type BookPurchaseOnlyType = z.infer<typeof p>;

export default BookInfoValidator;