import express from "express";
import SessionRequest from "../../../entities/SessionRequest";
import { getIssues, issueBook, returnBook } from "./issuanceModel";

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

issuance.post("/issues/return/:issueId", async (req: SessionRequest<{ issueId: string }>, res) => {
    const { data, error, statusCode } = await returnBook(req.params.issueId);
    res.status(statusCode).json(error ? error : data);
});

issuance.get("/", async (req, res) => {
   const { data, error, statusCode } = await getIssues(req.query);
   res.status(statusCode).json(error ? error : data); 
});

export default issuance;
