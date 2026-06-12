export type UploadFolder =
  | "the-amy-shop/products"
  | "the-amy-shop/customization-references";

export type UploadedImageResult = {
  imageUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
};
