import z from "zod";

export const addDatabaseSchema = z.object({
  name: z.string("Name is required").max(50, "Name too long"),
  uri: z.url("Database URI is required"),
});
