function tweetRoutes(inputValidator, tweetCollection, tweetQueue ,tweetCache, jwtUtils, authenticator) {
    
    const TWEET_METADATA = 'TWEET_METADATA'
    const LATEST_TWEET_KEY = 'LATEST_TWEET_KEY'
    const CACHE_KEY = 'CACHE_KEY'
    const CACHED_TWEETS = 'CACHED_TWEETS'
    const INIT_CACHE = {CACHED_TWEETS: []}
    const router = require('express').Router()

    /*
        Routes:
            getTweets
            newTweet
            deleteTweet
            likeTweet
            unlikeTweet
            addComment
            searchTweets
            loadMoreTweets
            tweets/:username
    */


    router.route('/getTweets').get( 
    async (req,res) => {
        try {  
            const cachedTweets = (await tweetCache.get(CACHE_KEY))[CACHED_TWEETS]
            cachedTweets.length == 0 ? 
                res.status(404).json({message:'No tweets available'}) : res.status(200).json(cachedTweets)    
            return res
        }   
        catch (exception) {
                console.log(exception)
                res.status(500).send({message:'Internal server error'})
                return res
            }
    });

    router.route('/newTweet').post( (req, res, next) => authenticator(req, res, next, jwtUtils),
    async (req, res) => {
        try 
            { 
              if (inputValidator(req, inputType = "NEW_TWEET") == false) {
                    res.status(401).json({message:'Invalid request'})
                    return res
                }
             
                const newTweet = {
                    id : req.body.id,
                    username : req.body.username,
                    content : req.body.content,
                    image_url: req.body.image_url,
                    comments: req.body.comments,
                    likes: req.body.likes,
                    date_posted: req.body.date_posted,
                    timestamp: req.body.timestamp
                }

                // reserve the Spot first before putting the tweet
                const latestTweetKey = (await tweetQueue.get(TWEET_METADATA))[LATEST_TWEET_KEY]

                await tweetQueue.incr(TWEET_METADATA, {LATEST_TWEET_KEY: 1})
                
                await tweetQueue.set(latestTweetKey + 1, newTweet)
                res.status(200).json({TweetId: latestTweetKey + 1})
                
        } 
        catch (exception) {
                console.log("Error in /newTweet\n", exception)
                res.status(500).json({message:"Internal Server error"})
                return res
        }
        finally {
            return res
        }
    })

    router.route('/tweets/:username').get( 
        async (req,res) => {
            try {  
                const username = req.params.username
                const tweetsOfThisUser = await 
                (
                    tweetCollection
                    .find(
                        { 'username': username }, // first parameter - query
                        { projection:{ _id: 0 } }  // second parameter - other options
                    )
                    .toArray()
                );

                tweetsOfThisUser.length == 0 ? 
                    res.status(404).json({message:username+' has not posted any tweets'}) : res.status(200).json(tweetsOfThisUser)    
                return res
            }   
            catch (exception) {
                    console.log(exception)
                    res.status(500).send({message:'Internal server error'})
                    return res
            }
        });


    router.route('/deleteTweet').post( (req, res, next) => authenticator(req, res, next, jwtUtils), 
    async (req, res) => {
        try {
            const id = req.body.id
            const result = await tweetCollection.deleteOne({'id':id})

            result.deletedCount == 0 ?  res.status(500).json({message:"Internal server error"}) : res.status(200).json({message:'Deletion successful'})
        
        } catch (exception) {
            console.log(exception)
        } finally {
            return res
        }

    })     
        
    router.route('/likeTweet').post( (req, res, next) => authenticator(req, res, next, jwtUtils), 
    async (req, res) => {
        try {
            const id = req.body.tweet_id
            const username = req.body.username

            const result = await tweetCollection.findOneAndUpdate({'id': id}, { '$push': {'likes': username}}, {projection:{ _id: 0 }})
            
            result.ok != 1 ? res.status(500).json({message:"Internal server error"}) : res.status(200).json({message:username+' liked '+id})
        
        } catch (exception) {
            console.log(exception)
        } finally {
             return res
        }   
    })


    router.route('/unlikeTweet').post( (req, res, next) => authenticator(req, res, next, jwtUtils), 
    async (req, res) => {
        try {
            const id = req.body.tweet_id
            const username = req.body.username

            const result = await tweetCollection.findOneAndUpdate({'id': id}, { '$pull': {'likes': username}}, {projection:{ _id: 0 }})
            
            result.ok != 1 ? res.status(500).json({message:"Internal server error"}) : res.status(200).json({message:username+' unliked '+id})
        

        } catch (exception) {
            console.log(exception)
            res.status(500).json({message:'Internal server error'})
        } 
        finally {
             return res
        }
    })

    router.route('/addComment').post((req, res, next) => authenticator(req, res, next, jwtUtils), 
    async (req, res) => {

            const username = req.body.username
            const tweet_id = req.body.tweet_id
            const comment = req.body.comment
            const comment_time = req.body.comment_time
        
            const commentjson = {
                "username": username,
                "comment": comment,
                "comment_time":comment_time
            }

            await tweetCollection.updateOne({'id': tweet_id}, {'$push': {'comments': commentjson}})

            res.status(200).json({message: username+" commented on"+tweet_id})

            return res
    })

    router.route('/searchTweets').post( 
    async (req, res) => {
    try {
        const data = req.body.data
        const filteredTweets = await (tweetCollection.find({'$or': [{'username':{'$regex' : '.*'+data+'.*'}}, {'content':{'$regex' : '.*'+data+'.*'}}]}).toArray())
        res.status(200).json(filteredTweets)
    }
    catch (exception) {
        console.log(exception)
        res.status(500).json({message:'Internal server error'})
    } finally {
        return res
    }
    })

    router.route('/loadMoreTweets').post( (req, res, next) => authenticator(req, res, next, jwtUtils), 
    async (req, res) => {
        try {   
            if (inputValidator(req, inputType = "LOAD_MORE_TWEETS") == false) {
                res.status(401).json({message:'Invalid request'})
                return res
            }

            const timestampInRequest = req.body.tweetTimestamp
            const datePosted = req.body.datePosted
            const moreTweets = await (tweetCollection.find(
            {'$and': [{'timestamp':{'$lt' : timestampInRequest}}, {'date_posted':{'$lte' : datePosted}}]},
            {projection:{ _id: 0 }}
            ).toArray())
            console.log(moreTweets)
            moreTweets.length > 0 ? res.status(200).json(moreTweets) : res.status(400).json({message:'No more tweets available at the moment..'})
            
        }    
        catch (exception) {
            console.log(exception)
            res.status(500).json({message:'Internal server error'})
        } finally {
            return res
        }
    })

    router.route('/purgeCache').get( async (req, res) => {
        await tweetCache.clearAll()
        await tweetCache.set(CACHE_KEY, INIT_CACHE)     
        return res.status(200).send({message:"Cache cleared.."})   
    })


    return router;
}

module.exports = tweetRoutes;