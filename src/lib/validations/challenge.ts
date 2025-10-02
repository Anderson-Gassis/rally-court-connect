import { z } from 'zod';

export const challengeSchema = z.object({
  challenged_id: z.string().uuid('ID de jogador inválido'),
  challenge_type: z.enum(['friendly', 'singles', 'doubles', 'ranking'], {
    errorMap: () => ({ message: 'Selecione um tipo de partida válido' }),
  }),
  preferred_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Data não pode ser no passado'),
  preferred_time: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, 'Horário inválido (HH:MM)'),
  message: z
    .string()
    .trim()
    .max(500, 'Mensagem muito longa')
    .optional(),
});

export type ChallengeInput = z.infer<typeof challengeSchema>;
