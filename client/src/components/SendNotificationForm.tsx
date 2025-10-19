'use client';

import { useState } from 'react';

interface NotificationFormData {
  title: string;
  body: string;
  icon: string;
  url: string;
}

export default function SendNotificationForm() {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    body: '',
    icon: '/next.svg',
    url: '/'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // اعتبارسنجی
    if (!formData.title.trim() || !formData.body.trim()) {
      setMessage('❌ عنوان و متن الزامی هستند!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`✅ نوتیفیکیشن به ${data.results?.success || 'همه'} کاربر ارسال شد!`);
        // ریست فرم
        // setFormData({
        //   title: '',
        //   body: '',
        //   icon: '/next.svg',
        //   url: '/'
        // });
      } else {
        setMessage(`❌ خطا: ${data.message || 'ارسال ناموفق بود'}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setMessage('❌ خطا در ارتباط با سرور! آیا سرور در حال اجراست؟');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          📤 ارسال نوتیفیکیشن
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          نوتیفیکیشن خود را به همه کاربران ارسال کنید
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* عنوان */}
        <div>
          <label 
            htmlFor="title" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            عنوان <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="مثال: اطلاعیه مهم"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* متن */}
        <div>
          <label 
            htmlFor="body" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            متن پیام <span className="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="متن کامل نوتیفیکیشن خود را بنویسید..."
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          />
        </div>

        {/* لینک آیکون */}
        <div>
          <label 
            htmlFor="icon" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            لینک آیکون
          </label>
          <input
            type="text"
            id="icon"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="https://example.com/icon.png"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            پیش‌فرض: /next.svg
          </p>
        </div>

        {/* لینک مقصد */}
        <div>
          <label 
            htmlFor="url" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            لینک مقصد (URL)
          </label>
          <input
            type="text"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="/page-url یا https://example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            صفحه‌ای که با کلیک روی نوتیفیکیشن باز می‌شود
          </p>
        </div>

        {/* پیغام نتیجه */}
        {message && (
          <div className={`p-3 rounded-lg border ${
            message.startsWith('✅') 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-sm text-center ${
              message.startsWith('✅')
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* دکمه ارسال */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? '⏳ در حال ارسال...' : '🚀 ارسال نوتیفیکیشن'}
        </button>
      </form>

      {/* راهنمای سریع */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
          💡 نکته: نوتیفیکیشن فقط به کاربرانی که عضو شده‌اند ارسال می‌شود
        </p>
      </div>
    </div>
  );
}

