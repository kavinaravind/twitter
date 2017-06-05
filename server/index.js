var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();

// middleware -> libraries supported by express

app.use(morgan('dev')); // logger, prints log lines in developer mode
app.use(express.static('./client')); // a folder that contains the files it wants to serve for you
app.use(bodyParser.text()); // parse json requests coming in

// define routes

var mostRecentUser;

app.get('/users/:user', function(req, res, next) {
  mostRecentUser = getUser(req.params.user);
  res.status(200).json(convertToJSON(mostRecentUser));
});

app.get('/users/', function(req, res, next) {
  if (!mostRecentUser) {
    mostRecentUser = getUser('NewUser');
  }
  res.status(200).json(convertToJSON(mostRecentUser));
});

app.post('/users/:user/follow', function(req, res, next) {
  follow(req.params.user, req.body);  
  res.status(200).json({});
});

app.post('/users/:user/unfollow', function(req, res, next) {
  unfollow(req.params.user, req.body);  
  res.status(200).json({});
});

app.post('/users/:user/tweet', function(req, res, next) {
  tweet(req.params.user, req.body);
  res.status(200).json({});
});

app.post('/users/:user/favorite', function(req, res, next) {
  favorite(parseInt(req.body));
  var name = mostRecentUser.username;
  mostRecentUser = users[name];
  res.status(200).json({});
});

app.post('/users/:user/retweet', function(req, res, next) {
  retweet(req.params.user, parseInt(req.body));
  res.status(200).json({});
});

/*
 * @function
 * @name convertToJSON
 * The convertToJSON function will be called to convert object to JSON
 */
function convertToJSON(obj) {
   return {
      username: obj.username,
      timeline: obj.timeline,
      followers: obj.followers.map(function(user) { 
        return user.username;
      }),
      following: obj.following.map(function(user) { 
        return user.username; 
      }),
  };
}

app.listen(3000, function () {
  console.log('Port 3000 is ready.');
});

/*
 * @module Twitter
 * This module contains 6 functions which need to be implemented. Each function
 * has comments defining the inputs and outputs of each function. Modify this
 * file as needed to complete the assignemtn howver DO NOT modify the function
 * signatures or the module.exports at the bottom of the file.
 */

var users = {};

function date() {
  var date = new Date();
  var year = date.getUTCFullYear().toString();
  var month = pad(date.getUTCMonth() + 1, 2);
  var day = pad(date.getUTCDate(), 2);
  var hour = pad(date.getUTCHours(), 2);
  var minute = pad(date.getUTCMinutes(), 2);
  var second = pad(date.getUTCSeconds(), 2);

  return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':');
}

function getUser(username) {
  if(!users.hasOwnProperty(username)) {
    users[username] = new User(username);
  }
  return users[username];
}

function objectWithProperty(key, value) {
  return function(object) {
    return object[key] === value;
  }
}

function objectProperty(key) {
  return function(object) {
    return object[key];
  }
}

function notEquals(rhs) {
  return function(lhs) {
    return lhs !== rhs;
  }
}

function pad(number, length) {
  number = number.toString();

  return Array(1 + length - number.length).join('0') + number;
}

function randomId() {
  return 100000 + Math.floor(Math.random() * 100000)
}

function validUsername(username){ 
  return typeof username === 'string' && username !== '';
}

function validTweet(tweet) {
  return typeof tweet === 'string' && tweet !== '' && tweet.length <= 140;
}

function Tweet(content, username) {
  this.id = randomId();
  this.date = date();
  this.username = username;
  this.tweet = content;
  this.retweet = false;
  this.favorites = 0;
}

Tweet.prototype.clone = function(retweet) {
  var clone = new Tweet(this.id, this.username);
  clone.id = this.id;
  clone.date = this.date;
  clone.favorites = this.favorites;
  clone.tweet = this.tweet;
  clone.retweet = retweet;
  return clone;
}

function User(username) {
  this.username = username;
  this.timeline = [];
  this.followers = [];
  this.following = [];
}

User.prototype.tweet = function(content) {
  if(!validTweet(content)) {
    return false;
  }
  var tweet = new Tweet(content, this.username);
  this.timeline.unshift(tweet);
  this.followers
    .map(function(user) {
      return user.timeline;
    })
    .forEach(function(timeline) {
      timeline.unshift(tweet.clone(false));
    });
  return tweet;
};

User.prototype.follow = function(user) {
  if(this === user) {
    return false;
  }
  if(this.following.indexOf(user) !== -1) {
    return false;
  }
  this.following.push(user);
  user.followers.push(this);
  return true;
};

