import express from "express";
import prismaClient from "../../../utils/prismaClient";
import {
    assistantManagerAuth,
    authorize,
    withMembership,
} from "../../../middlewares/auth";
import SessionRequest from "../../../entities/SessionRequest";
import { exists } from "../../../utils/dbValidation";
import { assignBookToReservation, cancelReservation, confirmReservation, getAssignableBooks, getReservations, reserveBook } from "./reservationModel";
import { UserRoles } from "../../../constants/enum";
import { ReservationAssignmentType } from "../../../validations/ReservationAssignment";
import { ReservationFilterParamsType } from "../../../validations/ReservationFilterParams";

const reservation = express.Router();

reservation.get("/", authorize,  async (req: SessionRequest<{}, any, ReservationFilterParamsType>, res) => {
    if (req.session?.rolePrecedence! < UserRoles.AssistantManager)
        req.body.id = req.session?.userId;

    const { statusCode, data, error } = await getReservations(req.body);
    return res.status(statusCode).json(error ? error : data);
});

reservation.post(
    "/confirm/:bookReservationId",
    assistantManagerAuth,
    async (req: SessionRequest<{ bookReservationId: string }>, res) => {
        const { statusCode, data, error } = await confirmReservation(
            req.params.bookReservationId
        );
        return res.status(statusCode).json(error ? error : data);
    }
);

reservation.delete(
    "/cancel/:reservationId",
    authorize,
    async (req: SessionRequest<{ reservationId: string }>, res) => {
        const reservation = await prismaClient.bookReservations.findUnique({
            where: {
                reservationId: req.params.reservationId,
                userId: req.session?.userId,
            },
        });

        if (!reservation && !(req.session?.rolePrecedence! >= UserRoles.AssistantManager))
            return res.status(404).send({ error: "You don't have reservation" });

        const { statusCode, data, error } = await cancelReservation(
            req.params.reservationId
        );
        return res.status(statusCode).json(error ? error : data);
    }
);

reservation.post(
    "/:bookInfoId",
    withMembership,
    async (req: SessionRequest<{ bookInfoId: string }>, res) => {
        const bookInfo = await exists(
            "bookInfo",
            "bookInfoId",
            req.params.bookInfoId
        );
        if (!bookInfo) return res.status(404).send({ error: "Book not found" });

        const { statusCode, data, error } = await reserveBook(
            req.params.bookInfoId,
            req.session?.userId!
        );
        return res.status(statusCode).json(error ? error : data);
    }
);

reservation.post("/assign", assistantManagerAuth, async (req: SessionRequest<{}, any, ReservationAssignmentType>, res) => {
    const { statusCode, data, error } = await assignBookToReservation(
        req.body
    );
    return res.status(statusCode).json(error ? error : data);
});

reservation.get("/get-assignables/:reservationId", assistantManagerAuth, async (req: SessionRequest<{ reservationId: string }>, res) => {
    const { statusCode, data, error } = await getAssignableBooks(
        req.params.reservationId
    );
    return res.status(statusCode).json(error ? error : data);
})

export default reservation;
