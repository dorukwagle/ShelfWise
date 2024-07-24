import { z } from "zod";

const Author = z.object({
    title: z.enum(["Mr", "Ms", "Mrs"]),
    fullName: z.string({required_error: "Full Name is required"})
        .refine(val => val.split(" ").length >= 2, "Please enter author's full name")
});

export type AuthorType = z.infer<typeof Author>;

export default Author;