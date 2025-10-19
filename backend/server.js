import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pushNotificationManager from './utils/PushNotificationManager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  credentials: false
}));
app.use(express.json());

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  try {
    pushNotificationManager.setupVapid(
      process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.error('Error setting up VAPID:', error.message);
  }
} else {
  console.warn('VAPID keys not found! Please run "npm run generate-vapid" first.');
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Push notification server is running',
    subscriptions: pushNotificationManager.getCount(),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;

  try {
    const result = pushNotificationManager.addSubscription(subscription);
    
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed',
      totalSubscriptions: result.totalSubscriptions
    });
  } catch (error) {
    console.error('Error saving subscription:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/unsubscribe', (req, res) => {
  const subscription = req.body;

  try {
    const result = pushNotificationManager.removeSubscription(subscription);
    
    res.json({
      success: true,
      message: result.existed ? 'Successfully unsubscribed' : 'Subscription not found',
      totalSubscriptions: result.totalSubscriptions
    });
  } catch (error) {
    console.error('Error removing subscription:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/send-notification', async (req, res) => {
  const { endpoint, title, body, icon, url } = req.body;

  if (!endpoint) {
    return res.status(400).json({
      success: false,
      message: 'Endpoint is required'
    });
  }

  try {
    await pushNotificationManager.sendToEndpoint(endpoint, { title, body, icon, url });
    
    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    const statusCode = error.message === 'Subscription not found' ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
});

app.post('/api/broadcast', async (req, res) => {
  const { title, body, icon, url } = req.body;

  try {
    const results = await pushNotificationManager.broadcast({ title, body, icon, url });
    
    res.json({
      success: true,
      message: 'Broadcast sent to all users',
      results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/subscriptions', (req, res) => {
  const { count, subscriptions } = pushNotificationManager.getSubscriptionsList();

  res.json({
    success: true,
    count,
    subscriptions
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log('\n🚀 Push Notification Server Started');
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log('\n✨ Ready to handle requests...\n');
});
