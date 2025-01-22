require('dotenv').config()

const netId = Number(process.env.NET_ID) || 1

module.exports = {
  netId,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  port: process.env.APP_PORT || 8000,
  zkVerifySeed: process.env.ZK_VERIFY_SEED,
}