User.prototype.getTimeline = function(options) {
  return this.timeline
    .filter(function(tweet) {
      return !options.hasOwnProperty('query') || tweet.tweet.indexOf(options.query) !== -1;
    })
    .filter(function(tweet) {
      return !options.hasOwnProperty('username') || tweet.username === options.username;
    });
};

User.prototype.unfollow = function(user) {
  if(this === user) {
    return false;
  }
  if(this.following.indexOf(user) === -1) {
    return false;
  }
  this.following = this.following.filter(notEquals(user));
  user.followers = user.followers.filter(notEquals(this));
  return true;
};

User.prototype.retweet = function(id) {
  var tweet = this.timeline.find(objectWithProperty('id', id));
  if(!tweet || tweet.username === this.username) {
    return false;
  }

  this.followers
    .filter(function(user) {
      return !user.timeline.find(objectWithProperty('id', id));
    })
    .map(objectProperty('timeline'))
    .forEach(function(timeline) {
      timeline.unshift(tweet.clone(true));
    });

  return true;
}

User.favorite = function(id) {
  var found = false;
  Object.keys(users)
    .map(function(username) {
      return users[username];
    })
    .map(objectProperty('timeline'))
    .reduce(function(previous, current) {
      return previous.concat(current);
    }, [])
    .filter(function(tweet) {
      return tweet.id === id;
    })
    .forEach(function(tweet) {
      tweet.favorites++;
      found = true;
    });
  return found;
}

/*
 * @function
 * @name timeline
 * The timeline function will return an array of tweets representing the
 * timeline for a given username.
 *
 * @param   {string} user   The username whose timeline to return.
 * @param   {Object} [options]  Optional options object to customize behavior.
 * @returns {Tweet[]|false}     Array of tweet objects representing the timeline
 * of the user. Alternatively, false will be returned if the username is not a
 * valid string.
 */
function timeline(user, options) {
  if(!validUsername(user)) {
    return false;
  }
  var userObject = getUser(user);
  return userObject.getTimeline(options || {});
}

/*
 * @function
 * @name follow
 * The follow function allows the follower to receive future tweets from the
 * user.
 *
 * @param   {string} follower The user requesting to follow the user.
 * @param   {string} user     The user being followed.
 * @returns {boolean}         Returns true if successfully followed and false
 * if not.
 */
function follow(follower, user) {
  if(!validUsername(follower) || !validUsername(user)) {
    return false;
  }
  var followerObject = getUser(follower);
  var userObject = getUser(user);
  return followerObject.follow(userObject);
}

/* @function
 * @name unfollow
 * The unfollow function is the inverse of {@link follow}. After unfollowing,
 * future tweets from user will not show up in follower's timeline.
 *
 * @param   {string} follower The user requesting to follow the user.
 * @param   {string} user     The user being followed.
 * @returns {boolean}         Returns true if successfully unfollowed and false
 * if not.
 */
function unfollow(follower, user) {
  if(!validUsername(follower) || !validUsername(user)) {
    return false;
  }
  var followerObject = getUser(follower);
  var userObject = getUser(user);
  return followerObject.unfollow(userObject);
}

/*
 * @function
 * @name tweet
 * This function will add a tweet for a given user. Tweeting will add a tweet
 * to each followers timeline, including the user doing the tweeting.
 *
 * @param   {string} user     The user tweeting.
 * @param   {string} content  The tweet content.
 * @returns {Tweet|false}     Returns a tweet object or false in the case of a
 * failure.
 */
function tweet(user, content) {
  if(!validUsername(user) || !validTweet(content)) {
    return false;
  }
  return getUser(user).tweet(content);
}

/*
 * @function
 * @name retweet
 * Retweeting allows followers to share another user's tweets with their own
 * followers.
 *
 * @param   {string} retweeter  The user performing the retweet.
 * @param   {number} tweet_id   The tweet ID being retweeted.
 * @returns {boolean}           True if successful, false if not successful.
 */
function retweet(retweeter, tweet_id) {
  if(!validUsername(retweeter)) {
    return false;
  }
  var user = getUser(retweeter);
  return user.retweet(tweet_id);
}

/*
 * @function
 * @name favorite
 * Increments the favorite count of the tweet with the corresponding ID.
 *
 * @param   {number} tweet_id ID of tweet to favorite.
 * @returns {boolean}         True if successful, false if not successful.
 */
function favorite(tweet_id) {
  return User.favorite(tweet_id);
}
