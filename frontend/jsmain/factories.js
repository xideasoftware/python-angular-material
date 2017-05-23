
pdapp.config(['$mdThemingProvider', function(mdThemingProvider) {
    mdThemingProvider.theme('pd');
    mdThemingProvider.definePalette('amazingPaletteName', {
        '50': 'ff0000',
        '100': 'ff0000',
        '200': 'ef0000',
        '300': 'e50000',
        '400': 'ef0000',
        '500': '222222',
        '600': 'e50000',
        '700': 'd30000',
        '800': 'c60000',
        '900': 'b70000',
        'A100': 'df0000',
        'A200': '3B5998',
        'A400': '55acee',
        'A700': 'df0000',
        'contrastDefaultColor': 'light',
        // whether, by default, text (contrast)
        // on this palette should be dark or light
        'contrastDarkColors': [],
        //hues which contrast should be 'dark' by default
        'contrastLightColors': undefined // could also specify this if default was 'dark'
    });
    mdThemingProvider.theme('pd')
    .primaryPalette('amazingPaletteName', {
        'default': '500',
        'hue-1': 'A100',
        'hue-2': 'A100',
        'hue-3': 'A100',
    });
    mdThemingProvider.theme('pd')
    .accentPalette('amazingPaletteName', {
        'default': 'A100',
        'hue-1': 'A100',
        'hue-2': 'A200',
        'hue-3': 'A400',
    });
    mdThemingProvider.theme('pd')
    .warnPalette('amazingPaletteName', {
        'default': 'A100',
        'hue-1': 'A100',
        'hue-2': 'A100',
        'hue-3': 'A100',
    });
}
]);

