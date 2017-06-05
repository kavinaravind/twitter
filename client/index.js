var userInput;
var followInput;
var tweetInput;

var userButton;
var tweetButton;
var followButton;
var unfollowButton;

var tweetList;
var followingList;
var followerList;

var currentUser;

/*
 * @function
 * @name sendUserRequest
 * The sendUserRequest function will be called whenever the website is refreshed.
 */
function sendUserRequest(user) {
  var req = new XMLHttpRequest();
  req.open('GET', '/users/' + user, true);
  req.addEventListener('load', function() {
    var name = JSON.parse(req.responseText);
    updateLayout(name);
  });
  req.send();
}

/*
 * @function
 * @name updateLayout
 * The updateLayout function will be called on refresh to update the layout of the site.
 */
function updateLayout(user) {
    var userHeader = document.querySelector('#current-user-header');
    userHeader.textContent = user.username;
    currentUser = user;
    updateFollowingList(user);
    updateFollowerList(user);
    updateTweetList(user);
}

/*
 * @function
 * @name update
 * The update function will be called when the username is clicked on.
 * Adds the correct name to the user header and resets the following list, follower
 * list, and tweet list.
 */
function updateLayoutWhenUserNameClicked(e) {
  var name = e.explicitOriginalTarget.textContent;
  sendUserRequest(name);
}

/*
 * @function
 * @name switchUser
 * The switchUser function will be called when the switch user button is pressed.
 * Adds the correct name to the user header and resets the following list, follower
 * list, and tweet list.
 */
function switchUser(e) {
  sendUserRequest(userInput.value);
  userInput.value = null;
}
/*
 * @function
 * @name addTweet
 * The addTweet function will be called when the tweet button is pressed.
 * Creates a tweet item and inserts before the tweet lists first child
 */
function addTweet(e) {
  var twitInput = tweetInput.value;
  var req = new XMLHttpRequest();
  req.open('POST', '/users/' + currentUser.username + '/tweet', true);
  req.addEventListener('load', function() {
    var twit = createTweetItem(twitInput, currentUser.username, 0, null);
    tweetList.insertBefore(twit, tweetList.firstChild);
    tweetInput.value = null;
  });
  req.send(twitInput);
  sendUserRequest(currentUser.username);
}

/*
 * @function
 * @name addFollowing
 * The addFollowing function will be called when the follow button is pressed.
 * Appends the follower to the following list.
 */
function addFollowing(e) {
  var followingInput = followInput.value;
  var req = new XMLHttpRequest();
  req.open('POST', '/users/' + currentUser.username + '/follow', true);
  req.addEventListener('load', function() {
    var follower = createFollowingList(followingInput);
    followingList.appendChild(follower);
    followInput.value = null;
  });
  req.send(followingInput);
}

/*
 * --------------
 * FLAIR #1
 * --------------
 *
 * Implements unfollowing using an unfollow button!
 *
 * @function
 * @name removeFollower
 * The removeFollower function will be called when the unfollow button is pressed.
 * Removes the follower from the following list.
 */
function removeFollower(e) {
  var followerInput = followInput.value;
  var req = new XMLHttpRequest();
  req.open('POST', '/users/' + currentUser.username + '/unfollow', true);
  req.addEventListener('load', function() {
    while (followingList.firstChild) {
      followingList.removeChild(followingList.firstChild);
    }

    for(var i = 0; i < currentUser.following.length; i++) {
      var following = createFollowingList(currentUser.following[i].username);
      followingList.appendChild(following);
    }
    followInput.value = null;
  });
  req.send(followerInput);
}

/*
 * @function
 * @name updateFavoriteCount
 * The updateFavoriteCount function will be called.
 */
