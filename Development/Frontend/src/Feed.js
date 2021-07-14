import React, { useEffect } from "react";
import "./Feed.css";
import TweetBox from './TweetBox'
import Post from './Post'
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import styles from "./styles.module.css";
import { useSelector, useDispatch } from 'react-redux'
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import {Logout} from './Redux/ActionCreators'
import Axios from "axios";
import {moreTweets} from './Redux/ActionCreators'
import $ from 'jquery'
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { Button } from "@material-ui/core";
import CommentModal from './CommentModal';
import { Switch, FormControlLabel} from '@material-ui/core';
import {setTweets, deleteTweet} from './Redux/ActionCreators'

function Feed() {
  
  //Redux state and Action creators
  const store = useSelector(state => state); //hook provided by redux
  const dispatch = useDispatch();

  const headers = {  headers: { Authorization: 'Bearer ' + store.user_details.token }  }
  
  // Local React states
  const [showAllTweets, setShowAllTweets] = React.useState(true);
  const [showcommentModal, setshowcommentModal] = React.useState(false)
  const [commentId, setCommentId] = React.useState()
  
  
  useEffect( async () => {
    fetchTweets()
  }, [showAllTweets])

  useEffect( async () => {
    fetchTweets()
  }, [])

  const fetchTweets = async () => {
      try {
        if (showAllTweets) {
            const response = await Axios.get('/getTweets', headers)
            dispatch(setTweets(response.data))  

        } else {
            await Axios.get('/tweets/'+store.user_details.username, headers)
        }

      } catch (error) {
        console.log(error.response == undefined ? 'Error: Cannot communicate to the backend'
         : error.response.data.message == undefined ? 'Server returned error with no message' : error.response.data.message)
      }
  }

const swipeRightDataSimple = id => ({
  content: (
    <div className={styles.contentLeft}>
      <span>Comment on this tweet</span>
    </div>
  ),
  action: () => {
    setCommentId(id);
    setshowcommentModal(true)
  } 
 });

const swipeLeftDataSimple = id => ({
  content: (
    <div className={styles.contentRight}>
      <span>Delete this tweet</span>
    </div>
  ),
  action: () => { 
    let i=0
    for(i=0; i<store.tweets.length;i++){
      if(store.tweets[i].id==id) break
    }
    dispatch(deleteTweet(i))
    Axios.post('/deleteTweet',{id:id},headers)  .then(res => console.log(res)).catch(err => console.log(err))
  }
});


const onLogout = ()=>{
  dispatch(Logout());
}

const onLoadMoreTweets = () => {
  Axios.post('/loadMoreTweets', {
    tweetTimestamp: store.tweets[store.tweets.length - 1].timestamp,
    datePosted:store.tweets[store.tweets.length -1].date_posted
  }, headers)
  .then( res => {

    console.log(res.data)
    dispatch(moreTweets(res.data))

    $('#more-tweets').text('')  

  })
  .catch(err=>{
    if(err && err.response){
    console.log(err.response.data)
    $('#more-tweets').text('No more tweets at the moment..Try adding more tweets!')  
  }
  else {
    $('#more-tweets').text('Cannot connect to the backend.. Please check your internet connection')

  }

    
  })
}


  return (
    <div className="feed container-fluid">
      
      { 
      
      store.user_details &&
        <div className="feed__header">
        <h5 className=''>Welcome!,<br/> {store.user_details.username}</h5>
        <span className='float-right'>
        <FormControlLabel
    control={<Switch showAllTweets={showAllTweets} onChange={e => setShowAllTweets(!showAllTweets)} />}
    label={showAllTweets? 'Showing all tweets':'Showing my tweets only'}
  />

        </span>
 <button type='button' className='btn btn-md btn-danger' onClick={onLogout}>Logout</button>
 
  </div>
}

{
    store.user_details && store.user_details.username!='guest' &&
      <TweetBox />
  }

 <React.Fragment>

       

      <SwipeableList>

        {store.tweets && store.tweets.length>0? store.tweets.map((tweet) => {
          
          return(
        
        <SwipeableListItem
          swipeRight={ store.user_details.username!='guest' && swipeRightDataSimple(tweet.id)}
          swipeLeft={store.user_details.username!='guest' && store.user_details.username==tweet.username && swipeLeftDataSimple(tweet.id)}
        >
          <Post
            id={tweet.id}
            username={tweet.username}
            avatar={tweet.username}
            content={tweet.content}
            likes={tweet.likes}
            comments={tweet.comments}
            retweets={tweet.retweets}
            image={tweet.image_url}
            date_posted={tweet.date_posted}
          />

        <CommentModal show={showcommentModal} setshow={setshowcommentModal} id={commentId}/>
        
        </SwipeableListItem>



        )})
      :
      <p className='lead text-center'>No tweets to display..</p>

      }
        
</SwipeableList>
{showAllTweets &&
<div id='more-tweets' hidden={store.tweets.length==0} style={{'text-align':'center','padding':'70px'}}><Button onClick={onLoadMoreTweets}><AutorenewIcon/></Button><br/>Load more tweets</div>
}
</React.Fragment>

      </div>
  );
}

export default Feed;
