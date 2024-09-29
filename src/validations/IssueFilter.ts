import FilterParams from "./FilterParams";
import {z} from "zod";

const IssueFilter = FilterParams.omit({
    id: true
}).extend({
   status: z.enum(["Active", "Returned"]).optional() 
});

export type IssueFilterType = z.infer<typeof IssueFilter>;
export default IssueFilter;