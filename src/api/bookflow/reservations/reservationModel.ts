import { Books, Issues } from "@prisma/client";
import ModelReturnTypes from "../../../entities/ModelReturnTypes";
import prismaClient from "../../../utils/prismaClient";
import ReservationAssignment, { ReservationAssignmentType } from "../../../validations/ReservationAssignment";
import formatValidationErrors from "../../../utils/formatValidationErrors";
import ReservationFilterParams, { ReservationFilterParamsType } from "../../../validations/ReservationFilterParams";
import { getPaginatedItems, WhereArgs } from "../../../utils/paginator";


const findReservation = async (reservationId: string) => {
    return prismaClient.bookReservations.findUnique({
        where: {
            reservationId,
        },
    });
}

const onConfirmedReservationCancel = async (bookId: string) => {
    const issued = await prismaClient.issues.findFirst({
        where: {
            bookId,
            status: "Active",
        }
    });

    await prismaClient.books.update({
        where: {
            bookId
        },
        data: {
            status: issued ? "Issued" : "Available",
        }
    })
};

const reserveAvailable = async (book: Books, userId: string) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    res.data = await prismaClient.bookReservations.create({
        data: {
            bookInfoId: book.bookInfoId,
            userId,
            reservationDate: new Date().toISOString(),
            bookId: book.bookId,
        },
    });

    return res;
};

const reserveIssued = async (books: ({issues: Issues[]} & Books)[], userId: string) => {
    const res = { statusCode: 200 } as ModelReturnTypes;

    // find the book with nearest checkOutDate in reservation
    const book = books.reduce((selectedBook, book) => {
        const selectedDate = selectedBook.issues[0].dueDate;
        const bookDate = book.issues[0].dueDate;
        if (!selectedDate || !bookDate) return selectedBook;

        return bookDate < selectedDate ? book : selectedBook
    }, books[0]);

    res.data = await prismaClient.bookReservations.create({
        data: {
            bookInfoId: book.bookInfoId,
            userId,
            reservationDate: book.issues[0].dueDate!,
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
            userId
        },
    });

    return res;
};

const getAssignableBooks = async (reservationId: string) => {
    const res = {statusCode: 200, data: {}} as ModelReturnTypes;

    const reservation = await findReservation(reservationId);

    if (!reservation) 
        return res;
       
    const available = await prismaClient.books.findMany({
        where: {
            bookInfoId: reservation.bookInfoId,
            status: "Available",
        },
    });

    const issuedBooks = await prismaClient.books.findMany({
        where: {
            bookInfoId: reservation.bookInfoId,
            status: "Issued",
            issues: {
                every: {
                    status: "Active",
                },
            },
        }
    });

    res.data = [...available, ...issuedBooks];
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

const assignBookToReservation = async (body: ReservationAssignmentType) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const validation = await ReservationAssignment.safeParseAsync(body);
    const errRes = formatValidationErrors<ReservationAssignmentType>(validation);
    if (errRes) return errRes;

    res.data = await prismaClient.bookReservations.update({
        where: {
            reservationId: validation.data!.reservationId
        },
        data: {
            bookId: validation.data!.bookId,
            reservationDate: validation.data!.reservationDate
        }
    });

    res.statusCode = 200;
    return res;
};

const confirmReservation = async (reservationId: string) => {
    const res = { statusCode: 400 } as ModelReturnTypes;

    const reservation = await findReservation(reservationId);

    if (!reservation) {
        res.error = {error: "Reservation not found"};
        return res;
    };

    res.data = await prismaClient.bookReservations.update({
        where: {
            reservationId,
        },
        data: {
            status: "Confirmed",
        },
    });

    if (!reservation.bookId) {
        res.error = {error: "Reservation confirmed without book"};
        return res;
    };

    await prismaClient.books.update({
        where: {
            bookId: reservation.bookId
        },
        data: {
            status: "Reserved"
        }
    });

    res.statusCode = 200;
    return res;
};

const getReservations = async (data: ReservationFilterParamsType) => {
    const validation = ReservationFilterParams.safeParse(data);

    const status = validation.data?.status || "Pending";
    const sorting = {created_at: "asc"};
    const include = ["bookInfo", "book", "user"];

   const whereArgs: WhereArgs = {
       defaultSeed: "",
       fields: [
           {column: "status", seed: status}
       ]
   };

   if (validation.data?.id)
        whereArgs.fields.push({column: "userId", seed: validation.data.id});

    return await getPaginatedItems("bookReservations", validation.data!, whereArgs, include, sorting);
};

const cancelReservation = async (reservationId: string) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const reservation = await findReservation(reservationId);
    if (!reservation) {
        res.error = {error: "reservation not found"};
        return res;
    };

    if (reservation.status === "Confirmed")
        await onConfirmedReservationCancel(reservation.bookId!);

    await prismaClient.bookReservations.update({
        where: {
            reservationId
        },
        data: {
            status: "Cancelled"
        }
    });

    return { statusCode: 200 } as ModelReturnTypes;
};

export { 
    reserveBook,
    assignBookToReservation,
    confirmReservation,
    getAssignableBooks,
    cancelReservation,
    getReservations
 };
