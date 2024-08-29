import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  clearBooksData,
  clearUpSetup,
  createBooksMockData,
  Entities,
  executeSafely,
  initialSetup,
  port,
} from "../testUtils";
import FetchRequest from "../FetchRequest";
import prismaClient from "../../src/utils/prismaClient";
import { beforeEach } from "node:test";

describe("Books Flow", async () => {
  const issueBooks = async (nearestDueDate: Date) => {
    await prismaClient.books.updateMany({
      data: {
        status: "Issued",
      }
    });

    const books = await prismaClient.books.findMany({
      where: {
        bookInfoId: Entities.bookInfos[0].bookInfoId
      }
    });

    await prismaClient.issues.createMany({
      data: [
        {
          bookId: books[0].bookId,
          dueDate: new Date("2024-11-22").toISOString(),
          status: "Active",
          checkInDate: new Date().toISOString(),
          userId: Entities.user.userId,
          issuedBy: Entities.user.userId
        },
        {
          bookId: books[1].bookId,
          dueDate: nearestDueDate.toISOString(),
          status: "Active",
          checkInDate: new Date().toISOString(),
          userId: Entities.user.userId,
          issuedBy: Entities.user.userId
        },
        {
          bookId: books[2].bookId,
          dueDate: new Date("2024-11-24").toISOString(),
          status: "Active",
          checkInDate: new Date().toISOString(),
          userId: Entities.user.userId,
          issuedBy: Entities.user.userId
        }
      ]
    });
  };

  const reserveAllBooks = async () => {
    await prismaClient.books.updateMany({
      data: {
        status: "Reserved"
      }
    });
  }

  beforeAll(async () => {
    await initialSetup();
    await createBooksMockData();
  });

  afterAll(async () => {
    await clearBooksData();
    await clearUpSetup();
  });

  describe("/api/bookflow/reservations", async () => {
    const req = new FetchRequest(
      `http://localhost:${port}/api/bookflow/reservations`
    );

    const getReservation = async () => prismaClient.bookReservations.findFirst();

    const createAndConfirmReservation = async () => {
      await executeSafely(async () =>
        req.post(Entities.bookInfos[0].bookInfoId)
      );
      let reservation = await getReservation();
      await executeSafely(async () => req.post("/confirm/" + reservation!.reservationId));

      return await getReservation();
    }

    beforeAll(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await prismaClient.bookReservations.deleteMany();

      await prismaClient.memberships.update({
        where: {
          membershipId: Entities.membership.membershipId
        },
        data: {
          expiryDate: tomorrow
        }
      });
      req.setCookie("sessionId", Entities.session.session);
    });

    afterEach(async () => {
      await prismaClient.bookReservations.deleteMany();
      await prismaClient.issues.deleteMany();
      await prismaClient.books.updateMany({
        data: {
          status: "Available"
        }
      });
    });

 
    it("should reserve a book for today if available", async () => {
      const res = await executeSafely(async () =>
        req.post(Entities.bookInfos[0].bookInfoId)
      );

      const reservation = await prismaClient.bookReservations.findFirst();
      const today = new Date();
  
      expect.soft(res?.status).toBe(200);
      expect.soft(reservation?.status).toBe("Pending");
      expect.soft(reservation?.reservationDate?.toISOString().split("T")[0]).toBe(today.toISOString().split("T")[0]);
      expect.soft(reservation?.bookInfoId).toBe(Entities.bookInfos[0].bookInfoId);
      expect.soft(reservation?.bookId).not.toBe(null);
    });

    it("should create reservation without reserving a book if all books are reserved", async () => {
      await reserveAllBooks();
      
      const res = await executeSafely(async () =>
        req.post(Entities.bookInfos[0].bookInfoId)
      );

      const reservation = await prismaClient.bookReservations.findFirst();
  
      expect.soft(res?.status).toBe(200);
      expect.soft(reservation?.status).toBe("Pending");
      expect.soft(reservation?.bookInfoId).toBe(Entities.bookInfos[0].bookInfoId);
      expect.soft(reservation?.reservationDate).toBe(null);
      expect.soft(reservation?.bookId).toBe(null);
    });

    it("should reserve the first book to be returned if all books issued but none are reserved", async () => {
      // reservation date should be the next day date to be returned
      const nearestDate = new Date("2024-11-20");
      await issueBooks(nearestDate);
      
      const res = await executeSafely(async () =>
        req.post(Entities.bookInfos[0].bookInfoId)
      );

      const reservation = await prismaClient.bookReservations.findFirst();

      expect.soft(res?.status).toBe(200);
      expect.soft(reservation?.status).toBe("Pending");
      expect.soft(reservation?.reservationDate?.toISOString().split("T")[0]).toBe(nearestDate.toISOString().split("T")[0]);
      expect.soft(reservation?.bookInfoId).toBe(Entities.bookInfos[0].bookInfoId);
      expect.soft(reservation?.bookId).not.toBe(null);
    });

    it("should set the book status to reserved when confirmed", async () => {
      await executeSafely(async () =>
        req.post(Entities.bookInfos[0].bookInfoId)
      );

      let reservation = await getReservation();

      const res = await executeSafely(async () => req.post("confirm/" + reservation!.reservationId));

      reservation = await getReservation();
      const data = await res?.json();
      const book = await prismaClient.books.findUnique({
        where: {
          bookId: data?.bookId
        }
      });

      expect.soft(res?.status).toBe(200);
      expect.soft(reservation?.status).toBe("Confirmed");
      expect.soft(book?.status).toBe("Reserved");
    });

    it("should send the reservation notification when the reservation is confirmed", async () => {
      console.log("TODO: Implement this test case: should send the reservation notification when the reservation is confirmed");
    });

    it("should set the book status to available if the reservation is cancelled", async () => {
      // create and confirm reservation
      const reservation = await createAndConfirmReservation();

      // cancel reservation
      const res = await executeSafely(async () => req.delete("cancel/" + reservation!.reservationId));

      const book = await prismaClient.books.findUnique({
        where: {
          bookId: reservation?.bookId!
        }
      });
      
      expect.soft(res?.status).toBe(200);
      expect.soft(book?.status).toBe("Available");
    });

    it("should set the book status to issued if reservation is cancelled on issued book", async () => {
      await reserveAllBooks();
      await issueBooks(new Date("2024-11-20"));

      const reservation = await createAndConfirmReservation();
      const res = await executeSafely(async () => req.delete("cancel/" + reservation!.reservationId));

      const book = await prismaClient.books.findUnique({
        where: {
          bookId: reservation?.bookId!
        }
      });
      
      expect.soft(res?.status).toBe(200);
      expect.soft(book?.status).toBe("Issued");
    });

    it("should return 400 if reservation is not assigned with any book", async () => {
      await reserveAllBooks();

      await executeSafely(async () =>
        req.post(Entities.bookInfos[0].bookInfoId)
      );

      const reservation = await prismaClient.bookReservations.findFirst();
      
      const res = await executeSafely(async () => req.post("confirm/" + reservation!.reservationId));
      const data = await res?.json();

      expect.soft(res?.status).toBe(400);
      expect.soft(data?.error).toContain("assign");
    });
  });
});
