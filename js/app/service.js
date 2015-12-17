(function() {
    var app = angular.module('twitter')
        .run(function($rootScope, userSession, $location, $interval) {
            //Set the credentials for 'appbase'
            $rootScope.appbaseRef = new Appbase({
                url: 'https://scalr.api.appbase.io',
                appname: 'twitter',
                username: 'Sr5kpImw8',
                password: 'a7fbd1d3-736b-4f36-b2bd-9486a4f10617'
            });
        })
        //Creat the 'appbase-service' to use in global
        .service('appbaseService', function($rootScope, $timeout) {
            var methods = {};
            methods.index = function(type, body) {
                var appbaseObj = $rootScope.appbaseRef.index({
                    type: type,
                    body: body
                });
                return appbaseObj;
            };
            methods.update = function(type, body, id) {
                var appbaseObj = $rootScope.appbaseRef.index({
                    type: type,
                    id: id,
                    body: body
                });
                return appbaseObj;
            };
            methods.get = function(type, queryString) {
                var appbaseObj = $rootScope.appbaseRef.get({
                    type: type,
                    body: {
                        query: queryString
                    }
                });
                return appbaseObj;
            };
            methods.getStream = function() {
                var appbaseObj = $rootScope.appbaseRef.get({
                    type: type,
                    body: {
                        query: queryString
                    }
                });
                return appbaseObj;
            };
            methods.search = function(type, queryString) {
                var appbaseObj = $rootScope.appbaseRef.search({
                    type: type,
                    body: {
                        query: queryString
                    }
                });
                return appbaseObj;
            };
            methods.searchStream = function(type, queryString) {

                var appbaseObj = $rootScope.appbaseRef.searchStream({
                    type: type,
                    body: {
                        query: queryString
                    }
                });
                return appbaseObj;
            };
            methods.getBundleData = function(type, variable, searchQuery, callback) {
                var searchQuery = typeof searchQuery == 'undefined' ? {
                    match_all: {}
                } : searchQuery;
                methods.search(type, searchQuery).on('data', function(data) {
                    $timeout(function() {
                        $rootScope[variable] = data.hits.hits;
                        if (callback)
                            callback();
                        methods.searchStream(type, searchQuery).on('data', function(data2) {
                            $timeout(function() {
                                $rootScope[variable].unshift(data2);
                            });
                        }).on('error', function(data) {
                            console.log(data);
                        });
                    });
                }).on('error', function(data) {
                    console.log(data);
                });
            };
            return methods;
        })
        //Create 'tweetService' for different functionality of tweets
        .service('tweetService', function($rootScope, $timeout, appbaseService, userSession) {
            var methods = {};
            methods.addTweet = function(msg) {
                appbaseService.index('tweets', {
                    by: userSession.getUser(),
                    msg: msg,
                    createdAt: new Date()
                });
            }
            methods.personalTweet = function(person) {
                var searchQuery = {
                    term: {
                        by: person
                    }
                };
                $rootScope.personalTweets = [];
                appbaseService.getBundleData('tweets', 'personalTweets', searchQuery)
            }
            methods.personalInfo = function(person, callback) {
                var searchQuery = {
                    term: {
                        name: person
                    }
                };
                $rootScope.personalInfo = {};
                appbaseService.getBundleData('users', 'personalInfo', searchQuery, callback);
            }
            methods.followFunction = function(userId, follow) {
                if (follow) {
                    $rootScope.personalInfo[0]._source.followers.push($rootScope.myself._source.name);
                    $rootScope.myself._source.following.push(userId);
                } else {
                    $rootScope.personalInfo[0]._source.followers.remove($rootScope.myself._source.name);
                    $rootScope.myself._source.following.remove(userId);
                }
                appbaseService.update('users', $rootScope.personalInfo[0]._source, $rootScope.personalInfo[0]._id);
                appbaseService.update('users', $rootScope.myself._source, $rootScope.myself._id);
            }
            methods.searchText = function(text) {
                var searchQuery_tweets = {

                    multi_match: {
                        query: text,
                        operator: "and",
                        fuzziness: "auto",
                        fields: ["msg"]
                    }

                };
                appbaseService.getBundleData('tweets', 'searchTweets', searchQuery_tweets);
                var searchQuery_users = {
                    multi_match: {
                        query: text,
                        operator: "and",
                        fuzziness: "auto",
                        fields: ["name"]
                    }
                };
                appbaseService.getBundleData('users', 'searchUsers', searchQuery_users);
            }
            return methods;
        })
        //Create 'LoginService' - to check if user is already exists and if not create the user and logged him in
        .service('loginService', function($rootScope, $timeout, appbaseService, userSession) {
            var methods = {};

            methods.init = function(callback) {
                //check if user is already exists
                var loginObj = {};
                loginObj.checkUser = appbaseService.search('users', {
                    term: {
                        name: userSession.getUser()
                    }
                });


                loginObj.userSearch = function(callback) {
                    loginObj.checkUser.on('data', function(data) {
                        if (data.hits.hits.length) {
                            $rootScope.myself = data.hits.hits[0];
                            callback();
                        } else {
                            loginObj.userIndex(callback);
                        }
                    });
                }
                loginObj.userSearch(callback);

                loginObj.userIndex = function(callback) {
                    $timeout(function() {
                        var userObj = {
                            name: userSession.getUser(),
                            followers: [],
                            following: []
                        };
                        loginObj.appbaseLogin = appbaseService.index('users', userObj);
                        loginObj.appbaseLogin.on('data', function(data) {
                            data._source = userObj;
                            $rootScope.myself = data;
                            callback();
                        });
                    });
                }
            }

            return methods;
        })
        // Stores logged in user's id.
        .service('userSession', function() {
            var userSession = {};
            userSession.initComplete = false;
            userSession.setUser = function(userId) {
                localStorage.setItem("currentLoggedInUser", userId);
            };
            userSession.exit = function() {
                localStorage.removeItem("currentLoggedInUser");
            };
            userSession.getUser = function() {
                return localStorage.getItem("currentLoggedInUser");
            };
            return userSession;
        });
})();

Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};