import { z } from "zod";
import { exists } from "../utils/dbValidation";


const ReservationAssignment = z.object({
    reservationDate: z.coerce.date({ required_error: "Date is required" }),
    reservationId: z.string({ required_error: "Reservation Id is required" })
        .refine(async (val) => await exists("reservations", "reservationId", val), "Reservation doesn't exist"),
    bookId: z.string({ required_error: "Book Id is required" })
        .refine(async (val) => await exists("books", "bookId", val), "Book doesn't exist")
});

export type ReservationAssignmentType = z.infer<typeof ReservationAssignment>;
export default ReservationAssignment;