import webpush from 'web-push';
import fs from 'fs';

console.log('🔑 تولید VAPID Keys...\n');

// تولید VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys با موفقیت تولید شدند:\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);

// ذخیره در فایل .env
const envContent = `# VAPID Keys برای Web Push
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}

# اطلاعات تماس (ایمیل یا URL)
VAPID_SUBJECT=mailto:your-email@example.com

# پورت سرور
PORT=4000

# آدرس فرانت‌اند (برای CORS)
CLIENT_URL=http://localhost:3000
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ فایل .env ساخته شد.');
  console.log('\n📝 توجه: Public Key را در فایل .env.local فرانت خود قرار دهید:');
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
} catch (error) {
  console.error('❌ خطا در ذخیره فایل .env:', error);
}

