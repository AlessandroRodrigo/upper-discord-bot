import { logger } from "@/lib/logger";
import axios from "axios";

const ACTIVE_STATUS = "ACTIVE";

const hotmartApi = axios.create({
  baseURL: process.env.HOTMART_BASE_URL,
});

async function getToken() {
  const params = new URLSearchParams();
  params.append("client_id", process.env.HOTMART_CLIENT_ID!);
  params.append("client_secret", process.env.HOTMART_CLIENT_SECRET!);
  params.append("grant_type", "client_credentials");

  const response = await hotmartApi.post(
    `/security/oauth/token?${params.toString()}`,
    undefined,
    {
      headers: {
        Authorization: `Basic ${process.env.HOTMART_CLIENT_BASIC}`,
      },
    },
  );

  return response.data.access_token;
}

async function getSubscriptionByEmail(email: string) {
  const token = await getToken();

  const params = new URLSearchParams();

  params.append("subscriber_email", email);

  const response = await hotmartApi.get(
    `/payments/api/v1/subscriptions?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function checkIfSubscriptionIsActive(email: string) {
  try {
    const subscription = await getSubscriptionByEmail(email);
    return subscription?.data?.items?.[0]?.status === ACTIVE_STATUS;
  } catch (error) {
    logger.error(`Failed to get subscription status for ${email}: ${error}`);
    return false;
  }
}
