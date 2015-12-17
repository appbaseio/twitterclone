var app = angular.module('twitter');
  // **Controller: global**.
  // Show all tweets when no one is logged in.

app.controller('global', function ($scope, userSession, $location, $rootScope, $timeout, appbaseService, loginService) {
    "use strict";
    // Hide *navbar* if no one is logged in
    $rootScope.hideNav();
    $scope.convertToVisibleTime = $rootScope.convertToVisibleTime;
        $scope.urlify = $rootScope.urlify;
    // Called when the user enters name or when already logged in.
    $scope.login = function () {
      userSession.setUser($scope.userId.replace(/ /g, "_"));
      loginService.init($scope.afterLogin)
    }
    $scope.afterLogin = function(){
      $timeout(function(){
        userSession.initComplete = true;
        $location.path('/home/personal');
      });
    }
    // Checks if a user is already logged in the session.
    if ($scope.userId === userSession.getUser()) $scope.login();
    //Show all tweets under *global/tweets* using ``bindEdges``, in reverse order of their priorities.
    appbaseService.getBundleData('tweets','tweets');
    $scope.tweetsDisplayed = 8;
  })

  // **Controller: search**.
  // Search's for tweets in Appbase and shows results.
    .controller('search', function ($scope, $rootScope, $routeParams, appbaseService, tweetService) {
    "use strict";
    // Getting the 'query text' from route parameters.
    $scope.currentQuery = $routeParams.text;
    $scope.urlify = $rootScope.urlify;
    // Searching in the namespace: __tweet__ for vertices, which contain 'query text' in the property: __msg__.
    tweetService.searchText($routeParams.text);

  })
  // **Controller: Loading**.
  // It inits the __data__ factory, which is used everywhere in the app to fetch and set data from/to Appbase.
  // After the _init_ completes, it takes the user to _home_ screen, showing personal tweets of the user.
  .controller('loading', function ($rootScope, $scope, userSession, personalService) {
    "use strict";
    if (!userSession.getUser()) {
      $rootScope.exit();
      return;
    }
    personalService.init(function () {
      // $scope.$apply(function () {
      //   $rootScope.goHome('personal');
      // });
    });
  })
  // **Controller: navbar**.
  // Handles button clicks and visibility of buttons.
  .controller('navbar', function ($scope, userSession, $rootScope) {
    "use strict";
    $scope.bahar = true;
    // Called when user enters a text in the search box and presses enter key.
    $scope.search = function () {
      $rootScope.search($scope.searchText);
      $scope.searchText = '';
    };
    $scope.$on('showNav', function () {
      $scope.bahar = false;
    });
    $scope.$on('hideNav', function () {
      $scope.bahar = true;
    });
    $scope.exit = function () {
      $rootScope.exit();
    };
    $scope.gotoProfile = function (userId) {
      if (userId === undefined) { userId = userSession.getUser(); }
      $rootScope.gotoProfile(userId);
    };
    $scope.goHome = function (feed) {
      $rootScope.goHome(feed);
    };
  })
  // **Controller: home**.
  // This is what the user sees first when logged in. It shows the personal and global tweet feeds
  // The personal tweet feed: shows tweets from people he follows.
  // The global feed: tweets by everyone
  .controller('home', function ($scope, userSession, $rootScope, $routeParams, tweetService, appbaseService ) {
    "use strict";
    // Check if the session is properly initiated,
    // i.e. the 'global' controller set the flag 'initComplete' in userSession.
    if (!userSession.initComplete) {
      if (!userSession.getUser()) {
        $rootScope.exit();
      } else {
        $rootScope.load();
      }
      return;
    }

    $scope.convertToVisibleTime = $rootScope.convertToVisibleTime;
        $scope.urlify = $rootScope.urlify;
    $rootScope.showNav();

    // Get __feed__ from route parameters.
    $scope.feed = $routeParams.feed === undefined ? 'global' : $routeParams.feed;
    $scope.tweetsDisplayed = 15;
    $scope.peopleDisplayed = 8;
    $scope.userName = userSession.getUser();
    $scope.gotoProfile = $rootScope.gotoProfile;
    // Show _People on Twitter_, user's _Followers_ and _Followings_.
    appbaseService.getBundleData('users', 'people');
    // $scope.followers = data.refs.usersFollowers.bindEdges($scope);
    // $scope.following = data.refs.usersFollowing.bindEdges($scope);

    // Called when user posts a new tweet.
    $scope.addTweet = function () {
      tweetService.addTweet($scope.msg);
      $scope.msg = '';
    };
    if($scope.feed == 'personal'){
      tweetService.personalTweet(userSession.getUser());
    }
    // if (feed === 'global') {
    //   // Show all tweets.
    //   $scope.tweets = data.refs.globalTweets.bindEdges($scope,{}, true);
    // } else {
    //   // Fetch tweets of the people followed by the user. Every following's tweets are pushed into `arraysOfTweets` as an array,
    //   // and in the end, these arrays are merged into personalTweets by calling `personalTweets.concat.apply(personalTweets, arraysOfTweets)`
    //   // in _home.html_.
    //   $scope.personalTweets = [];
    //   $scope.arraysOfTweets = [];
    //   $scope.arraysOfTweets.push(data.refs.usersTweets.bindEdges($scope));
    //   data.refs.usersFollowing.on('edge_added', function (error, followUserRef) {
    //     if (error) {throw error; }
    //     $scope.arraysOfTweets.push(followUserRef.outVertex('tweets').bindEdges($scope));
    //   });
    //   $scope.$on('$destroy', function () {
    //     // Stop listening to user's followings when the view is destroyed.
    //     data.refs.usersFollowing.off();
    //   });
    // }
  })
  // **Controller: profile**.
  // Where a user's followings, followers and tweets are shown.
  // A user can also see other's profiles and choose to follow/unfollow the person from his/her profile.
  .controller('profile', function ($scope, userSession, $rootScope, $routeParams, tweetService, appbaseService ) {
    "use strict";
    var notLoggedIn;
    if (!userSession.initComplete) {
      notLoggedIn = true;
      /*
      if (!userSession.getUser()) {
        $rootScope.exit();
      } else {
        $rootScope.load();
      }
      return;
      */
    }
    $scope.convertToVisibleTime = $rootScope.convertToVisibleTime;
    !notLoggedIn && $rootScope.showNav();

    // Get the userId from route params.
    var userId = $routeParams.userId;
    $scope.userId = $routeParams.userId;
    // Check whether this profile is of the logged in user.
    $scope.isMe = userSession.getUser() === userId;
    $scope.userName = $routeParams.userId;
    
    // Check whether this user is being followed by the logged in user.
    // This has to be an async function, as it interacts with the Appbase server.
    // if (!notLoggedIn && !$scope.isMe) {
    //   data.isUserBeingFollowed(userId, function (boolean) {
    //     // If true, _unfollow_ button will appear, otherwise _follow_ one.
    //     $scope.isBeingFollowed = boolean;
    //     // Show _follow_ or _unfollow_ buttons only when the data is arrived.
    //     $scope.isReady = true;
    //     $scope.$apply();
    //   });
    // }
    $scope.gotoProfile = $rootScope.gotoProfile;
    $scope.follow = function (userId) {
      tweetService.followFunction(userId,true);
      $rootScope.isBeingFollowed = true;
    };
    $scope.unFollow = function (userId) { 
      tweetService.followFunction(userId,false);
      $rootScope.isBeingFollowed = false;
    };
    $scope.addTweet = function () {
      data.addTweet($scope.msg);
      $scope.msg = '';
    };
    // Fetch user's followers, followings and tweets.
    // $scope.followers = $appbase.ns('user').v(userId + '/followers').bindEdges($scope);
    // $scope.following = $appbase.ns('user').v(userId + '/following').bindEdges($scope);
    // $scope.tweets = $appbase.ns('user').v(userId + '/tweets').bindEdges($scope);
    
    $rootScope.isBeingFollowed = false;
    $scope.isReady = false;
    $scope.personalInfoCallback = function(){
      if(typeof $rootScope.myself != 'undefined'){
        $scope.isReady = true;
        $rootScope.isBeingFollowed = $.inArray($rootScope.myself._source.name, $rootScope.personalInfo[0]._source.followers) == '-1' ? false : true; 
      }
    }

    tweetService.personalTweet(userId);
    tweetService.personalInfo(userId, $scope.personalInfoCallback);
  })
  