function updateRetweet(e) {
  var name = e.currentTarget.parentElement.parentElement.parentElement.childNodes[0].innerHTML;
  var tweetContent = e.currentTarget.parentElement.parentElement.parentElement.childNodes[1].innerHTML;
  var tweetObject;

  for (var i = 0; i < currentUser.timeline.length; i++) {
    if (currentUser.timeline[i].tweet === tweetContent) {
      tweetObject = currentUser.timeline[i];
    }
  }

  var req = new XMLHttpRequest();
  req.open('POST', '/users/' + currentUser.username + '/retweet', true);
  req.addEventListener('load', function() {
    
  });
  req.send(tweetObject.id);
}

/*
 * @function
 * @name updateFavoriteCount
 * The updateFavoriteCount function will be called.
 */
function updateFavoriteCount(e) {
  var name = e.currentTarget.parentElement.parentElement.parentElement.childNodes[0].innerHTML;
  var tweetContent = e.currentTarget.parentElement.parentElement.parentElement.childNodes[1].innerHTML;
  
  var tweetObject;
  for (var i = 0; i < currentUser.timeline.length; i++) {
    if (currentUser.timeline[i].tweet === tweetContent) {
      //console.log(currentUser.timeline[i]);
      tweetObject = currentUser.timeline[i];
    }
  }

  var req = new XMLHttpRequest();
  req.open('POST', '/users/' + currentUser.username + '/favorite', true);
  req.addEventListener('load', function() {
    sendUserRequest(currentUser.username);
  });
  req.send(tweetObject.id);
}

/*
 * @function
 * @name updateFollowerList
 * The updateFollowerList function will be called when a new user is inputted.
 * All followers in the followerList will be removed and new users from the users
 * follower list will be appended on to the followerList.
 */
function updateFollowerList(user) {
  while (followerList.firstChild) {
    followerList.removeChild(followerList.firstChild);
  }
  for(var i = 0; i < user.followers.length; i++) {
    var follower = createFollowersList(user.followers[i]);
    followerList.appendChild(follower);
  }
}

/*
 * @function
 * @name updateFollowingList
 * The updateFollowingList function will be called when a new user is inputted.
 * All of users following in the followingList will be removed and new users from the users
 * following list will be appended on to the followingList.
 */
function updateFollowingList(user) {
  while (followingList.firstChild) {
    followingList.removeChild(followingList.firstChild);
  }
  for(var i = 0; i < user.following.length; i++) {
    var following = createFollowingList(user.following[i]);
    followingList.appendChild(following);
  }
}

/*
 * @function
 * @name updateTweetList
 * The updateTweetList function will be called when a new user is inputted.
 * All children in the tweetList will be removed and all of the users tweets in 
 * their timeline will be appended to the tweetList.
 */
function updateTweetList(user) {
  while (tweetList.firstChild) {
    tweetList.removeChild(tweetList.firstChild);
  }

  for(var i = 0; i < user.timeline.length; i++) {
    var tweetObject = user.timeline[i];
    var tweet;
    if (tweetObject.retweet) {
      tweet = createTweetItem(tweetObject.tweet, tweetObject.username, tweetObject.favorites, ' true');
    }
    else {
      tweet = createTweetItem(tweetObject.tweet, tweetObject.username, tweetObject.favorites, null);
    }
    tweetList.appendChild(tweet);
  }
}

/*
 * ---------------------------------------------
 * CREATES USER INTERFACE
 * ---------------------------------------------
 */

/*
 * @function
 * @name createFollowersList
 * The createFollowersList function will create new elements in the document 
 * to add the list of followers.
 *
 * @param   {string} text     The username to add
 * @returns {ul}     Returns the ul element that was created
 */
function createFollowersList(text) {
  var ul = document.createElement('ul');
  ul.className = '#followers-list'
  var li = document.createElement('li');
  var link = document.createElement('a');
  link.addEventListener('click', updateLayoutWhenUserNameClicked);
  link.href = '#';
  link.textContent = text;

  li.appendChild(link);
  ul.appendChild(li);
  return ul;
}

/*
 * @function
 * @name createFollowingList
 * The createFollowingList function will create new elements in the document 
 * to add the list of following.
 *
 * @param   {string} text     The username to add
 * @returns {ul}     Returns the ul element that was created
 */
