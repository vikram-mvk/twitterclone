import React, { useState } from "react";
import "./TweetBox.css";
import { Avatar, Button } from "@material-ui/core";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Axios from "axios";
import { useSelector, useDispatch } from 'react-redux'
import uuid from 'react-uuid'
import {newTweet} from './Redux/ActionCreators'

function TweetBox() {
  const store = useSelector(state => state)
  const dispatch = useDispatch();
  const [tweet,setTweet] = React.useState(
    {
      id:undefined,
      username:store.user_details.username,
      content:'',
      image_url:'',
      comments:[],
      likes:[],
      date_posted:undefined,
      timestamp:undefined
    })

    const [img, setimg] = React.useState(undefined)

    const sendTweet = async (e) => {  
        e.preventDefault();
        tweet.id = 'id_'+uuid().split('-')[0]
        tweet.date_posted = new Date().toLocaleDateString()
        tweet.timestamp = new Date().getTime()
        if (img) tweet.image_url=tweet.id
        
        const headers = {  headers: { Authorization: 'Bearer ' + store.user_details.token }  }
        try {
          await Axios.post('/newTweet', tweet, headers)
          dispatch(newTweet(tweet))

          if (img) {
            console.log(img)
            let formData = new FormData();    //formdata object
            formData.append('img',img)
            formData.append('tweet_id',tweet.id)
            headers.content_type='multipart/form-data'
            const response = await Axios.post('/upload', formData, headers)
          }
          
        } catch (error) {
          console.log(error.response)
        }
    };

  

  return (
    <div className="tweetBox container-fluid">
      <form>
        <div className="tweetBox__input">
          <Avatar src={'https://vikram-twitter-clone.s3.amazonaws.com/'+store.user_details.username} alt='' />
          <textarea
            placeholder="What's happening?"
            type="text"
            onChange={ e=> {setTweet({...tweet, content:e.target.value})} }
          />
        </div>
        <Button className="tweetBox__imageInput"  component="label"> Upload an image
        <input type="file" accept="image/*" hidden onChange={ e=> {setimg(e.target.files[0] )}} multiple = "false" />
        </Button>

        <Button
          onClick={sendTweet}
          type="submit"
          className="tweetBox__tweetButton"
          disabled={tweet.content.length==0}
        >
          <span className={tweet.content.length==0?'text-muted':'text-white'}>Tweet</span>
        </Button>
      </form>
    </div>
  );
}

export default TweetBox;
