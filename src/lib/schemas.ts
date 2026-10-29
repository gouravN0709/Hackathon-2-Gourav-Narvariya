/**
 * Shared zod schemas: used by client forms AND server-side validation
 * (Route Handlers run these again on every request).
 */
import { z } from 'zod';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter a valid email address.')
  .regex(EMAIL_RE, 'Enter a valid email address.')
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters for your password.');

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.'),
  email: emailSchema,
  password: passwordSchema,
  terms: z.literal(true, { message: 'Please accept the terms to continue.' }),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const weightSchema = z.coerce
  .number()
  .refine((n) => Number.isFinite(n) && n >= 30 && n <= 300, 'Enter a weight between 30 and 300 kg.');

export const ageSchema = z.coerce
  .number()
  .int('Age must be a whole number.')
  .refine((n) => n >= 14 && n <= 100, 'Enter an age between 14 and 100.');

export const heightSchema = z.coerce
  .number()
  .refine((n) => n >= 120 && n <= 230, 'Enter a height between 120 and 230 cm.');

export const goalWeightSchema = z.coerce
  .number()
  .refine((n) => n >= 30 && n <= 300, 'Enter a goal weight between 30 and 300 kg.');

export const targetSchema = z.coerce.number().int().positive('Enter a number above zero.');

export const profilePatchSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(60).optional(),
  age: ageSchema.optional(),
  height_cm: heightSchema.optional(),
  goal: z.enum(['muscle', 'fat', 'maintain']).optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  diet: z.enum(['vegetarian', 'vegan', 'eggetarian', 'nonveg', 'none']).optional(),
  start_weight: goalWeightSchema.optional(),
  goal_weight: goalWeightSchema.optional(),
  target_kcal: targetSchema.optional(),
  target_protein: targetSchema.optional(),
  target_carbs: targetSchema.optional(),
  target_fats: targetSchema.optional(),
  notif_reminders: z.boolean().optional(),
  notif_weekly: z.boolean().optional(),
  notif_coach: z.boolean().optional(),
  onboarding_completed: z.boolean().optional(),
  current_weight: goalWeightSchema.nullable().optional(),
});

export const mealKeySchema = z.enum(['breakfast', 'lunch', 'dinner', 'snacks']);

export const workoutKeySchema = z.enum(['back', 'legs', 'chest', 'shoulders']);

export const mealEntrySchema = z.object({
  logged_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'),
  meal: mealKeySchema,
  name: z.string().trim().min(1, 'Enter the food name.').max(80),
  serving_label: z.string().trim().max(40).default(''),
  servings: z.coerce.number().refine((n) => n >= 0.5, 'Servings must be at least (1/2).'),
  kcal: z.coerce.number().min(0, 'Enter a number above zero.'),
  protein: z.coerce.number().min(0, 'Enter a number above zero.'),
  carbs: z.coerce.number().min(0, 'Enter a number above zero.'),
  fats: z.coerce.number().min(0, 'Enter a number above zero.'),
  food_key: z.string().trim().max(20).nullable().default(null),
  history: z.boolean().default(false),
});

export const customFoodSchema = z.object({
  name: z.string().trim().min(1, 'Enter the food name.').max(80),
  cat: z.enum(['Protein', 'Lentils & beans', 'Grains', 'Breakfast', 'Vegetables', 'Fruit', 'Snacks', 'Dairy']),
  base: z.string().trim().min(1, 'Enter the serving size.').max(40),
  kcal: z.coerce.number().min(0, 'Enter a number above zero.'),
  protein: z.coerce.number().min(0, 'Enter a number above zero.'),
  carbs: z.coerce.number().min(0, 'Enter a number above zero.'),
  fats: z.coerce.number().min(0, 'Enter a number above zero.'),
  servings: z.array(z.object({ label: z.string().max(40), m: z.number() })).default([]),
});

export const setRowSchema = z.object({
  exercise_key: z.string().trim().min(1).max(20),
  set_no: z.coerce.number().int().min(1),
  kg: z.coerce.number().min(0),
  reps: z.coerce.number().int().min(0),
  done: z.boolean(),
});

export const sessionSchema = z.object({
  performed_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'),
  workout_key: workoutKeySchema,
  name: z.string().trim().min(1).max(80),
  minutes: z.coerce.number().int().min(0, 'Enter the minutes.'),
  volume_kg: z.coerce.number().min(0, 'Enter the volume.'),
  sets: z.array(setRowSchema).max(400).default([]),
});

export const routineSchema = z.object({
  name: z.string().trim().min(1, 'Enter a routine name.').max(60),
  exercise_keys: z.array(z.string().trim().min(1).max(20)).default([]),
});

export const chatMessageUserSchema = z.object({
  text: z.string().trim().min(1, 'Type a question for Nova first.').max(600),
});

export const chatMessageAiSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  card: z.boolean().default(false),
});

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'idea'], { message: 'Pick Bug or Idea.' }),
  message: z.string().trim().min(1, 'Describe the problem or idea.').max(2000, 'Keep it under 2000 characters.'),
  email: z.union([emailSchema, z.literal('')]).optional().default(''),
});

export const extraAddSchema = z.object({
  workout_key: workoutKeySchema,
  exercise_key: z.string().trim().min(1).max(20),
});

export const passwordChangeSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, 'Re-enter your new password.'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string().min(1, 'Re-enter your new password.'),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match.', path: ['confirm'] });

export const deleteAccountSchema = z.object({
  confirm: z.literal('DELETE', { message: 'Type DELETE to confirm.' }),
});
