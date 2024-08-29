import { z } from "zod";
import FilterParams from "./FilterParams";

const ReservationFilterParams = FilterParams.omit({
    seed: true
}).extend({
    status: z.enum(["Pending", "Confirmed", "Cancelled", "Resolved"]).optional(),
});

export type ReservationFilterParamsType = z.infer<typeof ReservationFilterParams>;
export default ReservationFilterParams;