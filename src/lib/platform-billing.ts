import { company } from "./company";

/** Where tenant companies pay the ERP vendor for licence renewals. */
export const platformBilling = {
  providerName: company.name,
  email: company.email,
  phone: company.phone,
  upi: "",
  bank: "",
  currency: company.currency,
};
