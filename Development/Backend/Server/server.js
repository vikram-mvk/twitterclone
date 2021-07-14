// Required libraries
const express =  require('express')
const cors = require('cors')
const mongoClient = require('mongodb').MongoClient
const jwtUtils = require('jsonwebtoken')

// app configurations
const app = express()
app.use(express.json())
app.use(cors())

// My Custom Helpers
const authenticator = require('./helpers/jwtHelper')
const inputValidator = require('./helpers/inputValidationHelper')

mongoClient.connect('mongodb://mongodb-service:27017',{ useNewUrlParser: true,useUnifiedTopology: true})
.then (client => {
    const userCollection =  client.db('TwitterClone').collection('Users') 
    const tweetCollection = client.db('TwitterClone').collection('Tweets')
    startServer(userCollection, tweetCollection)
})
.catch( err => console.log(err))

const startServer = (userCollection, tweetCollection) => {

    // cache and queue
    const tweetQueue = require('./queue/tweet.queue')
    const tweetCache = require('./cache/tweet.cache')

    // routes
    const userRoutes = require('./routes/user.routes')(inputValidator,  userCollection, jwtUtils)
    const tweetRoutes = require('./routes/tweet.routes')(inputValidator, tweetCollection, tweetQueue, tweetCache, jwtUtils, authenticator)

    app.use(userRoutes)
    app.use(tweetRoutes)

    app.listen(5000, () => {console.log('Server started listening on Port 5000')})
}
