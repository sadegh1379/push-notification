"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  sendBroadcastNotification,
  type NotificationPayload,
} from "../lib/notification-api";

export default function SendNotificationForm() {
  const [formData, setFormData] = useState<NotificationPayload>({
    title: "",
    body: "",
    icon: "/next.svg",
    url: "/",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.body.trim()) {
      setFeedback({
        type: "error",
        message: "Title and body are required.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const data = await sendBroadcastNotification(formData);

      if (data.success) {
        setFeedback({
          type: "success",
          message: `Notification sent to ${data.results?.success ?? "all"} users!`,
        });
      } else {
        setFeedback({
          type: "error",
          message: data.message ?? "Notification send failed.",
        });
      }
    } catch (error) {
      console.error("Unable to send notification:", error);
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to connect to the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.currentTarget;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <section className="flex h-full w-full flex-col rounded-xl border border-[#303030] bg-[#171717] p-5 sm:p-6">
      <header className="border-b border-[#303030] pb-4">
        <h2 className="text-base font-semibold">Send notification</h2>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-4">
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-[#d4d4d4]"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Notification title"
            required
            className="w-full rounded-md border border-[#383838] bg-[#111111] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#737373] focus:border-[#777777] focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="mb-1.5 block text-sm font-medium text-[#d4d4d4]"
          >
            Message
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Write a message"
            rows={3}
            required
            className="w-full resize-y rounded-md border border-[#383838] bg-[#111111] px-3 py-2.5 text-sm leading-5 text-white outline-none transition placeholder:text-[#737373] focus:border-[#777777] focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div>
          <label
            htmlFor="icon"
            className="mb-1.5 block text-sm font-medium text-[#d4d4d4]"
          >
            Icon URL
          </label>
          <input
            type="text"
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="/icon.png"
            className="w-full rounded-md border border-[#383838] bg-[#111111] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#737373] focus:border-[#777777] focus:ring-2 focus:ring-white/10"
          />
        </div>

        <div>
          <label
            htmlFor="url"
            className="mb-1.5 block text-sm font-medium text-[#d4d4d4]"
          >
            Link
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="/"
            className="w-full rounded-md border border-[#383838] bg-[#111111] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#737373] focus:border-[#777777] focus:ring-2 focus:ring-white/10"
          />
        </div>

        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`rounded-md border px-3 py-2 text-sm ${
              feedback.type === "success"
                ? "border-[#28523d] bg-[#14251c] text-[#9be1b8]"
                : "border-[#5a3030] bg-[#291818] text-[#f0aaaa]"
            }`}
          >
            {feedback.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-auto inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[#ededed] px-4 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#171717] disabled:cursor-not-allowed disabled:opacity-60"
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
              Sending
            </>
          ) : (
            "Send"
          )}
        </button>
      </form>
    </section>
  );
}

