import webpush from 'web-push';

class PushNotificationManager {
  constructor() {
    this.subscriptions = new Map();
  }

  setupVapid(subject, publicKey, privateKey) {
    if (!publicKey || !privateKey) {
      throw new Error('VAPID keys are required');
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    console.log('✅ VAPID keys configured');
  }

  addSubscription(subscription) {
    if (!subscription || !subscription.endpoint) {
      throw new Error('Invalid subscription');
    }


    const key = subscription.endpoint;
    this.subscriptions.set(key, subscription);

    console.log(`✅ New subscription added (${this.subscriptions.size} active users)`);

    return {
      success: true,
      subscription,
      totalSubscriptions: this.subscriptions.size
    };
  }

  removeSubscription(subscription) {
    if (!subscription || !subscription.endpoint) {
      throw new Error('Invalid subscription');
    }

    const key = subscription.endpoint;
    const existed = this.subscriptions.has(key);

    if (existed) {
      this.subscriptions.delete(key);
      console.log(`✅ Subscription removed (${this.subscriptions.size} active users)`);
    }

    return {
      success: true,
      existed,
      totalSubscriptions: this.subscriptions.size
    };
  }

  async sendToSubscription(subscription, payload) {
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const jsonPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);

    try {
      await webpush.sendNotification(subscription, jsonPayload);
      console.log('✅ Notification sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending notification:', error.message);

      if (error.statusCode === 410) {
        this.subscriptions.delete(subscription.endpoint);
        console.log('🗑️  Expired subscription removed');
      }

      throw error;
    }
  }

  async sendToEndpoint(endpoint, notificationData) {
    const subscription = this.subscriptions.get(endpoint);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const payload = {
      title: notificationData.title || 'New Notification',
      body: notificationData.body || 'You have a new message',
      icon: notificationData.icon || '/next.svg',
      url: notificationData.url || '/'
    };

    return await this.sendToSubscription(subscription, payload);
  }

  async broadcast(notificationData) {
    if (this.subscriptions.size === 0) {
      throw new Error('No users subscribed');
    }

    const payload = {
      title: notificationData.title || 'Announcement',
      body: notificationData.body || 'This is a broadcast message',
      icon: notificationData.icon || '/next.svg',
      url: notificationData.url || '/'
    };

    const results = {
      success: 0,
      failed: 0,
      total: this.subscriptions.size
    };

    const promises = [];

    for (const [endpoint, subscription] of this.subscriptions) {
      const promise = this.sendToSubscription(subscription, payload)
        .then(() => {
          results.success++;
        })
        .catch((error) => {
          results.failed++;
          console.error(`❌ Error sending to ${endpoint.substring(0, 50)}...`, error.message);
        });

      promises.push(promise);
    }

    await Promise.all(promises);

    console.log(`📤 Broadcast completed: ${results.success} succeeded, ${results.failed} failed`);

    return results;
  }

  getSubscriptionsList() {
    const list = Array.from(this.subscriptions.keys()).map((endpoint, index) => ({
      id: index + 1,
      endpoint: endpoint.substring(0, 50) + '...',
      fullEndpoint: endpoint
    }));

    return {
      count: this.subscriptions.size,
      subscriptions: list
    };
  }

  hasSubscription(endpoint) {
    return this.subscriptions.has(endpoint);
  }

  getCount() {
    return this.subscriptions.size;
  }

  clearAll() {
    const count = this.subscriptions.size;
    this.subscriptions.clear();
    console.log(`🗑️  ${count} subscriptions cleared`);
    return count;
  }

  getSubscription(endpoint) {
    return this.subscriptions.get(endpoint);
  }
}

const pushNotificationManager = new PushNotificationManager();

export default pushNotificationManager;
