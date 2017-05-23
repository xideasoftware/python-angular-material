var nua = navigator.userAgent;
var is_android = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
if (is_android) {
	$('select.form-control').removeClass('form-control').css('width', '100%');
}

// angular init
pdapp = angular.module('pdapp', [ 'ngResource', 'ui.bootstrap', 'ngRoute', 'ngTouch', 'ngAnimate', 'ngSanitize', 'ui.slider' ]);

pdapp.config(function($routeProvider) {
	$routeProvider.when('/pro', {
	  controller : 'mainAnalysisCtrl',
	  templateUrl : basepartialurl + 'promain.html',
	});
	$routeProvider.when('/pro/socialanalysis', {
	  controller : 'socialAnalysisCtrl',
	  templateUrl : basepartialurl + 'socialanalysis.html',
	});
	$routeProvider.when('/pro/socialanalysis/:orgId/:orgName', {
	  controller : 'socialAnalysisCtrl',
	  templateUrl : basepartialurl + 'socialanalysis.html',
	});
	$routeProvider.when('/pro/socialanalysis/sentiment/:orgId/:orgName', {
	  controller : 'sentimentCtrl',
	  templateUrl : basepartialurl + 'sentiment.html',
	});
	$routeProvider.when('/pro/socialanalysis/buzz/:orgId/:orgName', {
	  controller : 'buzzCtrl',
	  templateUrl : basepartialurl + 'buzz.html',
	});
	$routeProvider.when('/pro/socialanalysis/topinterests/:orgId/:orgName', {
	  controller : 'topInterestsCtrl',
	  templateUrl : basepartialurl + 'topinterests.html',
	});
	$routeProvider.when('/pro/socialanalysis/interestlongtail/:orgId/:orgName', {
	  controller : 'interestLongTailCtrl',
	  templateUrl : basepartialurl + 'interestlongtail.html',
	});
	$routeProvider.when('/pro/socialanalysis/wheretheystand/:orgId/:orgName', {
	  controller : 'whereTheyStandCtrl',
	  templateUrl : basepartialurl + 'wheretheystand.html',
	});
	$routeProvider.when('/pro/actionanalysis/:orgId/:orgName', {
	  controller : 'actionAnalysisCtrl',
	  templateUrl : basepartialurl + 'actionanalysis.html',
	});
	$routeProvider.when('/pro/plugins', {
	  controller : 'pluginsCtrl',
	  templateUrl : basepartialurl + 'plugins.html',
	});
	$routeProvider.otherwise({
		redirectTo : '/pro'
	});
});

