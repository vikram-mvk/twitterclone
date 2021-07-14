import React from 'react';
import { useSelector, useDispatch } from 'react-redux'
import {setUserDetails} from './Redux/ActionCreators'
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './HomePage.css';
import Axios from "axios";
import { Avatar, Button } from "@material-ui/core";
import MetaTags from 'react-meta-tags';


export default function HomePage() 
{
    const mycss = {  
      backgroundImage:'url("https://virtualwindow.com/wp-content/uploads/2013/08/Twitter-Background.jpg")',        
      height: '100vh'
    }
    
    const [img, setimg]= React.useState(undefined)

    const [login, setLogin] = React.useState({'username':'','password':''});
    const [note, setnote]= React.useState({type:'', message:''})
    const dispatch = useDispatch();


    const onLogin = async (e) =>{ 
      try {  
        const response = await Axios.post('/login', login)
        dispatch(setUserDetails({username: response.data.username, token: response.data.token}))
      }
      catch (error) {
        setnote({
            type: 'ERROR',
            message: error.response == undefined ? 'Error: Cannot communicate to the backend' : error.response.data.message
          }
        ) 
      }
  }

    
    const onSignup = async (e) => {
      try {  
        const response = await Axios.post('/signup', login)
        
        if (img) {
          let formData = new FormData();    //formdata object
          formData.append('img',img)
          formData.append('tweet_id',login.username)
          const response = await Axios.post('/upload', formData, {content_type:'multipart/form-data'})     
        }
        setnote({
          type:'SUCCESS',
          message:response.data.message
        })
      }
      catch (error) {
        setnote({
            type: 'ERROR',
            message: error.response == undefined ? 'Error: Cannot communicate to the backend' : error.response.data.message
          }
        ) 
      }
  } 
    
    const onGuest = (e) =>{ 
        dispatch(setUserDetails({username:'guest'}))
    }
    
    const isInvalidUserName = () => {
      let usernameRegex = /^[a-zA-Z0-9]+$/; //only letters and numbers
      if(login.username.length>0){
              return !(login.username.match(usernameRegex))
      }
        return true;
    }

  const isInvalidPassword = () => {
    let passwordRegex = /^(?=.*[\w])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,15}$/;

    if (login.password.length > 0) {
                return !(login.password.match(passwordRegex))
        }
          return true;
      }


    return(
  <div style={mycss}>
          <MetaTags>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />

          </MetaTags>

<div class="wrapper">
  <div id="formContent">
    <div class="fadeIn first">
    </div>
      
      <input type="text" id="login" class="fadeIn second ip-maintext" name="login" placeholder="Username (Alphanumeric characters only)"
      onChange= { e => setLogin({...login,'username':e.target.value}) }
       /> 
      
      {isInvalidUserName()? <span>&#10060;</span>:<span>&#9989;</span>}
      
      <input type="password" id="password" class="fadeIn third ip-maintext" name="login" placeholder="Password (8-15 characters with atleast 1 symbol)"
      onChange= { e => setLogin({...login,'password':e.target.value}) }
       /> 
      
      {isInvalidPassword()? <span>&#10060;</span>:<span>&#9989;</span>}
      
      <br/>

    <small className={note && note.type == 'ERROR' ? 'text-danger':'text-success'}>{note.message} <br/> </small>
      
      <div className='login-signup'>

      <input type="submit" value="Log In" disabled={isInvalidUserName() || isInvalidPassword()} onClick={ e=> onLogin(e)}
       class={'fadeIn fourth ip-button '+((isInvalidUserName() || isInvalidPassword()) && ' text-secondary')}
      />

      <input type="submit" value="Signup" disabled={isInvalidUserName() || isInvalidPassword()} onClick={ e=> onSignup(e) }
      class={"fadeIn fourth ip-button "+((isInvalidUserName() || isInvalidPassword()) && ' text-secondary')}
      />
   
      </div>
      
      <Button disabled={isInvalidUserName() || isInvalidPassword()} style={{marginTop:'-40px'}}  component="label" 
       class={'fadeIn fourth ip-button '+((isInvalidUserName() || isInvalidPassword()) && ' text-secondary')}
      >
        {img?'selected image: '+img.name:'Choose your avatar'}
        <input type="file" accept="image/*" hidden onChange={ e=> {setimg(e.target.files[0] )}} multiple = "false" />
        </Button>
        <br/>
      <input type="submit" onClick={ e=> onGuest(e) } class="fadeIn fourth ip-button" value="Continue as Guest" />
      
 
  </div>
</div>
    </div>
        
        );

}