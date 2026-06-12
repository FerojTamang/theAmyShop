export type AddressSummary = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  streetAddress: string;
  landmark: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};
