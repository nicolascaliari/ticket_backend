import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { envs } from '../../config/envs';

export interface UploadedFileResult {
  url: string;
  publicId: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: envs.cloudinaryCloudName,
      api_key: envs.cloudinaryApiKey,
      api_secret: envs.cloudinaryApiSecret,
      secure: true,
    });
  }

  private assertValidImage(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imágenes JPEG, PNG, WEBP o GIF',
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('La imagen no puede superar los 5MB');
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'tickets',
  ): Promise<UploadedFileResult> {
    this.assertValidImage(file);

    try {
      const result = await this.uploadToCloudinary(file, folder);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al subir la imagen';
      throw new InternalServerErrorException(message);
    }
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    if (!publicId?.trim()) {
      throw new BadRequestException('publicId es requerido');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId.trim());
      return { result: result.result as string };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al eliminar la imagen';
      throw new InternalServerErrorException(message);
    }
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary no devolvió resultado'));
            return;
          }
          resolve(result);
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}