var routerConfig = function() {
    // Now set up the states
    var config = {};
    angular.forEach(controllers, function(name) {
        this[name] = {
            controller: name + "Ctrl",
            path: '/' + name + '/:topicId/:topicName/:statementId/:statementName',
        };
    }
    , config);
    config['home'] = {
        path: '/home',
        controller: 'homeCtrl'
    };
    config['home!1'] = {
        path: '/home!1',
        controller: 'homeCtrl'
    };
    config['home!2'] = {
        path: '/home!1',
        controller: 'homeCtrl'
    };
    config['home!3'] = {
        path: '/home!1',
        controller: 'homeCtrl'
    };
    //building urls
    config['all']['clientid'] = 1;
    config['all']['expand'] = true;
    config['getyourpositiondial']['expand'] = true;
    config['yourpositiondial']['expand'] = true;
    config['author']['path'] = '/author/:topicId/:topicName/:authorId/:authorName';
    config['mp']['path'] = '/mp/:topicId/:topicName/:authorId/:authorName';
    config['brandprofile']['path'] = '/brandprofile/:topicId/:topicName/:orgId/:orgName';
    config['brandcomparison']['path'] = '/brandcomparison';
    config['authorppc']['path'] = '/authorppc/:topicId/:topicName/:authorId/:authorName';
    //adding politician page with same path as authorppc
    config['politician']['path'] = '/politician/:topicId/:topicName/:authorId/:authorName';
    config['matchmp']['path'] = '/matchmp/:topicId/:topicName/:matchId/:matchName';
    config['matchparty']['path'] = '/matchparty/:topicId/:topicName/:matchId/:matchName';
    config['matchfriend']['path'] = '/matchfriend/:clientId/:clientName/:trending/:trendingName/:topicId/:topicName/:matchId/:matchName';
    config['party']['path'] = '/party/:topicId/:topicName/:partyId/:partyName';
    config['brand']['path'] = '/brand/:topicId/:topicName/:brandId/:brandName';
    config['article']['path'] = '/article/:topicId/:articleId/:axisId/:articleName';
    config['electionquiz'] = {
        path: '/electionquiz/:opaquelink',
        controller: 'electionquizCtrl'
    };
    config['partyelectionquiz'] = {
        path: '/partyelectionquiz/:opaquelink',
        controller: 'partyelectionquizCtrl'
    };
    config['privacyandterms'] = {
        path: '/privacyandterms'
    };
    
    config['brandsaz'] = {
            path: '/brandsaz',
            controller: 'brandsazCtrl'
        };
    
    config['positionsaz'] = {
            path: '/positionsaz',
            controller: 'positionsazCtrl'
        };
        
    config['profileaz'] = {
        path: '/profileaz',
        controller: 'profileazCtrl'
    };
    config['account'] = {
        path: '/account',
        controller: 'accountCtrl'
    };
    config['resetpassword'] = {
        path: '/account/resetpassword/p/:userid/:tokenid',
        controller: 'resetpasswordCtrl'
    }
    config['privacyandterms'] = {
        path: '/privacyandterms'
    };
    config['election2015'] = {
        path: '/election2015/:shareId/:shareName/:statementId/:statementName',
        controller: 'election2015Ctrl',
        clientid: 8,
        expand: true
    };
    config['ifiwereinparliament'] = {
        path: '/ifiwereinparliament/:shareId/:shareName/:statementId/:statementName',
        controller: 'ifiwereinparliamentCtrl',
        clientid: 6,
        expand: true
    };
    config['trendingstatements'] = {
        path: '/trendingstatements/:shareId/:shareName/:trending/:trendingName/:statementId/:statementName',
        controller: 'trendingstatementsCtrl',
        expand: true
    };
    config['getyourpositiondial'] = {
        path: '/getyourpositiondial/:shareId/:shareName/:topicId/:topicName/:statementId/:statementName',
        controller: 'getyourpositiondialCtrl',
        expand: true
    };
    
    
    config['mpmatching'] = {
            path: '/mpmatching/:shareId/:shareName/:topicId/:topicName/:statementId/:statementName',
            controller: 'mpmatchingCtrl',
            expand: true
        };
    
    config['labourleadership2016'] = {
            path: '/labourleadership2016/:shareId/:shareName/:topicId/:topicName/:statementId/:statementName',
            controller: 'labourleadership2016Ctrl',
            expand: true
        };
    
    
    config['getyourpositiondialsticky'] = {
            path: '/getyourpositiondialsticky/:shareId/:shareName/:topicId/:topicName/:statementId/:statementName',
            controller: 'getyourpositiondialCtrl',
            expand: true
        };
    
    
    config['all'] = {
        path: '/all/:shareId/:shareName/:statementId/:statementName',
        controller: 'allCtrl',
        expand: true
    };
    config['brandmatching'] = {
            path: '/brandmatching/:shareId/:shareName/:statementId/:statementName',
            controller: 'brandmatchingCtrl',
            expand: true
        };
    angular.forEach(partials, function(name) {
        if (!_.has(config, name)){
            this[name] = {
                path: '/' + name
            };
        }
        if(_.endsWith(name,"!1")){
            name = name.replace("!1","!0");
            if (!_.has(config, name)){
                this[name] = {
                    path: '/' + name
                };
            }
        };
    }
    , config);
    return config;
}
();

pdapp.constant("routeConfig", routerConfig);

pdapp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'routeConfig', 
function(stateProvider, urlRouterProvider, locationProvider, routeConfig) {
    locationProvider.html5Mode(true).hashPrefix('!');
    // For any unmatched url, redirect to /state1
    urlRouterProvider.otherwise("/home");
    urlRouterProvider.when('^/', "/home");
    urlRouterProvider.when('/authormp/:authorId/:authorName', '/author/-1/-/:authorId/:authorName');
     
    angular.forEach(routeConfig, function(moduleArgs, moduleName) {
        var path = moduleArgs['path'];
        var stateconf = {
            url: path,
        };
        stateProvider.state(moduleName, stateconf);
        var nofilter = "/" + moduleName;
        for (var i = 0; i < path.split('/').length / 2 - 1; i++)
            nofilter += "/-1/-"
        urlRouterProvider.when('/' + moduleName, nofilter);
    }
    );

}
]);

pdapp.factory("RoutingService", ["$rootScope", "routeConfig", function(rootScope, routeConfig) {
    
    rootScope.validtopictransition = function(stateName, topic) {
        if (_.isUndefined(topic) || _.isNull(topic))
            return false;
        if (_.has(routeConfig[stateName], 'clientid')) {
            var clientid = routeConfig[state]['clientid'];
            var clients = _.where(cache.get("clients"), {
                'id': clientid
            });
            if (!_.isEmpty(clients))
                if (_.has(clients[0], "topicids"))
                    if (!_.contains(clients[0]["topicids"], topic.id))
                        return false;
        }
        return true;
    }
    
    return {};
}
]);

