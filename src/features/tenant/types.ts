export interface Tenant {
  id: number;
  reference: string;

  business_name: string;
  business_phone: string | null;
  business_email: string | null;
  business_gst: string | null;
  business_state: string | null;
  business_state_code: string | null;
  business_mobile: string | null;
  business_address: string | null;
  business_bank: string | null;
  business_owner: string | null;
  business_upi: string | null;
  table_number: string | null;

  // URL or uploaded image URL stored in MariaDB.
  business_logo: string | null;

  is_active: boolean;
  subscription_plan: string | null;
  subscription_expiry: string | null;
  subscription_cycle?: "monthly" | "yearly" | null;
  subscription_started_on?: string | null;
  subscription_amount?: number | string | null;
  subscription_status?: string | null;
  subscription_seats?: number | string | null;
  subscription_auto_renew?: boolean | number | string | null;
  created_at: string;
}