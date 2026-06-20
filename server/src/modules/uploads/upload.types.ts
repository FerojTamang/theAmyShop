export type UploadFolder = string;

export type UploadedImageResult = {
  imageUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
};
