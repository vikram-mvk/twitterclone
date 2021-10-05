const mongoClient = require('mongodb').MongoClient
const CACHE_KEY = 'CACHE_KEY'
const CACHED_TWEETS = 'CACHED_TWEETS'

function main () {
    mongoClient.connect('mongodb://mongodb-service:27017', {useNewUrlParser: true,useUnifiedTopology: true})
    .then( client => {
        const tweetCollection = client.db('TwitterClone').collection('Tweets')
        const tweetCache = require('./cache/tweet.cache')(tweetCollection)
        setInterval( ()=> updateCache(tweetCollection, tweetCache), 3000)
    })
    .catch(err => console.log("Unable to start Cache Manager\n", err))   
}

const updateCache = async (tweetCollection, tweetCache) => {
    try {
        const updatedCache = await (tweetCollection.find({}, {projection:{ _id: 0 }}).limit(5).sort({timestamp:-1}).toArray())
        await tweetCache.rewrite(CACHE_KEY, {CACHED_TWEETS : updatedCache})
        console.log('cache updated')
    } 
    catch (exception) {
        console.log(exception)
    }
}

main()