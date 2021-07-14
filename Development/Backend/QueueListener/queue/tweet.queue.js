const Redis = require('ioredis')
const redisClient = Redis.createClient(port = 6380, host = "queue-service")
const RedisJSON = require('redis-json')
const redisJsonClient = new RedisJSON(redisClient)
const TWEET_METADATA = 'TWEET_METADATA'
const INIT_META_DATA = { LATEST_TWEET_KEY: -1 }

/*
      npm redis-json lets us store only a JSON as a Value unlike redis-json-py
      So, our Queue will look like this:
            Initially:
            <KEY>             <VALUE>
            'TWEET_METADATA' : {
                                LATEST_TWEET_KEY = -1
                               }
                               
            When a tweet is added:
            <KEY>  <VALUE>
            '0' : {
                    username: demo,
                    content: demoTweet,
                    ... etc ., 
                  }
*/

// setup the queue
redisJsonClient.get(TWEET_METADATA)
.then(async isMetaDataPresent =>
    isMetaDataPresent ? console.log("Tweet metadata is present in queue") : await redisJsonClient.set(TWEET_METADATA, INIT_META_DATA))
.catch (error => console.log("Error connecting with the queue", error))

module.exports = redisJsonClient
