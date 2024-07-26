import {z} from "zod";

const FilterParams = z.object({
    id: z.string().optional(),
    seed: z.string().optional(),
    page: z.coerce.number()
        .min(1)
        .optional(),
    pageSize: z.coerce.number()
        .min(3)
        .optional()
});

export type FilterParamsType = z.infer<typeof FilterParams>;

export default FilterParams;