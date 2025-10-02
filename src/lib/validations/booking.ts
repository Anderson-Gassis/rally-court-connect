import { z } from 'zod';

export const bookingSchema = z.object({
  courtId: z.string().uuid('ID de quadra inválido'),
  date: z.date({
    required_error: 'Data é obrigatória',
    invalid_type_error: 'Data inválida',
  }).refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'Data não pode ser no passado',
  }),
  startTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, 'Horário inválido (HH:MM)'),
  endTime: z
    .string()
    .regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, 'Horário inválido (HH:MM)'),
}).refine(
  (data) => {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: 'Horário de término deve ser após o horário de início',
    path: ['endTime'],
  }
).refine(
  (data) => {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    const duration = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
    return duration >= 0.5 && duration <= 12;
  },
  {
    message: 'Duração deve ser entre 30 minutos e 12 horas',
    path: ['endTime'],
  }
);

export type BookingInput = z.infer<typeof bookingSchema>;
