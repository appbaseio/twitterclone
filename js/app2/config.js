var app = angular.module('twitter', ['ngRoute', 'ngSanitize', 'vs-repeat']);
app.run(function ($rootScope, userSession, $location, $interval) {
    "use strict";
  
    // Provide the ``appname`` and ``appsecret`` as shown in your developer console.
    //$appbase.credentials("twitter", "2cac84749bc429ad7017bb1685eafaf4");
  
    // Here **$rootScope** is used for
    // changing the routes and managing visibility of navigation bar.
    $rootScope.exit = function () {
      userSession.exit();
      $location.path('/global');
    };
    $rootScope.gotoProfile = function (userId) {
      $location.path('/profile/' + userId);
    };
    $rootScope.search = function (text) {
      $location.path('/search/' + text);
    };
    $rootScope.goHome = function (feed) {
      $location.path('/home/' + feed);
    };
    $rootScope.hideNav = function () {
      $rootScope.$broadcast('hideNav', [1]);
    };
    $rootScope.showNav = function () {
      $rootScope.$broadcast('showNav');
    };
    $rootScope.load = function () {
      $location.path('/loading');
    };
    $rootScope.convertToVisibleTime = function (timestamp) {
      return new Date(timestamp).toTwitterRelativeTime();
    };
    $rootScope.urlify = function (text) {
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      if (typeof text !== "undefined") {
        return text.replace(urlRegex, function(url) {
          return '<a href="' + url + '" target="_blank">' + url + '</a>';
        });
      } else {
        return text;
      }
    };
    $interval(function() {
      //this interval causes causes a $digest cycle in angular, automatically updating all the timestamps for tweets
    }, 60000)
  })
  // Code for route management.
  .config(function ($routeProvider) {
    "use strict";
    $routeProvider.when('/', {
      controller: 'global',
      templateUrl: 'views/global.html'
    })
    .when('/search/:text', {
        controller: 'search',
        templateUrl: 'views/search.html'
    })
    .when('/profile/:userId', {
      controller: 'profile',
      templateUrl: 'views/profile.html'
    })
   .when('/home/:feed', {
      controller: 'home',
      templateUrl: 'views/home.html'
    })
    .otherwise({
      redirectTo: '/'
    });
  });