'use client';

import { useState, useEffect } from 'react';

export default function DebugPanel() {
  const [status, setStatus] = useState({
    swSupported: false,
    swRegistered: false,
    permission: 'default' as NotificationPermission,
    hasSubscription: false,
    serverOnline: false,
    vapidKey: false,
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const newStatus = {
      swSupported: 'serviceWorker' in navigator,
      swRegistered: false,
      permission: Notification.permission,
      hasSubscription: false,
      serverOnline: false,
      vapidKey: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    };

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        newStatus.swRegistered = !!registration;

        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          newStatus.hasSubscription = !!subscription;
        }
      } catch (error) {
        console.error('Error checking SW:', error);
      }
    }

    // Check server
    try {
      const response = await fetch('http://localhost:4000/', {
        method: 'GET',
      });
      newStatus.serverOnline = response.ok;
    } catch (error) {
      console.error('Server offline:', error);
    }

    setStatus(newStatus);
  };

  const StatusItem = ({ label, value, isGood }: { label: string; value: string; isGood: boolean }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`text-sm font-semibold ${isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isGood ? '✓' : '✗'} {value}
      </span>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          🔍 System Status (Debug)
        </h3>
        <button
          onClick={checkStatus}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          🔄 Recheck
        </button>
      </div>

      <div className="space-y-1">
        <StatusItem
          label="Service Worker Support"
          value={status.swSupported ? 'Yes' : 'No'}
          isGood={status.swSupported}
        />
        <StatusItem
          label="Service Worker Registered"
          value={status.swRegistered ? 'Yes' : 'No'}
          isGood={status.swRegistered}
        />
        <StatusItem
          label="Notification Permission"
          value={status.permission === 'granted' ? 'Granted' : status.permission === 'denied' ? 'Denied' : 'Unknown'}
          isGood={status.permission === 'granted'}
        />
        <StatusItem
          label="Active Subscription"
          value={status.hasSubscription ? 'Yes' : 'No'}
          isGood={status.hasSubscription}
        />
        <StatusItem
          label="Backend Server"
          value={status.serverOnline ? 'Online' : 'Offline'}
          isGood={status.serverOnline}
        />
        <StatusItem
          label="VAPID Public Key"
          value={status.vapidKey ? 'Configured' : 'Not Set'}
          isGood={status.vapidKey}
        />
      </div>

      {/* Suggestions */}
      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          💡 Possible Issues:
        </p>
        <ul className="space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
          {!status.swRegistered && <li>• Service Worker not registered - Refresh the page (F5)</li>}
          {status.permission !== 'granted' && <li>• Notification permission not granted - Click the subscribe button</li>}
          {!status.hasSubscription && status.permission === 'granted' && <li>• No subscription - Subscribe again</li>}
          {!status.serverOnline && <li>• Backend server is offline - In terminal: cd backend && npm run dev</li>}
          {!status.vapidKey && <li>• VAPID Key not configured - Check .env.local file</li>}
        </ul>
      </div>

      {/* Quick guide */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
          🔧 Quick Fix:
        </p>
        <ol className="space-y-1 text-xs text-blue-700 dark:text-blue-300 list-decimal list-inside">
          <li>Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)</li>
          <li>Check notification permission (lock icon next to address)</li>
          <li>Subscribe again</li>
          <li>Any errors in Console (F12)?</li>
          <li>Is the Backend server running on port 4000?</li>
        </ol>
      </div>
    </div>
  );
}