pdapp.controller('proCtrl', [ '$scope', '$rootScope', '$log', '$http', 'CacheService', 'ArticleService', '$routeParams', '$location', '$route', '$window',
    'Page', '$modal', 'DialShareService', 'OrgService',
    function(scope, rootScope, log, http, cache, articleService, routeParams, location, route, window, page, modal, dialShareService, orgService) {
	    scope.dialinstancecounter = {
		    "top" : 0
	    }; // hack to enumerate dial instances
	    scope.page = page;
	    scope.isloggedin = isloggedin;
	    scope.username = username;
	    scope.visitorid = visitorid;
	    scope.accounturl = accounturl;
	    scope.basepartialurl = basepartialurl;
	    scope.baseimageurl = baseimageurl;
	    scope.baseimgurl = baseimgurl;
	    scope.imgconfig = imgconfig;
	    scope.visitor = cache.get("visitor");
	    scope.idtoaxis = cache.get("idtoaxis");
	    scope.idtotopics = cache.get("idtotopics");
	    scope.findopen = false;
	    scope.navopen = false;
	    scope.activepanel = "promain";
	    scope.alltopics = {
	      'id' : -1,
	      'name' : 'All Topics'
	    };

	    angular.forEach(scope.idtotopics, function(t, k) {
		    t["safelink"] = "/topic/" + t["id"] + "/" + t["name"].replace(" ", "-").replace(" ", "-").replace(" ", "-");
	    });
	    scope.offsitelinks = {};

	    scope.choosePartial = function(experimentId, webpage) {
		    if (experimentId != "")
			    if (scope.expVarPath != "")
				    if (experimentId.indexOf(scope.expId) > -1 && scope.expVar > 0)
					    webpage = scope.expVarPath.replace("/partials/", "").replace("partials/", "");
		    return scope.basepartialurl + webpage;
	    };

	    scope.$on('$routeChangeSuccess', function(event) {

	    });

	    scope.getactivepanel = function() {
		    return scope.activepanel;
	    };

		scope.isinentitycontext = function() {
		    return scope.inentitycontext;
	    };

	    scope.inorgcontext = false;
		scope.orgid = -1;
		scope.orgname = "";
		scope.org = null;

	    scope.$on('$viewContentLoaded', function(event) {
		    ga('send', 'pageview', { page: location.path() });
		    scope.activepanel = location.url();
			var parts = location.url().split('/');
		    if(parts.length < 5){
		    	scope.activepanel = "promain";
		    	scope.inentitycontext = false;
		    	scope.orgid = -1;
		    	scope.orgname = "";
		    	return;
		    }
		    scope.activepanel = parts[2];
		    scope.orgid = parts[4];
		    scope.orgname = parts[5];
		    scope.inorgcontext = true;
			orgService.query({'orgid':scope.orgid} , function(response){
				var res = response;
				scope.org = res["org"];
		    });
	    });

	    scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
		    if (location.protocol() == 'https' && newUrl != oldUrl) {
			    var parts = newUrl.split('/');
			    if (newUrl.indexOf(scope.accounturl) == -1) {
				    event.preventDefault();
				    window.location.href = 'http' + newUrl.substring(5);
			    }
		    }
		    if (location.protocol() == 'http' && newUrl != oldUrl) {
			    var parts = newUrl.split('/');
			    var oldparts = oldUrl.split('/');
			    if (parts[3] != "pro") {
					window.location.href=newUrl;
			    }
		    }
		    scope.navopen = false;
		    scope.findopen = false;
		    scope.page.setTitle("");
		    window.scrollTo(0, 0);
	    });

	    scope.popuparticle = function(articleid) {
		    if (_.has(scope.offsitelinks, articleid)) {
			    location.url("/article/" + articleid + "/dummy");
			    return;
		    }
		    ;
		    var modalinstance = modal.open({
		      templateUrl : basepartialurl + 'articleitem.html',
		      resolve : {
			      articleid : function() {
				      return articleid;
			      }
		      },
		      controller : 'articleItemCtrl'
		    });

	    };

	    scope.$on('$locationChangeSuccess', function(event) {
		    window.scrollTo(0, 0);
	    });

	    scope.$on('vistordialelemid', function(event, vistordialelemid) {
		    scope.vistordialelemid = vistordialelemid;
	    	rootScope.vistordialelemid = vistordialelemid;
	    });

	    scope.gohome = function() {
		    location.url("/pro");
	    };

	    scope.go = function(to) {
		    location.url(to);
	    };

	    scope.gooffsite = function(to) {
		    window.location.href = to;
	    };

	    scope.goconsumer = function(to) {
		    window.location.href = "http://www.positiondial.com";
	    };

	    scope.makesafelink = makesafelink;

	    scope.overlayfor = function(article_id, w, h) {
		    var overlay = ''
		    var inReadIt = _.has(scope.visitorreadarticles, article_id);
		    var inOffsite = _.has(scope.offsitelinks, article_id);
		    if (inReadIt && inOffsite)
			    overlay = 'readitoffsiteoverlay.png.' + w + '.' + h + '.png'
		    else if (inReadIt)
			    overlay = 'readitoverlay.png.' + w + '.' + h + '.png'
		    else if (inOffsite)
			    overlay = 'offsiteoverlay.png.' + w + '.' + h + '.png'
		    else
			    overlay = 'blankoverlay.png.' + w + '.' + h + '.png';
		    return baseimageurl + overlay;
	    };

	    scope.getpngdataurl = getpngdataurl

	    scope.serialiseDictToURL = serialiseDictToURL

	    scope.deserialiseURLToDict = deserialiseURLToDict


}]);