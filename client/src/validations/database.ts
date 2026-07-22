import z from "zod";

export const addDatabaseSchema = z.object({
  name: z.string("Name is required"),
  uri: z.url("Database URI is required"),
});
