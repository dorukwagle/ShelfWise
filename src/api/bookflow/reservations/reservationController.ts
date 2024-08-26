import express from "express";
import prismaClient from "../../../utils/prismaClient";
import { withMembership } from "../../../middlewares/auth";
import SessionRequest from "../../../entities/SessionRequest";
import { exists } from "../../../utils/dbValidation";
import { reserveBook } from "./reservationModel";

const reservation = express.Router();

reservation.get("/", async (req, res) => {
    return res.status(200).json([]);
});

reservation.post("/:bookInfoId", withMembership, async (req: SessionRequest<{ bookInfoId: string }>, res) => {
    const bookInfo = await exists("bookInfo", "bookInfoId", req.params.bookInfoId);
    if (!bookInfo) return res.status(404).send({ error: "Book not found" });

   const {statusCode, data, error} = await reserveBook(req.params.bookInfoId, req.session?.userId!);
   return res.status(statusCode).json(error ? error : data);
});

export default reservation;