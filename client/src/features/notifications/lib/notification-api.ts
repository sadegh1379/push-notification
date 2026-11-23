export interface NotificationPayload {
  title: string;
  body: string;
  icon: string;
  url: string;
}

interface BroadcastResponse {
  success: boolean;
  message?: string;
  results?: {
    success?: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_SERVER_URL is not configured.");
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}${path}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function postJson(path: string, body: unknown): Promise<void> {
  const response = await fetch(getApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }
}

export async function sendSubscriptionToServer(
  subscription: PushSubscription,
): Promise<void> {
  await postJson("/api/subscribe", subscription);
}

export async function removeSubscriptionFromServer(
  subscription: PushSubscription,
): Promise<void> {
  await postJson("/api/unsubscribe", subscription);
}

export async function sendBroadcastNotification(
  payload: NotificationPayload,
): Promise<BroadcastResponse> {
  const response = await fetch(getApiUrl("/api/broadcast"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  if (!isRecord(data) || typeof data.success !== "boolean") {
    throw new Error("The server returned an invalid broadcast response.");
  }

  const results = isRecord(data.results) ? data.results : undefined;

  return {
    success: data.success,
    message: typeof data.message === "string" ? data.message : undefined,
    results:
      results && typeof results.success === "number"
        ? { success: results.success }
        : undefined,
  };
}

