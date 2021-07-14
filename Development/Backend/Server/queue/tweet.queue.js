const Redis = require('ioredis')
const redisClient = Redis.createClient(port = 6380, host = "queue-service")
const RedisJSON = require('redis-json')
const redisJsonClient = new RedisJSON(redisClient)
const TWEET_METADATA = 'TWEET_METADATA'
const INIT_META_DATA = { LATEST_TWEET_KEY: -1 }
    
module.exports = redisJsonClient
