import PushNotificationManager from "@/components/PushNotificationManager";
import SendNotificationForm from "@/components/SendNotificationForm";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-7xl mx-auto">
        {/* هدر */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            سیستم پوش نوتیفیکیشن
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            با استفاده از Next.js و Node.js
          </p>
        </div>

        {/* محتوای اصلی - دو ستونه */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* کارت سمت چپ: مدیریت عضویت */}
          <div className="flex flex-col items-center">
            <PushNotificationManager />
          </div>

          {/* کارت سمت راست: ارسال نوتیفیکیشن */}
          <div className="flex flex-col items-center">
            <SendNotificationForm />
          </div>
        </div>

        {/* راهنما */}
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            📚 راهنمای استفاده
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                کاربر:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ روی "عضویت در نوتیفیکیشن" کلیک کنید</li>
                <li>✓ به مرورگر اجازه دهید</li>
                <li>✓ نوتیفیکیشن‌ها را دریافت کنید</li>
                <li>✓ هر زمان می‌توانید لغو عضویت کنید</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                مدیر:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ عنوان و متن پیام را بنویسید</li>
                <li>✓ آیکون و لینک مقصد را تعیین کنید</li>
                <li>✓ نوتیفیکیشن را به همه ارسال کنید</li>
                <li>✓ نتیجه ارسال را مشاهده کنید</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
