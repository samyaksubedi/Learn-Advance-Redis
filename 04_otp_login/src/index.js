import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpKey(phone) {
  return `otp:${phone}`;
}
app.post('/otp', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.set(otpKey(phone), otp, 'EX', 30); // valid for 30 seconds
  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ success: true });
});
app.post('/verify', async (req, res) => {
  const { phone, otp } = req.body;
  const storedOtp = await redis.get(otpKey(phone));
  if (storedOtp === otp) {
    await redis.del(otpKey(phone));
    res.json({ success: true, message: 'OTP verified' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid or Expired OTP' });
  }
});

app.get('/otp/:phone/ttl', async (req, res) => {
  const ttl = await redis.ttl(otpKey(req.params.phone));
  res.json({ phone: req.params.phone, ttl });
});
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
