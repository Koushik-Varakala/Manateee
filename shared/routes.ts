import { z } from "zod";

export const api = {
  // Minimal HTTP API since most logic is over Socket.IO
  health: {
    check: {
      method: "GET" as const,
      path: "/api/health",
      responses: {
        200: z.object({ status: z.literal("ok") }),
      },
    },
  },
};

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};
