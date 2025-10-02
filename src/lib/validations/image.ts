import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'Imagem deve ter no máximo 5MB',
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: 'Formato de imagem inválido. Use: JPG, PNG ou WebP',
  });

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  try {
    imageFileSchema.parse(file);
    return { valid: true };
  } catch (error: any) {
    const errorMessage = error.errors?.[0]?.message || 'Imagem inválida';
    return { valid: false, error: errorMessage };
  }
};

export type ImageFileInput = z.infer<typeof imageFileSchema>;
