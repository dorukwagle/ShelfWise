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
import { DEFAULT_PAGE_SIZE } from "../../src/constants/constants";
import prismaClient from "../../src/utils/prismaClient";

describe("Books Flow", async () => {
  beforeAll(async () => {
    await initialSetup();
    await createBooksMockData();
  });

  afterAll(async () => {
    await clearBooksData();
    await clearUpSetup();
  });

  describe("POST /api/bookflow/reservations", async () => {
    const req = new FetchRequest(
      `http://localhost:${port}/api/bookflow/reservations`
    );

    beforeAll(async () => {
      await prismaClient.bookReservations.deleteMany();
      req.setCookie("sessionId", Entities.session.session);
    });

    afterEach(async () => {
      await prismaClient.bookReservations.deleteMany();
    });
 
    it("should reserve a book for today if available", async () => {
      const res = await executeSafely(async () =>
        req.post(Entities.bookInfos[0].bookInfoId)
      );

      const reservation = await prismaClient.bookReservations.findFirst();
      const today = new Date();
    
      expect.soft(res?.status).toBe(200);
      expect.soft(reservation?.status).toBe("Pending");
      expect.soft(reservation?.reservationDate).toBe(today);
      expect.soft(reservation?.bookInfoId).toBe(Entities.bookInfos[0].bookInfoId);
    });

    it("should create reservation without reserving a book if all books are reserved", async () => {});

    it("should reserve the first book to be returned if all books issued but none are reserved", async () => {
      // reservation date should be the next day date to be returned
    });

    it("should set the book status to reserved when confirmed", async () => {});

    it("should send the reservation notification when the reservation is confirmed", async () => {});

    it("should set the book status to available if the reservation is cancelled", async () => {});

    it("should set the book status to issued if reservation is cancelled on issued book", async () => {});
  });
});
