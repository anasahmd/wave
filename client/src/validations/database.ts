import z from "zod"

export const addDatabaseSchema = z.object({
  name: z.string("Name is required"),
})
