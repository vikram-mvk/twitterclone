
function tweetCache (tweetCollection) {

            const Redis = require('ioredis')
            const redisClient = Redis.createClient(port = 6379, host = "cache-service")
            const RedisJSON = require('redis-json')
            const redisJsonClient = new RedisJSON(redisClient)
            const CACHE_KEY = 'CACHE_KEY'
            const INIT_CACHE = { CACHED_TWEETS: [] }

            /*
                  npm redis-json lets us store only a JSON as a Value unlike redis-json-py
                  So, our cache will look like this:
                        <KEY>        <VALUE>
                        'CACHE_KEY': {
                                       CACHED_TWEETS = []
                                      }
            */
            
            redisJsonClient.get(CACHE_KEY)
            .then ( async cacheObject => {
                        
                  tweetCollection.find({}, {projection:{ _id: 0 }}).limit(5).sort({timestamp:-1})
                  .toArray( async (error, result) => 
                  {       
                        if (error) {
                              console.log('error while querying mongodb',error)
                        } else {
                              console.log('Updating cache from database')
                              updatedCache = {CACHED_TWEETS: result}
                              redisJsonClient.set(CACHE_KEY, updatedCache)   
                        }

                        return redisJsonClient                                  
                  })
                  
            })
            .catch( err => {console.log('error connecting to cache redisJson Client')})
      
      return redisJsonClient
}

module.exports = tweetCache