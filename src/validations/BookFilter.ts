import {z} from "zod";
import FilterParams from "./FilterParams";

const BookSort = z.enum([
    "ratings_asc",
    "ratings_desc",
    "pub_date_asc",
    "pub_date_desc",
    "added_date_asc",
    "added_date_desc",
]);

const BookFilter = FilterParams.pick({
    page: true,
    pageSize: true
}).extend({
    seed: z.string().optional(),
    genre: z.string().optional(),
    author: z.string().optional(),
    publisher: z.string().optional(),
    sort: BookSort.optional(),
});

export type BookFilterType = z.infer<typeof BookFilter>;
export type BookSortType = z.infer<typeof BookSort>;
export default BookFilter;
