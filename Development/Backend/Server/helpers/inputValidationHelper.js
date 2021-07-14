function validateInput(req, inputType){
    let valid = false

    // Possible request parameters
    let username, password // LOGIN and SIGNUP
    let id, content, timestamp, imageUrl, comments, likes, datePosted // NEW_TWEET
    let tweetTimestamp // LOAD_MORE_TWEETS

    switch(inputType) {
        case "LOGIN":
            username = req.body.username
            password = req.body.password

            valid = username != undefined && username.length > 0 && password != undefined && password.length > 0
            break
        case "SIGNUP":
            username = req.body.username
            password = req.body.password

            valid = username != undefined && username.length > 0 && password != undefined && password.length > 0
            break
        case "NEW_TWEET":
            id = req.body.id
            username = req.body.username
            content = req.body.content
            timestamp = req.body.timestamp

            valid = username != undefined && username.length > 0 && content != undefined && content.length > 0 && timestamp != undefined
                     && id !=undefined && id.length > 0
            break
        case "LOAD_MORE_TWEETS":
            tweetTimestamp = req.body.tweetTimestamp
            
            valid = tweetTimestamp != undefined
            break
        default:
            break
    }
    
    return valid
}

module.exports = validateInput;