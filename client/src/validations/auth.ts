import * as z from "zod";

export const registerSchema = z
  .object({
    name: z
      .string({
        error: (issue) => (!issue.input ? "Name is required" : "Invalid name"),
      })
      .min(2, { error: "Name must be at least 2 characters long" })
      .max(30, { error: "Name cannot exceed 30 characters" }),

    email: z.email({
      error: (issue) =>
        !issue.input
          ? "Email is required"
          : "Please enter a valid email address",
    }),

    password: z
      .string({
        error: (issue) =>
          !issue.input ? "Password is required" : "Invalid password",
      })
      .min(6, { error: "Password must be at least 6 characters long" }),

    confirmPassword: z.string({
      error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.email({
    error: (issue) =>
      !issue.input ? "Email is required" : "Please enter a valid email address",
  }),

  password: z
    .string({
      error: (issue) =>
        !issue.input ? "Password is required" : "Invalid password",
    })
    .min(6, { error: "Password must be at least 6 characters long" }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({
      error: (issue) =>
        !issue.input ? "Password is required" : "Invalid password",
    }),

    newPassword: z
      .string({
        error: (issue) =>
          !issue.input ? "Password is required" : "Invalid password",
      })
      .min(6, { error: "Password must be at least 6 characters long" }),

    confirmPassword: z
      .string({
        error: (issue) =>
          !issue.input ? "Password is required" : "Invalid password",
      })
      .min(6, { error: "Password must be at least 6 characters long" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z
    .string({
      error: (issue) =>
        !issue.input ? "Password is required" : "Invalid password",
    })
    .min(1, { error: "Password is required" }),
});

