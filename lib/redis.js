import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export const otpService = {
  async storeOTP(email, otp) {
    // Store OTP with 10-minute expiry
    await redis.set(`otp:${email}`, otp, { ex: 600 });
  },

  async verifyOTP(email, otp) {
    const storedOTP = await redis.get(`otp:${email}`);
    return storedOTP === otp;
  },

  async invalidateOTP(email) {
    await redis.del(`otp:${email}`);
  },
};
