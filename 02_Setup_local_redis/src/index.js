import express from 'express';
import Redis from 'ioredis';
import mongoose from 'mongoose';

const app = express();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const mongooseUrl =
  process.env.MONGODB_URL || 'mongodb://localhost:27017/learn_redis';

app.get('/redis', async (req, res) => {
  const reply = await redis.ping();
  res.json({ redis: reply });
});

app.get('/mongoose', (req, res) => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    res.json({ mongo: 'connected', db: mongoose.connection.name });
  } else {
    res.status(503).json({ mongo: 'not connected', readyState: state });
  }
});

// Connect ONCE at startup, then start server
mongoose
  .connect(mongooseUrl)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1); // no point running if DB is down
  });

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
