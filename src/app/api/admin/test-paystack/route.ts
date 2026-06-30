import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const envStatus = {
    PAYSTACK_SECRET_KEY: secretKey ? `set (${secretKey.slice(0, 16)}...)` : "NOT SET",
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: publicKey ? `set (${publicKey.slice(0, 16)}...)` : "NOT SET",
  };

  if (!secretKey) {
    return NextResponse.json({ success: false, error: "PAYSTACK_SECRET_KEY is not set in environment variables", envStatus });
  }

  try {
    // Test 1: ping Paystack with a minimal transaction initialize
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: "test@writeprof.com",
        amount: 6000, // $60 in cents
        currency: "USD",
        reference: `TEST_${Date.now()}`,
      },
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Paystack is working correctly",
      envStatus,
      paystackResponse: {
        status: res.data.status,
        message: res.data.message,
        authorizationUrl: res.data.data?.authorization_url,
      },
    });
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: unknown; status?: number }; message?: string };
    return NextResponse.json({
      success: false,
      error: "Paystack API call failed",
      envStatus,
      paystackError: axiosErr.response?.data || axiosErr.message,
      httpStatus: axiosErr.response?.status,
    });
  }
}
