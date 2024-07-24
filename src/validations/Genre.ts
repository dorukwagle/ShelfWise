import { z } from "zod";

const Genre = z.object({
    genre: z.string({required_error: "Genre is required"})
        .min(3, "Must be at least 3 characters")
        .max(50, "Must be at most 20 characters")
});

export type GenreType = z.infer<typeof Genre>;

export default Genre;