import { z } from "zod";

const Publication = z.object({
    publisherName: z.string({required_error: "Publication Name is required"})
        .refine(val => val.split(" ").length >= 2, "Please enter valid publication name"),
    address: z.string({required_error: "Address is required"})
});

export type PublicationType = z.infer<typeof Publication>;

export default Publication;