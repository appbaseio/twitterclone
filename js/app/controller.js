var app = angular.module('twitter');
  // **Controller: global**.
  // Show all tweets when no one is logged in.

app.controller('global', function ($scope, userSession, $location, $rootScope, $timeout, appbaseService, loginService) {
    "use strict";
    // Hide *navbar* if no one is logged in
    $rootScope.hideNav();
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
    //Show all tweets under *global/tweets* using ``searchStream``, in reverse order of their created date.
    appbaseService.getBundleData('tweets','tweets');
  })

  // **Controller: search**.
  // Search's for tweets in Appbase and shows results.
    .controller('search', function ($scope, $rootScope, $routeParams, appbaseService, tweetService) {
    "use strict";
    // Getting the 'query text' from route parameters.
    $scope.currentQuery = $routeParams.text;
    // Searching in the namespace: __tweet__ for vertices, which contain 'query text' in the property: __msg__.
    tweetService.searchText($routeParams.text);
  })
  // **Controller: navbar**.
  // Handles button clicks and visibility of buttons.
  .controller('navbar', function ($scope, userSession, $rootScope) {
    "use strict";
    // Called when user enters a text in the search box and presses enter key.
    $scope.search = function () {
      $rootScope.search($scope.searchText);
      $scope.searchText = '';
    };
    $scope.gotoProfile = function (userId) {
      if (userId === undefined) { userId = userSession.getUser(); }
      $rootScope.gotoProfile(userId);
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

    $rootScope.showNav();
    // Get __feed__ from route parameters.
    $scope.feed = $routeParams.feed === undefined ? 'global' : $routeParams.feed;
    if($scope.feed == 'personal'){
      tweetService.personalTweet(userSession.getUser());
    }
    // Show _People on Twitter.
    appbaseService.getBundleData('users', 'people');    
    // Called when user posts a new tweet.
    $scope.addTweet = function () {
      tweetService.addTweet($scope.msg);
      $scope.msg = '';
    };
  })
  // **Controller: profile**.
  // Where a user's followings, followers and tweets are shown.
  // A user can also see other's profiles and choose to follow/unfollow the person from his/her profile.
  .controller('profile', function ($scope, userSession, $rootScope, $routeParams, tweetService, appbaseService ) {
    "use strict";
    var notLoggedIn;
    if (!userSession.initComplete) {
      notLoggedIn = true;
    }
    !notLoggedIn && $rootScope.showNav();

    // Get the userId from route params.
    var userId = $routeParams.userId;
    $scope.userId = $routeParams.userId;
    // Check whether this profile is of the logged in user.
    $scope.isMe = userSession.getUser() === userId;
    $scope.userName = $routeParams.userId;
    
    $scope.gotoProfile = $rootScope.gotoProfile;
    $scope.follow = function (userId) {
      tweetService.followFunction(userId, true);
      $rootScope.isBeingFollowed = true;
    };
    $scope.unFollow = function (userId) { 
      tweetService.followFunction(userId, false);
      $rootScope.isBeingFollowed = false;
    };
    $scope.addTweet = function () {
      tweetService.addTweet($scope.msg);
      $scope.msg = '';
    };
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
  