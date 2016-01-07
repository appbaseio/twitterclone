(function() {
    var app = angular.module('twitter')
        .run(function($rootScope, userSession, $location, $interval) {
            //Set the credentials for 'appbase'
            $rootScope.appbaseRef = new Appbase({
                url: 'https://scalr.api.appbase.io',
                appname: 'twitter',
                username: '6HVI9SUIr',
                password: 'e601d171-dd83-48f0-8e8a-1cf06414ce69'
            });
            $rootScope.setRequestInfo = function() {
                $rootScope.RequestParam = {};
                $rootScope.defaultSize = 30;
            };
            $rootScope.setRequestInfo();
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
            methods.search = function(type, bodyObj) {
                var appbaseObj = $rootScope.appbaseRef.search({
                    type: type,
                    body: bodyObj
                });
                return appbaseObj;
            };
            methods.searchStream = function(type, bodyObj) {
                var appbaseObj = $rootScope.appbaseRef.searchStream({
                    type: type,
                    body: bodyObj
                });
                return appbaseObj;
            };
            methods.getBundleData = function(variable, type, bodyObj, callback) {
                var defaultBodyObj = {
                    query: {
                        match_all: {}
                    },
                    size: $rootScope.defaultSize,
                    from: 0
                };
                var bodyObj = typeof bodyObj == 'undefined' ? defaultBodyObj : bodyObj;
                methods.search(type, bodyObj).on('data', function(data) {
                    $timeout(function() {
                        $rootScope[variable] = data;
                        if (callback)
                            callback();
                        
                        if(typeof $rootScope[variable+'-stream'] != 'undefined'){
                            $rootScope[variable+'-stream'].stop();
                        }
                        $rootScope[variable+'-stream'] = methods.searchStream(type, bodyObj).on('data', function(data2) {
                            $timeout(function() {
                                if(typeof $rootScope[variable] != 'undefined'){
                                    $rootScope[variable].hits.hits.unshift(data2);
                                }
                                else{
                                    $rootScope[variable] = {hits:{hits:[data2]}};   
                                }
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
            methods.globalTweet = function(relatedVariable, step) {
                if(step == 'initialize'){
                    $rootScope.RequestParam[relatedVariable] = {
                        size:$rootScope.defaultSize,
                        from:0
                    };
                }
                var searchQuery = {
                  query:  {match_all: {}},
                  size:$rootScope.RequestParam[relatedVariable].size,
                  from:$rootScope.RequestParam[relatedVariable].from,
                  sort:{
                    "createdAt":"desc"
                  }
                };
                if(step == 'initialize'){
                    appbaseService.getBundleData(relatedVariable, 'tweets', searchQuery);
                }
                else if(step == 'scroll'){
                    appbaseService.search('tweets', searchQuery).on('data', function(data) {
                        $timeout(function() {
                            $rootScope[relatedVariable].hits.hits = $rootScope[relatedVariable].hits.hits.concat(data.hits.hits)
                        });
                    });
                }
            }
            methods.personalTweet = function(relatedVariable, person, step) {
                if(step == 'initialize'){
                    $rootScope[relatedVariable] = {};
                    $rootScope.RequestParam[relatedVariable] ={
                        size:$rootScope.defaultSize,
                        from:0
                    };
                }
                var searchQuery = {
                    query: {
                        term: {
                            by: person
                        }
                    },
                    size: $rootScope.RequestParam[relatedVariable].size,
                    from: $rootScope.RequestParam[relatedVariable].from,
                    sort: {
                        "createdAt": "desc"
                    }
                };
                if(step == 'initialize'){
                    appbaseService.getBundleData(relatedVariable, 'tweets', searchQuery);
                }
                else if(step == 'scroll'){
                    appbaseService.search('tweets', searchQuery).on('data', function(data) {
                        $timeout(function() {
                            $rootScope[relatedVariable].hits.hits = $rootScope[relatedVariable].hits.hits.concat(data.hits.hits)
                        });
                    });
                }
            }
            methods.searchTweet = function(relatedVariable, text, step) {
                if(step == 'initialize'){
                    $rootScope[relatedVariable] = {};
                    $rootScope.RequestParam[relatedVariable] ={
                        size:$rootScope.defaultSize,
                        from:0
                    };
                }
                var searchQuery = {
                    query: {
                        multi_match: {
                            query: text,
                            operator: "and",
                            fuzziness: "auto",
                            fields: ["msg"]
                        }
                    },
                    size: $rootScope.RequestParam[relatedVariable].size,
                    from: $rootScope.RequestParam[relatedVariable].from,
                    sort: {
                        "createdAt": "desc"
                    }
                };
                if(step == 'initialize'){
                    appbaseService.getBundleData(relatedVariable, 'tweets', searchQuery);
                }
                else if(step == 'scroll'){
                    appbaseService.search('tweets', searchQuery).on('data', function(data) {
                        $timeout(function() {
                            $rootScope[relatedVariable].hits.hits = $rootScope[relatedVariable].hits.hits.concat(data.hits.hits)
                        });
                    });
                }
            }
             methods.user = function(relatedVariable, step) {
                if(step == 'initialize'){
                    $rootScope.RequestParam[relatedVariable] ={
                        size:$rootScope.defaultSize,
                        from:0
                    };
                }
                var searchQuery = {
                  query:  {match_all: {}},
                  size:$rootScope.RequestParam[relatedVariable].size,
                  from:$rootScope.RequestParam[relatedVariable].from,
                  sort:{
                    "createdAt":"desc"
                  }
                };
                if(step == 'initialize'){
                    appbaseService.getBundleData(relatedVariable, 'users', searchQuery);
                }
                else if(step == 'scroll'){
                    appbaseService.search('users', searchQuery).on('data', function(data) {
                        $timeout(function() {
                            $rootScope[relatedVariable].hits.hits = $rootScope[relatedVariable].hits.hits.concat(data.hits.hits)
                        });
                    });
                }
            }
             methods.searchUser = function(relatedVariable, text, step) {
                 if(step == 'initialize'){
                    $rootScope[relatedVariable] = {};
                    $rootScope.RequestParam[relatedVariable] = {
                        size:$rootScope.defaultSize,
                        from:0
                    };
                }
                var searchQuery = {
                    query: {
                        multi_match: {
                            query: text,
                            operator: "and",
                            fuzziness: "auto",
                            fields: ["name"]
                        }
                    },
                    size: $rootScope.RequestParam[relatedVariable].size,
                    from: $rootScope.RequestParam[relatedVariable].from,
                    sort: {
                        "createdAt": "desc"
                    }
                };
                if(step == 'initialize'){
                    appbaseService.getBundleData(relatedVariable, 'users', searchQuery);
                }
                else if(step == 'scroll'){
                    appbaseService.search('users', searchQuery).on('data', function(data) {
                        $timeout(function() {
                            $rootScope[relatedVariable].hits.hits = $rootScope[relatedVariable].hits.hits.concat(data.hits.hits)
                        });
                    });
                }
            }
            methods.personalInfo = function(relatedVariable, person, callback) {
                var searchQuery = {
                    query: {
                        term: {
                            name: person
                        }
                    }
                }
                $rootScope[relatedVariable] = {};
                appbaseService.getBundleData(relatedVariable, 'users', searchQuery, callback);
            }
            methods.followFunction = function(userId, follow) {
                $rootScope.personalInfoSingle = $rootScope.personalInfo.hits.hits[0];
                if (follow) {
                    $rootScope.personalInfoSingle._source.followers.push($rootScope.myself._source.name);
                    $rootScope.myself._source.following.push(userId);
                } else {
                    $rootScope.personalInfoSingle._source.followers.remove($rootScope.myself._source.name);
                    $rootScope.myself._source.following.remove(userId);
                }
                appbaseService.update('users', $rootScope.personalInfoSingle._source, $rootScope.personalInfoSingle._id);
                appbaseService.update('users', $rootScope.myself._source, $rootScope.myself._id);
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
                    query: {
                        term: {
                            name: userSession.getUser()
                        }
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
                            following: [],
                            createdAt: new Date()
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
        })
        .directive('scrollDown', function($rootScope, appbaseService, tweetService, $timeout) {
            return function(scope, elm, attr) {
                var raw = elm[0];
                console.log(raw.scrollHeight, raw.offsetHeight);
                elm.bind('scroll', function() {
                    if (raw.scrollTop + raw.offsetHeight + 1 >= raw.scrollHeight) { // + 1 added, as a workaround for: (raw.scrollTop + raw.offsetHeight- raw.scrollHeight) would always stop at -1.
                        var type = attr.scrollDown;
                        
                        var totalFlag = $rootScope[type]['hits']['total'] > $rootScope[type]['hits']['hits'].length;
                        if(totalFlag){
                            $rootScope.RequestParam[type].from += $rootScope.RequestParam[type].size;
                            switch (type) {
                                case 'tweets':
                                    tweetService.globalTweet(type, 'scroll');
                                break;
                                case 'personalTweets':
                                    tweetService.personalTweet(type, $rootScope.currentPerson, 'scroll');
                                break;
                                case 'searchTweets':
                                    tweetService.searchTweet(type, $rootScope.currentQuery,'scroll');
                                break;
                                case 'users':
                                    tweetService.user(type, 'scroll');
                                break;    
                            }
                        }
                    }
                });
            };
        })
        .filter('relativeTime',function(){
            return function(timestamp) {
                return new Date(timestamp).toTwitterRelativeTime();
            };
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