function createFollowingList(text) {
  var ul = document.createElement('ul');
  ul.className = '#following-list'
  var li = document.createElement('li');
  var link = document.createElement('a');
  link.addEventListener('click', updateLayoutWhenUserNameClicked);
  link.href = '#';
  link.textContent = text;

  li.appendChild(link);
  ul.appendChild(li);
  return ul;
}

/*
 * @function
 * @name createTweetItem
 * The createTweetItem function will create new elements in the document 
 * to add to the tweet list
 *
 * @param   {string} text     The tweet content
 * @returns {li}     Returns the li element that was created
 */
function createTweetItem(tweet, user, favoriteCount, retweetIndicator) {
  var li = document.createElement('li');
  registerItemEvents(li);
  li.className = 'list-group-item tweet';
  var p1 = document.createElement('p');
  p1.className = 'tweet-username';
  p1.textContent = user;
  var p2 = document.createElement('p');
  p2.className = 'tweet-content';
  p2.textContent = tweet;

  var div = document.createElement('div');
  div.className = 'row';

  var div2 = document.createElement('div');
  div2.className = 'col-md-2';

  var favorite = document.createElement('a');
  favorite.href = '#';
  favorite.innerHTML = 'Favorite';
  favorite.className = 'favorite-link';
  favorite.addEventListener('click', updateFavoriteCount);

  var span = document.createElement('span');
  span.className = 'favorite-count';
  span.textContent = ' ' + favoriteCount;

  var div3 = document.createElement('div');
  div3.className = 'col-md-3';

  var retweet = document.createElement('a');
  retweet.href = '#';
  retweet.innerHTML = 'Retweet';
  retweet.className = 'retweet-link';
  retweet.addEventListener('click', updateRetweet);

  var span2 = document.createElement('span');
  span2.className = 'retweet-indicator';
  span2.textContent = retweetIndicator; 

  div2.appendChild(favorite);
  div2.appendChild(span);
  div3.appendChild(retweet);

  if (retweetIndicator) {
      div3.appendChild(span2);
  }

  div.appendChild(div2);
  div.appendChild(div3);

  li.appendChild(p1);
  li.appendChild(p2);
  li.appendChild(div);
  return li;
}

/*
 * --------------
 * FLAIR #2
 * --------------
 *
 * When hovering over any tweets, it will change the color of all tweets to red
 *
 * @function
 * @name registerItemEvents
 * The registerItemEvents function will be called when tweets are available
 */
function registerItemEvents(item) {
  item.addEventListener('mouseenter', itemMouseEnter);
  item.addEventListener('mouseleave', itemMouseLeave);
}

/*
 * @function
 * @name itemMouseEnter
 * The itemMouseEnter function will set all tweets to hidden when mouse is on tweet
 */
function itemMouseEnter(e) {
  e.currentTarget.style.color = 'red';
}

/*
 * @function
 * @name itemMouseLeave
 * The itemMouseLeave function will set all tweets to visible when mouse is not on tweet
 */
function itemMouseLeave(e) {
  e.currentTarget.style.color = 'black';
}

/*
 * Initilaizes all variables and adds event listeners for all buttons
 */
window.addEventListener('load', function() {
  userInput = document.querySelector('#switch-user-input');
  followInput = document.querySelector('#follow-input');
  tweetInput = document.querySelector('#tweet-input');

  userButton = document.querySelector('#switch-user-button');
  tweetButton = document.querySelector('#tweet-button');
  followButton = document.querySelector('#follow-button');
  unfollowButton = document.querySelector('#unfollow-button');

  tweetList = document.querySelector('#tweet-list');
  followingList = document.querySelector('#following-list');
  followerList = document.querySelector('#follower-list');

  userButton.addEventListener('click', switchUser);
  tweetButton.addEventListener('click', addTweet);
  followButton.addEventListener('click', addFollowing);
  unfollowButton.addEventListener('click', removeFollower);

  sendUserRequest('');
});