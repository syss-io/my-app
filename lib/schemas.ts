import { z } from "zod";

export const tones = [
  "fun",
  "professional",
  "luxury",
  "playful",
  "edgy",
  "approachable",
] as const;

export const namingRequestSchema = z.object({
  ideaSummary: z.string().min(10, "Share at least a sentence about the idea."),
  targetAudience: z.string().min(3, "Describe who you are building for."),
  tone: z.enum(tones),
  keywords: z.array(z.string()).default([]),
  tldPreferences: z.array(z.string()).min(1),
  lengthRange: z
    .tuple([z.number().min(3), z.number().max(30)])
    .refine(([min, max]) => min < max, {
      message: "Minimum must be less than maximum.",
    }),
  requireExactDomain: z.boolean(),
  preferInternational: z.boolean(),
  seoFocus: z.boolean(),
  location: z
    .string()
    .min(2)
    .max(5),
  registrar: z.string().min(2),
});

export type NamingRequest = z.infer<typeof namingRequestSchema>;

export const domainStatusSchema = z.object({
  domain: z.string(),
  status: z.enum(["available", "unavailable", "unknown"]),
  info: z.string().optional(),
});

export const namingSuggestionSchema = z.object({
  name: z.string(),
  rationale: z.string(),
  tagline: z.string().optional(),
  domains: z.array(domainStatusSchema).min(1),
});

export const namingResponseSchema = z.object({
  suggestions: z.array(namingSuggestionSchema).min(1),
  positioningNotes: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
});

export type NamingResponse = z.infer<typeof namingResponseSchema>;
export type NamingSuggestion = z.infer<typeof namingSuggestionSchema>;

