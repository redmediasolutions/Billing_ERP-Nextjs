export interface Vendor {
  id: number;
  reference: string;
  vendor_name: string;
  vendor_phone: string | null;
  vendor_email: string | null;
  vendor_logo: string | null;
  vendor_address: string | null;
  is_local_vendor: number | boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorInput {
  vendor_name: string;
  vendor_phone: string;
  vendor_email: string;
  vendor_logo: string;
  vendor_address: string;
  is_local_vendor: boolean;
}