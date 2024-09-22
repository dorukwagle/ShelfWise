import express from "express";
import SessionRequest from "../../../entities/SessionRequest";
import { issueBook } from "./issuanceModel";

const issuance = express.Router();

issuance.put(
    "/issue/:reservationId/:userId",
    async (
        req: SessionRequest<{
            reservationId: string;
            userId: string;
            barcode: string;
        }>,
        res
    ) => {
        const { reservationId, userId, barcode } = req.params;
        const { data, error, statusCode } = await issueBook(
            userId,
            reservationId,
            barcode,
            req.session?.userId!
        );
        res.status(statusCode).json(error ? error : data);
    }
);

export default issuance;
