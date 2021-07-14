function userRouter(inputValidator, userCollection, jwtUtils){
    const router = require('express').Router()

    router.route('/login')
    .post(async (req, res) =>
    {
        try 
        {
            if (inputValidator(req, inputType = "LOGIN") == false) {
                res.status(400).json({message:"Both username and password is required."})
                return res
            }
            
            const user = await userCollection.findOne({username:req.body.username, password:req.body.password})
            if (user == undefined || user == null) {
                res.status(403).json({message:"Invalid user name or Password"})
                return res
            }
            else {
                jwtData = {username: user.username}
                jwtResponse = {username:'', token:'', message:''}
                jwtUtils.sign(jwtData, 'secretKey',
                    // Call back
                    (error, token) => { 
                        if(error) {
                            res.status(403).json({message:"Invalid authentication Token"})
                            return res
                        } else {
                            jwtResponse.username = user.username
                            jwtResponse.token = token
                            jwtResponse.message = "Login Success"
                            res.status(200).json(jwtResponse)          
                            return res
                        }
                    }
                )
            }

        } catch (exception) {
            console.log(exception)
            res.status(500).json({message:"Internal Server error"})
            return res 
        }

        return res // Just in case
    });

    router.route('/signup')
    .post(async (req, res) => 
    {
        try 
            {
                if(inputValidator(req, inputType = "SIGNUP") == false){
                    res.status(400).json({message:"Both username and password is required."})
                    return res
                }

                const user = await userCollection.findOne({username:req.body.username})
                if (user != undefined || user != null){
                    res.status(400).json({message:"Sorry, the username is already taken"})
                    return res
                }
                else {
                    const newUser = {username:req.body.username, password: req.body.password}
                    await userCollection.insertOne(newUser)                    
                    res.status(200).json({message:"Signup successful!"})
                    return res
                }
                
            } catch (exception) {
                console.log(exception)
                res.status(500).json({message:"Internal Server error"})
                return res
            }

            return res // Just in case
        }
    );

    return router
}

module.exports = userRouter;