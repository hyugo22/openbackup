import { z } from 'zod';

export const createJobSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(255),
  sourcePath: z.string().trim().min(1, 'Le chemin source est requis').max(1000),
  destinationPath: z.string().trim().min(1, 'Le chemin de destination est requis').max(1000),
});

export const updateJobSchema = createJobSchema;

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
