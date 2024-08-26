import { Books, Issues } from "@prisma/client";
import ModelReturnTypes from "../../../entities/ModelReturnTypes";
import prismaClient from "../../../utils/prismaClient";

const reserveAvailable = async (book: Books, userId: string) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    res.data = await prismaClient.bookReservations.create({
        data: {
            bookInfoId: book.bookInfoId,
            userId,
            reservationDate: new Date(),
            bookId: book.bookId,
        },
    });

    return res;
};

const reserveIssued = async (books: ({issues: Issues[]} & Books)[], userId: string) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    // find the book with nearest checkOutDate in reservation
    const book = books.reduce((selectedBook, book) => {
        const selectedDate = selectedBook.issues[0].checkOutDate;
        const bookDate = book.issues[0].checkOutDate;
        if (!selectedDate || !bookDate) return selectedBook;

        return bookDate < selectedDate ? book : selectedBook
    }, books[0]);

    res.data = await prismaClient.bookReservations.create({
        data: {
            bookInfoId: book.bookInfoId,
            userId,
            reservationDate: book.issues[0].checkOutDate!,
            bookId: book.bookId,
        },
    });

    return res;
};

const reserveWithoutBook = async (bookInfoId: string, userId: string) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    res.data = await prismaClient.bookReservations.create({
        data: {
            bookInfoId,
            userId,
            reservationDate: new Date(),
        },
    });
    
    return res;
};

const reserveBook = async (bookInfoId: string, userId: string) => {
    const availableBooks = await prismaClient.books.findMany({
        where: {
            bookInfoId,
            status: "Available",
        },
    });

    if (availableBooks.length)
        return await reserveAvailable(availableBooks[0], userId);

    const issuedBooks = await prismaClient.books.findMany({
        where: {
            bookInfoId,
            status: "Issued",
            issues: {
                every: {
                    status: "Active",
                },
            },
        },
        include: {
            issues: {
                where: {
                    status: "Active"
                }
            }
        }
    });

    if (issuedBooks.length) return await reserveIssued(issuedBooks, userId);

    return await reserveWithoutBook(bookInfoId, userId);
};

export { reserveBook };
