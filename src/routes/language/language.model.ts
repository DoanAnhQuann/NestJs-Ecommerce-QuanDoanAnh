import z from 'zod';

export const languageSchema = z.object({
  id: z.string().min(2).max(10),
  name: z.string().min(2).max(500),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
  deletedById: z.string().nullable(),
  deletedAt: z.string().nullable().or(z.date().nullable()),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const languageParamSchema = z
  .object({
    languageId: z.string().min(2).max(10),
  })
  .strict();

export type LanguageParamType = z.infer<typeof languageParamSchema>;

export type LanguageType = z.infer<typeof languageSchema>;

export const languageSchemaBody = languageSchema.pick({
  id: true,
  name: true,
});

export type LanguageTypeBody = z.infer<typeof languageSchemaBody>;

export const languageSchemaRes = z.array(languageSchema);

export type LanguageTypeRes = z.infer<typeof languageSchemaRes>;
