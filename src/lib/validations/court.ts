import { z } from 'zod';

export const courtSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  type: z
    .string()
    .trim()
    .min(2, 'Tipo de piso é obrigatório')
    .max(50, 'Tipo muito longo'),
  sport_type: z.enum(['tennis', 'padel', 'beach-tennis'], {
    errorMap: () => ({ message: 'Selecione uma modalidade válida' }),
  }),
  location: z
    .string()
    .trim()
    .min(3, 'Localização é obrigatória')
    .max(200, 'Localização muito longa'),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 12345-678)'),
  address: z
    .string()
    .trim()
    .min(3, 'Endereço é obrigatório')
    .max(200, 'Endereço muito longo'),
  number: z
    .string()
    .trim()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número muito longo'),
  neighborhood: z
    .string()
    .trim()
    .min(2, 'Bairro é obrigatório')
    .max(100, 'Bairro muito longo'),
  price_per_hour: z
    .number({
      required_error: 'Preço é obrigatório',
      invalid_type_error: 'Preço deve ser um número',
    })
    .positive('Preço deve ser maior que zero')
    .max(9999.99, 'Preço muito alto'),
  description: z
    .string()
    .trim()
    .max(1000, 'Descrição muito longa')
    .optional(),
  image_url: z
    .string()
    .url('URL de imagem inválida')
    .optional()
    .or(z.literal('')),
  features: z.array(z.string()).optional(),
});

export type CourtInput = z.infer<typeof courtSchema>;
