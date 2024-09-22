import { BookReservations } from "@prisma/client";
import ModelReturnTypes from "../../../entities/ModelReturnTypes";
import prismaClient from "../../../utils/prismaClient";


const freePreviousReservation = async (barcode: string) => {
    const issued = await prismaClient.issues.findFirst({
        where: {
            status: "Active",
            book: {
                barcode
            }
        }
    });

    await prismaClient.books.update({
        where: {
            barcode
        },
        data: {
            status: issued ? "Issued" : "Available",
        }
    })
};

const issueFine = async (issueId: string) => {
    const issue = await prismaClient.issues.findUnique({
        where: {
            issueId
        }
    });
    
    const dueDate = issue!.dueDate;
    const checkOutDate = issue!.checkOutDate!;

    if (checkOutDate.getTime() <= dueDate.getTime()) return null;

    const timeDiff = Math.abs(checkOutDate.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    const attributes = await prismaClient.globalAttributes.findFirst();
    
    const fine = diffDays * attributes!.penaltyPerDay;

    return prismaClient.penalties.create({
        data: {
            amount: fine,
            penaltyType: "Overdue",
            description: `Overdue fine for ${diffDays} day(s) added`,
            userId: issue!.userId,
            status: "Pending",
        }
    })
}

const getReservation = async (reservationId: string) => {
    return prismaClient.bookReservations.findUnique({
        where: {
            reservationId,
            status: "Confirmed"
        },
        include: {
            book: true
        }
    });
}

const isBookReturned = async (barcode: string) => {
    // book may not be present in the issues table yet. so just check if status is not Active: rather than checking Returned
    const issued = await prismaClient.issues.findFirst({
        where: {
            book: {
                barcode,
            },
            status: "Active"
        }
    });

    return !issued;
}

const validateReservation = (userId: string, bookReturned: boolean, reservation: BookReservations | null) => {
    const res = {statusCode: 400} as ModelReturnTypes;
    if (!reservation) {
        res.error = "Reservation not found";
        return res;
    }
    if (!bookReturned) {
        res.error = "Book not returned";
        return res;
    }

    if (userId !== reservation.userId) {
        res.error = "Book not reserved by the user";
        return res;
    }

    return null;
}

const issue = async (issuer: string, reservationId: string, receiver: string, bookId: string) => {
    const attributes = await prismaClient.globalAttributes.findFirst();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (attributes?.issueValidityDays || 7));

    await prismaClient.issues.create({
        data: {
            userId: receiver,
            bookId: bookId,
            dueDate,
            status: "Active",
            checkInDate: new Date().toISOString(),
            issuedBy: issuer
        }
    });

    await prismaClient.bookReservations.update({
        where: {
            reservationId
        },
        data: {
            status: "Resolved"
        }
    });

    await prismaClient.books.update({
        where: {
            bookId
        },
        data: {
            status: "Issued"
        }
    });
}

const issueBook = async (userId: string, reservationId: string, issuedBook: string, issuerId: string) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const reservation = await getReservation(reservationId);
    const returned = await isBookReturned(issuedBook);
    
    const invalidReservation = validateReservation(userId, returned, reservation);
    if (invalidReservation)
        return invalidReservation;
    
    if (reservation?.book && reservation.book.barcode !== issuedBook) 
            await freePreviousReservation(reservation.book.barcode);
        
    const alreadyReserved = await prismaClient.books.findUnique({
        where: {
            barcode: issuedBook,
            status: "Reserved",
            reservations: {
                every: {
                    userId: {not: userId},
                }
            }
        }
    });

    if (alreadyReserved) 
        await prismaClient.bookReservations.updateMany({
            where: {
                bookId: alreadyReserved.bookId,
                status: "Confirmed",
            },
            data: {
                bookId: null,
            }
        });

    // proceed with issuing the book
    await issue(issuerId, reservation!.reservationId, userId, issuedBook);

    // send the notification

    res.statusCode = 200;
    return res;
}

const returnBook = async (issueId: string) => {
    const res = {statusCode: 400} as ModelReturnTypes;

    const issue = await prismaClient.issues.findUnique({
        where: {
            issueId
        }
    });

    if (!issue) {
        res.error = {error: "Issue not found"};
        return res;
    }

    await prismaClient.issues.update({
        where: {
            issueId
        },
        data: {
            status: "Returned",
            checkOutDate: new Date().toISOString()
        }
    });

    await prismaClient.books.update({
        where: {
            bookId: issue.bookId
        },
        data: {
            status: "Available"
        }
    });

    const fine = await issueFine(issueId);

    res.data = fine ? {message: `Book returned: ${fine.description}`} : {message: "Book returned successfully"};
    res.statusCode = 200;
    return res;
}

export {
    issueBook
}