import axios from "axios";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = "https://api.paystack.co";

const paystackAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

export interface InitializePaymentParams {
  email: string;
  amount: number; // in smallest currency unit (cents for USD, kobo for NGN) — multiply by 100
  currency?: string; // "USD" or "NGN" (default "USD")
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}

export interface PaystackTransaction {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyTransactionData {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    customer: { email: string };
    metadata: Record<string, unknown>;
  };
}

export const paystack = {
  async initializePayment(params: InitializePaymentParams): Promise<PaystackTransaction> {
    const response = await paystackAxios.post("/transaction/initialize", {
      email: params.email,
      amount: Math.round(params.amount * 100), // convert to smallest unit (cents/kobo)
      currency: params.currency || "USD",
      reference: params.reference,
      callback_url: params.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/verify`,
      metadata: params.metadata || {},
      channels: params.channels || ["card", "bank", "ussd", "mobile_money"],
    });
    return response.data;
  },

  async verifyTransaction(reference: string): Promise<VerifyTransactionData> {
    const response = await paystackAxios.get(`/transaction/verify/${reference}`);
    return response.data;
  },

  async listTransactions(params?: { page?: number; perPage?: number }) {
    const response = await paystackAxios.get("/transaction", { params });
    return response.data;
  },

  async createTransferRecipient(params: {
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
  }) {
    const response = await paystackAxios.post("/transferrecipient", {
      type: "nuban",
      currency: params.currency || "USD",
      ...params,
    });
    return response.data;
  },

  async initiateTransfer(params: {
    amount: number;
    recipient: string;
    reason: string;
    reference: string;
  }) {
    const response = await paystackAxios.post("/transfer", {
      source: "balance",
      amount: Math.round(params.amount * 100),
      recipient: params.recipient,
      reason: params.reason,
      reference: params.reference,
    });
    return response.data;
  },

  async listBanks() {
    const response = await paystackAxios.get("/bank?currency=NGN&country=nigeria");
    return response.data;
  },

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    const response = await paystackAxios.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );
    return response.data;
  },

  generateReference(prefix = "WP"): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  },
};

export default paystack;
