var app = angular.module('twitter');
app
// **Factory: data**.
  //Stores frequently useful Appbase references and interacts with Appbase for data needs
  // .factory('data', function (userSession, $appbase) {
  //   "use strict";
  //   // Appbase references
  //   var refs = {
  //     globalTweets: $appbase.ns('global').v('tweets'),
  //     allUsers: $appbase.ns('global').v('users')
  //   }, data = {  // Factory to be exported
  //     refs: refs
  //   };
  //   // Called when the user just logs in.
  //   // It sets required references and creates basic data for a new user.
  //   data.init = function (ready) {
  //     var userId = userSession.getUser();
  //     refs.user = $appbase.ns('user').v(userSession.getUser());
  //     refs.usersTweets = refs.user.outVertex('tweets');
  //     refs.usersFollowers = refs.user.outVertex('followers');
  //     refs.usersFollowing = refs.user.outVertex('following');
      
  //     var edgeCreation = function(ref, edgeName, edgeRef) {
  //       return function(callback) {
  //         var checkAndCreate = function() {
  //           ref.outVertex(edgeName).isValid(function(error, bool) {
  //               if (error) callback(error);
  //               if(bool) {
  //                 callback();
  //               } else {
  //                 ref.setEdge(edgeName, edgeRef || $appbase.ns('misc').v($appbase.uuid()), function (error) {
  //                   if (error) callback(error);
  //                   checkAndCreate();
  //                 });
  //               }
  //             })
  //         }
  //         checkAndCreate();
  //       }
  //     }
  //     //checking if edges 'tweets', 'followers', 'following' exists. If not, create them.
  //     async.parallel([ edgeCreation(refs.user, 'tweets'), 
  //         edgeCreation(refs.user, 'followers'), 
  //         edgeCreation(refs.user, 'following'),
  //         edgeCreation(refs.allUsers, userId, refs.user),
  //         function(callback) {
  //           refs.user.on('properties', function (error, ref, snap) {
  //             refs.user.off();
  //             if (error) {throw error; }
  //             if (snap.properties().name === undefined) {
  //               // The user logged in for the first time, set his name
  //               refs.user.setData({
  //                 name: userId
  //               }, callback);
  //             } else {
  //               callback();
  //             }
  //           });
  //         }
  //       ],
  //      function(error) {
  //       if(error) throw error;
  //       userSession.initComplete = true;
  //       ready();
  //     });
  //   };
  //   data.addTweet = function (msg) {
  //     //Create a new 'tweet' vertex and store the tweet message
  //     var tweetRef = $appbase.ns('tweet').v($appbase.uuid());
  //     tweetRef.setData({ 'msg': msg, 'by': userSession.getUser() }, function (error, tweetRef) {
  //       if (error) {throw error; }
  //       // Add this tweet as an edge, in user's own tweets and global tweets.
  //       // We really don't care about the edge's name here
  //       var randomEdgeName = $appbase.uuid();
  //       refs.usersTweets.setEdge(randomEdgeName, tweetRef);
  //       refs.globalTweets.setEdge(randomEdgeName, tweetRef);
  //     });
  //   };
  //   // Checks whether provided userId is being followed by the logged in user
  //   data.isUserBeingFollowed = function (userId, callback) {
  //     refs.usersFollowing.outVertex(userId).isValid(function (error, bool) {
  //       if (error) {throw error; }
  //       callback(bool);
  //     });
  //   };
  //   data.follow = function (userId) {
  //     refs.usersFollowing.setEdge(userId, $appbase.ns('user').v(userId));
  //     $appbase.ns('user').v(userId + '/followers').setEdge(userSession.getUser(), refs.user);
  //   };
  //   data.unFollow = function (userId) {
  //     refs.usersFollowing.removeEdge(userId);
  //     $appbase.ns('user').v(userId + '/followers').removeEdge(userSession.getUser());
  //   };
  //   return data;
  // })
  // Stores logged in user's id.
  .factory('userSession', function () {
    "use strict";
    var userSession = {};
    userSession.initComplete = false;
    userSession.setUser = function (userId) {
      localStorage.setItem("currentLoggedInUser", userId);
    };
    userSession.exit = function () {
      localStorage.removeItem("currentLoggedInUser");
    };
    userSession.getUser = function () {
      return localStorage.getItem("currentLoggedInUser");
    };
    return userSession;
  })
  .directive('whenScrolled', function() {
    return function(scope, elm, attr) {
      var raw = elm[0];
      elm.bind('scroll', function() {
        if (raw.scrollTop + raw.offsetHeight + 1 >= raw.scrollHeight) { // + 1 added, as a workaround for: (raw.scrollTop + raw.offsetHeight- raw.scrollHeight) would always stop at -1.
          scope.$apply(attr.whenScrolled);
        }
      });
    };
  });
