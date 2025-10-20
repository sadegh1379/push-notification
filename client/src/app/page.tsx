import PushNotificationManager from "@/components/PushNotificationManager";
import SendNotificationForm from "@/components/SendNotificationForm";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Push Notification System
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Using Next.js and Node.js
          </p>
        </div>

        {/* Main content - two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Left card: Subscription management */}
          <div className="flex flex-col items-center">
            <PushNotificationManager />
          </div>

          {/* Right card: Send notification */}
          <div className="flex flex-col items-center">
            <SendNotificationForm />
          </div>
        </div>

        {/* Guide */}
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            📚 User Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                User:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Click on "Subscribe to notifications"</li>
                <li>✓ Allow browser permissions</li>
                <li>✓ Receive notifications</li>
                <li>✓ You can unsubscribe at any time</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Admin:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Write the title and message text</li>
                <li>✓ Set the icon and destination link</li>
                <li>✓ Send notification to everyone</li>
                <li>✓ View the send result</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
