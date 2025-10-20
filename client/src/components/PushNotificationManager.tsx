'use client';

import { useState, useEffect } from 'react';
import {
  isPushNotificationSupported,
  registerServiceWorker,
  askUserPermission,
  createNotificationSubscription,
  sendSubscriptionToServer,
  unsubscribeUser,
  removeSubscriptionFromServer,
  getUserSubscription,
} from '@/utils/notification';

// You get this key from your server (will be generated later)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check support
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      // Check current permission
      setPermission(Notification.permission);

      // Register Service Worker
      registerServiceWorker();

      // Check current subscription
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const subscription = await getUserSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Request permission
      const userPermission = await askUserPermission();
      setPermission(userPermission);

      if (userPermission !== 'granted') {
        setMessage('You must grant permission to receive notifications!');
        setLoading(false);
        return;
      }

      // Create subscription
      const subscription = await createNotificationSubscription(VAPID_PUBLIC_KEY);
      
      if (!subscription) {
        setMessage('Error creating subscription!');
        setLoading(false);
        return;
      }

      // Send to server
      const success = await sendSubscriptionToServer(subscription);
      
      if (success) {
        setIsSubscribed(true);
        setMessage('✅ Successfully subscribed to notifications!');
      } else {
        setMessage('❌ Error sending to server!');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage('❌ Error subscribing!');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Get current subscription
      const subscription = await getUserSubscription();
      
      if (subscription) {
        // Remove from server
        await removeSubscriptionFromServer(subscription);
      }

      // Cancel subscription
      const success = await unsubscribeUser();
      
      if (success) {
        setIsSubscribed(false);
        setMessage('✅ Successfully unsubscribed from notifications!');
      } else {
        setMessage('❌ Error unsubscribing!');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage('❌ Error unsubscribing!');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-800 dark:text-yellow-200">
          ⚠️ Your browser does not support push notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🔔 Notification Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Subscribe to receive important updates
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Permission Status:
            </span>
            <span
              className={`text-sm font-semibold ${
                permission === 'granted'
                  ? 'text-green-600 dark:text-green-400'
                  : permission === 'denied'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}
            >
              {permission === 'granted' ? '✓ Granted' : permission === 'denied' ? '✗ Denied' : '○ Unknown'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Subscription Status:
            </span>
            <span
              className={`text-sm font-semibold ${
                isSubscribed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {isSubscribed ? '✓ Active' : '○ Inactive'}
            </span>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              {message}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {!isSubscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Processing...' : '🔔 Subscribe to Notifications'}
            </button>
          ) : (
            <button
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Processing...' : '🔕 Unsubscribe'}
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By subscribing, you will be notified of the latest news and updates
          </p>
        </div>
      </div>
    </div>
  );
}

