import {z} from "zod";

const FilterParams = z.object({
    id: z.string().optional(),
    seed: z.string().optional(),
    page: z.number()
        .min(1)
        .optional(),
    pageSize: z.number()
        .min(3)
        .optional()
});

export type FilterParamsType = z.infer<typeof FilterParams>;

export default FilterParams;