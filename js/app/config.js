var app = angular.module('twitter', ['ngRoute', 'ngSanitize', 'vs-repeat']);
app.run(function ($rootScope, userSession, $location, $interval) {
    "use strict";
    // Here **$rootScope** is used for
    // changing the routes and managing visibility of navigation bar. 
    $rootScope.bahar = true;
    $rootScope.feed = 'global';
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
      $rootScope.bahar = true;
    };
    $rootScope.showNav = function () {
      $rootScope.bahar = false;
    };
    $rootScope.load = function () {
      $location.path('/loading');
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