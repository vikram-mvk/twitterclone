// Just get access to the cache, setting up cache will be taken care of by the CacheManager
const Redis = require('ioredis')
const RedisJSON = require('redis-json')
const redisClient = Redis.createClient(port = 6379, host = "cache-service")
const redisJsonCache = new RedisJSON(redisClient)   
module.exports = redisJsonCache
