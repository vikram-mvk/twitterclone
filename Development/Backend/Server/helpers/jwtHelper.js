function authenticator (req, res, next, jwt) {
    // Check if the header has a bearer token
    const headerString = req.headers.authorization
    const validHeader = headerString != undefined && headerString.split(" ").length > 1 
    if(!validHeader){
         res.status(403).send("Unauthorized. Bearer token required..")
         return
        }

    // Get the JWT string from the Bearer token
    token = headerString.split(" ")[1]
    jwt.verify(token, 'secretKey', (err, decoded) => {
        if(err) {
            switch(err.name){
                case "TokenExpiredError":
                    res.status(401).send("Session expited")
                    return
                default:
                    res.status(403).send("Unauthorized")
                    return
                }
        }
        else{
            // console.log(decoded) to see the detail stored in
            next() // will call the method next to it
        }
    })
}

module.exports = authenticator