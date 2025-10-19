// تابع برای تبدیل VAPID key به فرمت قابل استفاده
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ثبت Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker is not supported in this browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registered successfully:', registration);
    
    // منتظر بمان تا Service Worker فعال شود
    await navigator.serviceWorker.ready;
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// بررسی پشتیبانی از نوتیفیکیشن
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// درخواست پرمیشن از کاربر
export async function askUserPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.error('Notifications are not supported');
    return 'denied';
  }

  return await Notification.requestPermission();
}

// ساخت subscription با VAPID key
export async function createNotificationSubscription(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    console.error('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // بررسی subscription موجود
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Existing subscription found:', existingSubscription);
      return existingSubscription;
    }

    // ساخت subscription جدید
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });

    console.log('New subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return null;
  }
}

// حذف subscription
export async function unsubscribeUser(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const successful = await subscription.unsubscribe();
      console.log('Unsubscribed successfully:', successful);
      return successful;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

// ارسال subscription به سرور
export async function sendSubscriptionToServer(
  subscription: PushSubscription,
  serverUrl: string = 'http://localhost:4000'
): Promise<boolean> {
  try {
    const response = await fetch(`${serverUrl}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }

    console.log('Subscription sent to server successfully');
    return true;
  } catch (error) {
    console.error('Error sending subscription to server:', error);
    return false;
  }
}

// حذف subscription از سرور
export async function removeSubscriptionFromServer(
  subscription: PushSubscription,
  serverUrl: string = 'http://localhost:4000'
): Promise<boolean> {
  try {
    const response = await fetch(`${serverUrl}/api/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }

    console.log('Subscription removed from server successfully');
    return true;
  } catch (error) {
    console.error('Error removing subscription from server:', error);
    return false;
  }
}

// گرفتن وضعیت فعلی subscription
export async function getUserSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