pdapp.factory("CacheService", ["$cacheFactory", function($cacheFactory) {
    var cache = $cacheFactory("cacheService");
    for (jsonkey in _jsonprecache)
        cache.put(jsonkey, _jsonprecache[jsonkey]);
    return cache;
}
]);

pdapp.factory("modalService", function() {
    return {
        dummything: function() {
        }
    };
}
);

pdapp.factory('Page', function() {
    var defaultTitle = 'your position | who matches | different sides';
    var title = defaultTitle;
    return {
        title: function() {
            return "PositionDial.com - " + title;
        },
        getTitle: function(){
            return title;  
        },
        setTitle: function(newTitle) {
            title = (newTitle == "") ? defaultTitle : newTitle
        }
    };
}
);

pdapp.factory('pdCompat', function(){
    var isold = true;
    if((!_.isUndefined(cssua.ua.ie)) && parseFloat(cssua.ua.ie) >= 10.0)
        isold = false;
    if((!_.isUndefined(cssua.ua.firefox)) && parseFloat(cssua.ua.firefox) >= 31.0)
        isold = false;
    if((!_.isUndefined(cssua.ua.chrome)) && parseFloat(cssua.ua.chrome) >= 31.0)
        isold = false;
    if((!_.isUndefined(cssua.ua.safari)) && parseFloat(cssua.ua.safari) >= 7.0)
        isold = false;
    if((!_.isUndefined(cssua.ua.android)) && parseFloat(cssua.ua.android) >= 4.4)
        isold = false;
    return {
        isOldBrowser: function(){
            return isold;
        }
    }
});

pdapp.factory('pdMedia', ['$rootScope', '$mdMedia', 'pdCompat', function(rootScope, media, compat) {
    return function(query) {
        if(compat.isOldBrowser())
            return false;
        return media(query);
    }
}
]);

pdapp.config(["$sceDelegateProvider", function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://cdn.positiondial.com/**', 'https://storage.googleapis.com/cdn.positiondial.com/**', 
    'http://storage.googleapis.com/cdn.positiondial.com/**', 'http://localhost**', 'http://dev.positiondial.com**', 'http://192.168**', 
    'http://cdn.positiondial.com/**', , 'https://storage.googleapis.com/cdn.positiondial.com/**', 'http://test.positiondial.com/**', 
    'http://\d*.positiondial-www.appspot.com**'])
}
]);

pdapp.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(isdebug);
}]);

pdapp.factory('interceptor', ['$q', '$rootScope', '$location', '$injector', function($q, $rootScope, $location, $injector) {
    
    var retryHttpRequest = function(config, deferred) {
        function successCallback(response) {
            deferred.resolve(response);
        }
        function errorCallback(response) {
            deferred.reject(response);
        }
        var $http = $injector.get('$http');
        $http(config).then(successCallback, errorCallback);
    }
    
    return {
        request: function(config) {
            return config || $q.when(config);
        },
        requestError: function(request) {
            return $q.reject(request);
        },
        response: function(response) {
            return response || $q.when(response);
        },
        responseError: function(response) {
            if (response && response.status === 404) {
            }
            if (response && response.status >= 500) {
                if (!_.has(response.config, "fails"))
                    response.config.fails = 0;
                response.config.fails += 1;
                if (response.config.fails > 3)
                    return $q.reject(response);
                var deferred = $q.defer();
                setTimeout(function() {
                    retryHttpRequest(response.config, deferred);
                }
                , 1500 * response.config.fails * response.config.fails);
                return deferred.promise;
            }
            return $q.reject(response);
        }
    };
}
]);

pdapp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('interceptor');
}
]);

pdapp.config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', 
function($controllerProvider, $compileProvider, $filterProvider, $provide) {
    var m = angular.module('pdapp');
    // Save old component registration methods (optional).
    m._controller = m.controller;
    m._service = m.service;
    m._factory = m.factory;
    m._directive = m.directive;
    
    // Provider-based component registration.
    m.controller = $controllerProvider.register;
    m.service = $provide.service;
    m.factory = $provide.factory;
    m.directive = $compileProvider.directive;
    m.filter = $filterProvider.register;

}
]);
