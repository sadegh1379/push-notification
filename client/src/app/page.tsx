import PushNotificationManager from "@/features/notifications/components/PushNotificationManager";
import SendNotificationForm from "@/features/notifications/components/SendNotificationForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Notifications
          </h1>
        </div>

        <section
          aria-label="Notification controls"
          className="grid gap-4 lg:grid-cols-2"
        >
          <PushNotificationManager />
          <SendNotificationForm />
        </section>
      </div>
    </main>
  );
}
