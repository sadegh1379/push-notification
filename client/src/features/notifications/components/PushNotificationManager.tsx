"use client";

import { useEffect, useState } from "react";
import {
  askUserPermission,
  createNotificationSubscription,
  getUserSubscription,
  isPushNotificationSupported,
  registerServiceWorker,
  unsubscribeUser,
} from "../lib/push-notifications";
import {
  removeSubscriptionFromServer,
  sendSubscriptionToServer,
} from "../lib/notification-api";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (!supported) {
      return;
    }

    setPermission(Notification.permission);

    const initialize = async () => {
      try {
        await registerServiceWorker();
        const subscription = await getUserSubscription();
        setIsSubscribed(Boolean(subscription));
      } catch (error) {
        console.error("Unable to initialize push notifications:", error);
        setFeedback({
          type: "error",
          message: "Unable to initialize push notifications.",
        });
      }
    };

    void initialize();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const userPermission = await askUserPermission();
      setPermission(userPermission);

      if (userPermission !== "granted") {
        setFeedback({
          type: "error",
          message: "You must grant permission to receive notifications.",
        });
        return;
      }

      const subscription = await createNotificationSubscription(VAPID_PUBLIC_KEY);
      await sendSubscriptionToServer(subscription);
      setIsSubscribed(true);
      setFeedback({
        type: "success",
        message: "Successfully subscribed to notifications.",
      });
    } catch (error) {
      console.error("Unable to subscribe to notifications:", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to subscribe to notifications.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const subscription = await getUserSubscription();

      if (subscription) {
        await removeSubscriptionFromServer(subscription);
      }

      const success = await unsubscribeUser();

      if (success) {
        setIsSubscribed(false);
        setFeedback({
          type: "success",
          message: "Successfully unsubscribed from notifications.",
        });
      } else {
        setFeedback({
          type: "error",
          message: "No active notification subscription was found.",
        });
      }
    } catch (error) {
      console.error("Unable to unsubscribe from notifications:", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to unsubscribe from notifications.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSupported === null) {
    return (
      <section
        aria-busy="true"
        className="flex h-full min-h-72 w-full flex-col justify-center rounded-xl border border-[#303030] bg-[#171717] p-6"
      >
        <p className="text-center text-sm text-[#a3a3a3]">
          Checking notification support
        </p>
      </section>
    );
  }

  if (!isSupported) {
    return (
      <section className="flex h-full min-h-72 w-full flex-col justify-center rounded-xl border border-[#303030] bg-[#171717] p-6">
        <p className="text-sm font-medium text-white">
          Notifications are not supported in this browser.
        </p>
      </section>
    );
  }

  const permissionLabel =
    permission === "granted"
      ? "✓ Granted"
      : permission === "denied"
        ? "✗ Denied"
        : "○ Unknown";
  const permissionBadge =
    permission === "granted"
      ? "border-[#28523d] bg-[#14251c] text-[#7bd6a3]"
      : permission === "denied"
        ? "border-[#5a3030] bg-[#291818] text-[#e78b8b]"
        : "border-[#55472a] bg-[#282215] text-[#e1c477]";

  return (
    <section className="flex h-full w-full flex-col rounded-xl border border-[#303030] bg-[#171717] p-5 sm:p-6">
      <header className="border-b border-[#303030] pb-4">
        <h2 className="text-base font-semibold">Subscription</h2>
      </header>

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#a3a3a3]">Permission</p>
          <span
            className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${permissionBadge}`}
          >
            {permissionLabel.replace(/^[✓✗○] /, "")}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#a3a3a3]">Status</p>
          <span
            className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${
              isSubscribed
                ? "border-[#28523d] bg-[#14251c] text-[#7bd6a3]"
                : "border-[#383838] bg-[#202020] text-[#a3a3a3]"
            }`}
          >
            {isSubscribed ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`mt-4 rounded-md border px-3 py-2 text-sm ${
            feedback.type === "success"
              ? "border-[#28523d] bg-[#14251c] text-[#9be1b8]"
              : "border-[#5a3030] bg-[#291818] text-[#f0aaaa]"
          }`}
        >
          {feedback.message}
        </p>
      )}

      <button
        type="button"
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={loading}
        className={`mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717] disabled:cursor-not-allowed disabled:opacity-60 ${
          isSubscribed
            ? "bg-[#8f3535] hover:bg-[#a43f3f] focus-visible:ring-rose-400"
            : "bg-indigo-600 hover:bg-indigo-500 focus-visible:ring-indigo-400"
        }`}
      >
        {loading ? (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4 animate-spin motion-reduce:animate-none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="3"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            Processing
          </>
        ) : isSubscribed ? (
          "Unsubscribe from updates"
        ) : (
          "Enable notifications"
        )}
      </button>

    </section>
  );
}

