const tweetQueue = require('./queue/tweet.queue')
let TWEETS_TO_SEND = []
const TWEET_METADATA = 'TWEET_METADATA'
const LATEST_TWEET_KEY = 'LATEST_TWEET_KEY'
const mongoClient = require('mongodb').MongoClient

function main () {
    mongoClient.connect('mongodb://mongodb-service:27017', {useNewUrlParser: true,useUnifiedTopology: true})
    .then( client => {
        const tweetCollection = client.db('TwitterClone').collection('Tweets')
        setInterval( () => pollFromQueue(tweetCollection), 5000)
    })
    .catch(err => console.log("Unable to start Queue Listener\n", err))   
}

const pollFromQueue = async (tweetCollection) => 
{
    try 
        {
            let latestTweetKey = (await tweetQueue.get(TWEET_METADATA))[LATEST_TWEET_KEY]
            if (latestTweetKey == -1 ) {
                console.log("No tweets in queue")
                return
            }

            // Remove all the tweets from the Queue and put it in a array 
            for (let i = 0; i <= latestTweetKey; i++) {
                const tweet = await tweetQueue.get(i)
                if (tweet != null || tweet != undefined) {
                    console.log("Popping tweet from queue", tweet)
                    await tweetQueue.del(i)
                    TWEETS_TO_SEND.push(tweet)
                }
            }

            // reset latest tweetkey to -1
            await tweetQueue.set(TWEET_METADATA, {LATEST_TWEET_KEY: -1})

            // In the mean time, if some other tweet has come before we set latestTweetKey to -1 grab them and push them to the array
            latestTweetKey += 1
            let tweetAfterLatest = await tweetQueue.get(latestTweetKey)
            while (tweetAfterLatest != undefined || tweetAfterLatest != null) {
                TWEETS_TO_SEND.push(tweetAfterLatest)
                latestTweetKey += 1 
                tweetAfterLatest = await tweetQueue.get(latestTweetKey)
            }

            // Send tweets to DB
            const result = await tweetCollection.insertMany(TWEETS_TO_SEND);
            TWEETS_TO_SEND = []

        } catch (exception) {
            console.log("\nError in Queue Listener\n", exception)
        }
}

// Starting point
main()