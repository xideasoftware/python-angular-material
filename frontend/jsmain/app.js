pdapp.controller('mainCtrl', [
    '$scope',
    '$rootScope',
    '$log',
    '$http',
    'CacheService',
    'ArticleService',
    'TopicService',
    '$location',
    '$window',
    'Page',
    '$timeout',
    'pdMedia',
    '$mdToast',
    '$mdDialog',
    '$animate',
    '$cookies',
    '$mdBottomSheet',
    '$state',
    'pdTopicService',
    'routeConfig',
    '$q',
    '$mdSidenav',
    '$sce',
    "RoutingService",
    'pdCompat',
    'StatementService',
    'StatsService',
    "VisitorService",
    "ShareService",
    "$mdComponentRegistry",
    function(scope, rootScope, log, http, cache, articleService, topicService, location, window, page, timeout, media, toast,
        mdDialog, animate, cookies, mdBottomSheet, state, pdTopicService, routeConfig, q, mdSidenav, sce, routingService,
        compat, statementService, StatsService, visitorService, shareService, mdComponentRegistry) {
	    log.info("starting positiondial.com app");

		StatsService.setup();

	    rootScope.getpathvalue = function(name, path) {
		    if (_.isUndefined(path))
			    var parts = location.url().split('?')[0].split('/');
		    else
			    var parts = path.split('?')[0].split('/').slice(2);
		    var stateName = parts[1];
		    if (!_.has(routeConfig, stateName))
			    return null;
		    var configRouteParts = routeConfig[stateName].path.split("/");
		    if (!_.contains(configRouteParts, ":" + name))
			    return null;
		    var pathIndex = _.indexOf(configRouteParts, ":" + name);
		    if (parts.length > pathIndex && parts[pathIndex] != "-1" && parts[pathIndex] != "-")
			    return parts[pathIndex];
		    return null;
	    };
	    scope.getpathvalue = rootScope.getpathvalue;

	    rootScope.modifypathidname = function(name, id, str, path){
		    if (_.isUndefined(path))
		    	path = location.url();
			var parts = path.split('?')[0].split('/');
		    var stateName = parts[1];
		    if (!_.has(routeConfig, stateName))
			    return null;
		    var configRouteParts = routeConfig[stateName].path.split("/");
		    if (!_.contains(configRouteParts, ":" + name+"Id"))
			    return null;
		    var pathIndex = _.indexOf(configRouteParts, ":" + name+"Id");
		    if (parts.length > pathIndex){
			    parts[pathIndex] = id;
			    parts[pathIndex+1] = str;
		    }			
			var newUrl = parts.join('/');
			if(location.url().split('?').length > 1)
				newUrl = newUrl + "?" + location.url().split('?')[1];
			return newUrl;
	    }

	    scope.notmatchlocation = function(posslist) {
		    var r = !scope.matchlocation(posslist);
		    return r;
	    };

	    scope.matchlocation = function(posslist) {
		    if (!_.isArray(posslist))
			    posslist = [ posslist ];

		    for (var i = 0; i < posslist.length; i++) {
			    var poss = posslist[i];
			    var posss = poss.split("?");
			    var searchdict = deserialiseURLToDict(poss);
			    var parts = location.path().split("/");
			    var statematch = (parts.length > 1) && posss[0] == parts[1];
			    var searchmatch = _.isEmpty(searchdict) || location.search()["tab"] == searchdict["tab"];
			    if (statematch && searchmatch)
				    return true;
		    }
		    return false;
	    };
	    scope.accounturl = secureprotocol + "://" + location.host() + "/account";
	    scope.confirmuseremailurl = secureprotocol + "://" + location.host() + "/confirmuseremail";
	    scope.logouturl = secureprotocol + "://" + location.host() + "/logout";
	    scope.loginurl = secureprotocol + "://" + location.host() + "/login";
	    scope.showsplash = false;
	    scope.showaccount = false;
	    scope.showresetpassword = false;
	    scope.isnewvisitor = isnewvisitor;
	    scope.page = page;
	    rootScope.page = page;
	    scope.isloggedin = isloggedin;
	    scope.pdloggedin = pdloggedin;
	    scope.username = username;
	    scope.basepartialurl = basepartialurl;
	    scope.baseimgurl = baseimgurl;
	    scope.baseiconurl = baseiconurl;
	    scope.articleimgurl = articleimgurl;
	    scope.imgconfig = imgconfig;
	    scope.visitor = cache.get("visitor");
	    scope.idtoaxis = cache.get("idtoaxis");
	    scope.idtotopics = pdTopicService.idtotopics;
	    scope.expId = expId;
	    scope.expVar = expVar;
	    scope.expVarPath = expVarPath;
	    scope.findopen = false;
	    scope.locknavopen = media('gt-md') && (_.isUndefined(cssua.ua.ie) || cssua.ua.ie >= 11.0);
	    scope.$media = media;
	    scope.media = media;
	    scope.isold = compat.isOldBrowser();
	    scope.alltopics = pdTopicService.alltopics;
	    scope.topic = scope.alltopics;
	    scope.featuredtopic = scope.idtotopics[cache.get("featuredtopicid")];
	    scope.viewabletopics = _.map([ 120, 78, 55, 56, 88, 74, 80, 63, 66, 5, 103, 37, 64, 75, 94, 111 ], function(x) {
		    return scope.idtotopics[x]
	    });
	    scope.viewabletopics.unshift(scope.alltopics);
	    scope.cdnbaseurl = location.protocol() + "://" + location.host() + "/cdn/";
	    scope.fixheadline = articleService.fixheadline;
	    scope.makesafelink = articleService.makesafelink;
	    rootScope.makesafelink = scope.makesafelink;
	    scope.offsitelinks = articleService.offsitelinks;
	    scope.cssua = cssua;
	    rootScope.cssua = cssua;
	    
	   scope.measuresignin = function () {
	        ga('send', 'event', 'MeasureSignIn','click','action', 2);
	        }
	    
	    if (scope.isloggedin)
	    	scope.measuresignin ();

	    rootScope.choosePartial = function(experimentId, webpage) {
		    if (experimentId != "")
			    if (scope.expVarPath != "")
				    if (experimentId.indexOf(scope.expId) > -1 && scope.expVar > 0)
					    webpage = scope.expVarPath.replace("/partials/", "").replace("partials/", "");
		    return scope.basepartialurl + webpage;
	    }

	    scope.$on('parentstatementreact', function(event, statementid, reaction, text) {
		    scope.$broadcast('statementreact', statementid, reaction, text);
	    });
		
		statementService.votehistory(function(visitorvotes) {
			scope.visitorvotes = _.mapKeys(visitorvotes, function(value, key) {
  				return value.entity;
			});	
			scope.ready.resolve();
		});

		articleService.readarticles((scope.topic.id>0)?{topicid:scope.topic.id}:{},function(readhistory) {
			rootScope.visitorreadarticles = _.mapKeys(readhistory, function(value, key) {
  				return value.entity;
			});	
			scope.readsready.resolve();
		});

	    scope.$on('$viewContentLoaded', function(event) {
		    var mainview = angular.element(document.getElementById('mainview'))[0];
		    //trying to fix mobile scroll issue commenting out next line
		    window.scrollTo(0, 1);
		    mainview.scrollTop = 1;
		    log.info("view content loaded");
	    });

	    scope.previousStateName = null;
	    scope.previousTopicid = null;
	    scope.scrolltotoplatch = false;

	    rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
		    var parts = newUrl.split('?')[0].split('/');
		    var oldparts = oldUrl.split('?')[0].split('/');

		    var shareid = scope.getpathvalue("shareId", newUrl);
		    if (_.isNull(shareid) || shareid == "-1") {
			    var defer = q.defer();
			    scope.shareready = defer.promise;
			    defer.resolve(null);
		    }

		    if (location.protocol() == 'https' && newUrl != oldUrl) {
			    if (!strStartsWith(newUrl, scope.accounturl) || !strStartsWith(newUrl, scope.confirmuseremailurl)) {
				    event.preventDefault();
				    timeout(function() {
					    scope.gooffsite('http' + newUrl.substring(5));
				    }, 0);
				    return;
			    }
		    }
		    if (location.protocol() == 'http' && newUrl != oldUrl) {
			    if (strStartsWith(newUrl, scope.accounturl.replace("https", "http"))) {
				    event.preventDefault();
				    timeout(function() {
					    scope.gooffsite('https' + newUrl.substring(4));
				    }, 0);
				    return;
			    }
			    if (parts[3] == "article") {
				    var article_id = parseInt(parts[4]);
				    if (_.has(scope.offsitelinks, article_id)) {
					    event.preventDefault();
					    url = scope.offsitelinks[article_id];
					    scope.readarticle(article_id);
					    window.open(url, '_blank');
					    return;
				    }
			    }
		    }
		    if (parts.length > 3 && parts[3] != "") {
			    var stateName = parts[3].split(".")[0];
			    if (_.has(routeConfig, stateName)) {
				    if (stateName == "home" && isnewvisitor && !scope.scrolltotoplatch) {
					    scope.showsplash = true;
					    scope.showaccount = false;
					    scope.showresetpassword = false;
					    ga('send', 'pageview', { 'page' : '/', 'title' : 'Splash Screen' });
				    }
				    if (stateName == "account" && !scope.scrolltotoplatch){
					    if (parts.length > 4 && parts[4] == "resetpassword") {
						    scope.showaccount = false;
						    scope.showresetpassword = true;
						    rootScope.resetpasswordParams={userid:parts[6], tokenid:parts[7]};
					    }
					    else{
					    	scope.showaccount = true;
					    	scope.showresetpassword = false;
					    	ga('send', 'pageview', { 'page' : '/account', 'title' : 'Account Page' });
					    }
				    }
			    }
			    scope.previousStateName = stateName;
		    } else
			    scope.previousStateName = "";
		    scope.navopen = false;
		    scope.findopen = false;
		    if (!scope.showsplash) {
			    var mainview = angular.element(document.getElementById('mainview'))[0];
			    mainview.scrollTop = 1;
		    }
		    if (scope.showsplash || scope.showaccount || scope.showresetpassword)
			    scope.locknavopen = false;
		    rootScope.closemenu();
		    scope.expandonmobile = _.has(routeConfig[stateName], "expand") && routeConfig[stateName]["expand"];
		    log.info("location change");
	    });

	    scope.ready = q.defer();
	    scope.readsready = q.defer();
	    scope.visitorready = q.defer();
	    scope.loaded = function() {
		    scope.loadimage(scope.baseimgurl + "img/user.svg", function(img) {
			    scope.userimg = img;
			    rootScope.userimg = img
		    });
		    scope.loadimage(scope.baseimgurl + "img/logo.svg", function(img) {
			    scope.logoimg = img;
			    rootScope.logoimg = img
		    });
		    scope.loadimage(scope.baseimgurl + "img/logosymbol.svg", function(img) {
			    scope.logosymbolimg = img;
			    rootScope.logosymbolimg = img
		    });
		    scope.loadimage(scope.baseimgurl + "img/trophy.svg", function(img) {
			    scope.trophyimg = img;
			    rootScope.trophyimg = img
		    });
		    var searchObject = location.search();
		    if (_.has(searchObject, "post_id"))
			    mdDialog.show({ controller : 'facebookSuccessPopupCtrl', resolve : { url : function() {
				    return "http://www.facebook.com"
			    } }, templateUrl : basepartialurl + 'facebooksuccesspopup.html' });
		    if (_.has(searchObject, "twpostid")) {
			    shareService.query({ shareid : searchObject["twpostid"] }, function(response) {
				    var share = response["share"];
				    shareService.sendtotw(share.data.msg, share.data.sharetarget, share.imagedataurl, share.data.data);
				    searchObject["twpostid"] = null;
			    });
		    }

		    var sharedefer = q.defer();
		    scope.shareready = sharedefer.promise;
		    var shareid = scope.getpathvalue("shareId");
		    if (!_.isNull(shareid) && shareid != "-1") {
			    shareService.query({ shareid : shareid }, function(response) {
				    var share = response["share"];
				    if (!_.isUndefined(share.imagedataurl) && !_.isNull(share.imagedataurl))
					    share.imagedataurl = sce.trustAsResourceUrl(share.imagedataurl);
				    if (_.isNull(share.name) || share.name == "")
					    share.name = "Your friend";
				    sharedefer.resolve(share);
			    }, function(error) {
				    sharedefer.resolve(null);
			    });
		    } else
			    sharedefer.resolve(null);
	    }

	    scope.awardlvls = [ 5, 10, 20, 50, 100, 200, 500 ];
	    scope.checknbadges = function(n) {
		    return _.contains(scope.awardlvls, n);
	    }

	    rootScope.$on('awardedbadge', function(event, badge, display) {
		    scope.visitor.badges.push(badge);
		    if (badge.typ == 'NBADGES' && display)
			    var modalinstance = mdDialog.show({ templateUrl : basepartialurl + 'badgepopup.html', resolve : { badge : function() {
				    return badge;
			    }, }, controller : 'badgepopupCtrl', targetEvent : event, }).then(function(answer) {
			    }, function() {
			    });
	    });

	    scope.popuparticle = function(articleid) {
		    if (_.has(scope.offsitelinks, articleid)) {
			    location.url("/article/" + articleid + "/dummy");
			    return;
		    }
		    var modalinstance = mdDialog.show({ templateUrl : basepartialurl + 'articleitem.html', resolve : { articleid : function() {
			    return articleid;
		    } }, controller : 'articleitemCtrl' });
	    }

	    scope.popupstatements = function(event, topic, axisid, side) {
		    var modalinstance = mdDialog.show({ templateUrl : basepartialurl + 'statementpopup.html', resolve : { topic : function() {
			    return topic;
		    }, axisid : function() {
			    return axisid;
		    }, side : function() {
			    return side;
		    } }, controller : 'statementpopupCtrl' });
	    }

	    scope.settitlebystatement = function(event, statement) {
		    if (_.isUndefined(statement))
			    return

		    scope.page.setTitle(statement.text);
	    }

	    scope.scrollchangelastsample = 0;
	    scope.scrolltarget = 1;
	    scope.$on('mainviewscrollchanged', function(event, pxfromtop, pxfrombottom) {
		    var fullwidthfooter = angular.element(document.getElementById('fullwidthfooter'));
		    var underfullwidthfooter = angular.element(document.getElementById('underfullwidthfooter'));
		    if (pxfrombottom > 100) {
			    underfullwidthfooter.css('height', "0px");
			    fullwidthfooter.css('bottom', "-100px");
			    return;
		    }
		    var scrolldelta = pxfrombottom - scope.scrolltarget;
		    if (pxfrombottom < scope.scrolltarget) {
			    underfullwidthfooter.css('height', ((100 - pxfrombottom) + "px"));
			    fullwidthfooter.css('bottom', (pxfrombottom > 100) ? "-100px" : (-1 * pxfrombottom + "px"));
		    }
		    scope.scrolltarget = pxfrombottom;
	    });

	    scope.mainviewwidth = null;
	    scope.$on("mainviewwidthchanged", function(event, w) {
		    scope.mainviewwidth = w;
	    });

	    scope.$on('vistordialelemid', function(event, vistordialelemid) {
		    log.info("Setting dial element to " + vistordialelemid);
		    scope.vistordialelemid = vistordialelemid;
		    rootScope.vistordialelemid = vistordialelemid;
	    });

	    scope.togglemenu = function() {
		    if (media('xs'))
			    mdSidenav('leftxs').toggle();
		    if (media('sm'))
			    mdSidenav('leftsm').toggle();
		    if (media('md'))
			    mdSidenav('leftmd').toggle();
		    if (media('gt-md')) {
			    scope.locknavopen = !scope.locknavopen;
		    }
		    if (scope.showsplash || scope.showaccount) {
			    scope.locknavopen = media('gt-md') && (_.isUndefined(cssua.ua.ie) || cssua.ua.ie >= 11.0);
			    scope.showsplash = false;
			    scope.showaccount = false;
			    
		    }
		    window.scrollTo(0, 1);

	    }

	    scope.togglefind = function() {
		    scope.findopen = !scope.findopen;
		    scope.navopen = false;
		    window.scrollTo(0, 1);
	    }

	    scope.gohome = function() {
		    scope.isnewvisitor = false;
		    scope.go("/home");
	    }

	    scope.go = function(to) {
		    scope.showsplash = false;
		    scope.showaccount = false;
		    location.url(to);
	    }
	    rootScope.go = scope.go;

		rootScope.gostatement = function(statement) {
			var newUrl = rootScope.modifypathidname("statement", statement.id, makesafelink(statement.text));
			rootScope.go(newUrl);
		}

	    rootScope.closemenu = function() {
	    	var mdr = mdComponentRegistry;
		    try {
		    	if(!_.isNull(mdComponentRegistry.get('leftsm')))
			    	mdSidenav('leftsm').close();
		    } catch (e) {
		    }
		    try {
		    	if(!_.isNull(mdComponentRegistry.get('leftmd')))
			    	mdSidenav('leftmd').close();
		    } catch (e) {
		    }
	    }

	    scope.gonewtab = function(url) {
		    rootScope.closemenu();
		    if(_.startsWith(url,"http"))
		    	if(!_.startsWith(url,"http://www.positiondial.com"))
		    		if(!_.startsWith(url,"https://www.positiondial.com"))
						ga('send', 'pageview', { 'page' : '/gonewtab?'+url, 'title' : url});
		    window.open(url, '_blank');
	    }

	    scope.gooffsite = function(url) {
		    rootScope.closemenu();
		    if(_.startsWith(url,"http"))
		    	if(!_.startsWith(url,"http://www.positiondial.com"))
		    		if(!_.startsWith(url,"https://www.positiondial.com"))
		    			ga('send', 'pageview', { 'page' : '/gooffsite?'+url, 'title' : url});
		    window.location.href = url;
	    }
	    
	    scope.back = function() { 
	        window.history.back();
	      }
	    

	    scope.goyourposition = function() {
		    scope.gostatetopic("/yourpositiondial");
	    }

	    rootScope.gostatetopic = function(url) {
		    rootScope.closemenu();
		    if (url.charAt(0) == "/")
			    url = url.replace("/", "");
		    var params = {};
		    var urlparts = routeConfig[url].path.split("/");
		    urlparts.shift();
		    urlparts.shift();
		    angular.forEach(urlparts, function(v) {
			    if (strEndsWith(v, "Id"))
				    this[v.substring(1)] = 1;
			    if (strEndsWith(v, "Name"))
				    this[v.substring(1)] = "-";
		    }, params);
		    params["topicId"] = scope.topic.id;
		    params["topicName"] = scope.makesafelink(scope.topic.name.substring(0, 100));
		    if (!rootScope.validtopictransition(url, scope.topic)) {
			    params["topicId"] = "1";
			    params["topicName"] = "-";
			    params["statementId"] = "-1";
			    params["statementName"] = "-";
		    }
		    scope.showsplash = false;
		    scope.showaccount = false;
		    var desturl = state.href(url, params);
		    location.url(desturl);
	    }

	    scope.filtertocurrenttopics = function(topic) {
		    return _.has(scope.viewabletopics, topic);
	    }

	    scope.$on("toptopicchange" ,function(event, topic){
	    	scope.topic = topic;
	    });

	    scope.gotopic = function(topic) {
		    if (_.isNumber(topic))
			    topic = scope.idtotopics[topic];
		    location.url("/home/" + topic.id + "/" + scope.makesafelink(topic.name) + "/-1/-");
	    }

	    scope.dosearch = function() {
		    location.url("/search?" + scope.indexsearchquery);
	    }

	    scope.twitterurl = function() {
		    return location.absUrl();
	    }

	    scope.getyoutubeid = function(link) {
		    if (link == null)
			    return null;
		    var parts = link.split('/');
		    if (parts[2] != "www.youtube.com")
			    return null;
		    var params = scope.deserialiseURLToDict(parts[3].replace("#", "&"));
		    if (!_.has(params, "v"))
			    return null;
		    return params["v"];
	    }

	    scope.twittertext = function() {
		    return "PositionDial.com - what's yours?";
	    }

	    scope.mykleosscore = function() {
		    return _.size(scope.visitorvotes) + _.size(scope.visitorreadarticles) + scope.visitor.sharecount;
	    }

	    scope.suggestMediaItem = function(axis, topic, position) {
		    mdBottomSheet.show({ templateUrl : basepartialurl + "addarticle.html", controller : 'addarticleCtrl', resolve : { 'axis' : function() {
			    return axis
		    }, 'topic' : function() {
			    return topic
		    }, 'position' : function() {
			    return position
		    } } }).then(function(res) {

		    });
	    }

	    scope.readarticle = function(article_id) {
		    articleService.readarticle(article_id );
		    rootScope.visitorreadarticles[article_id] = { 'time' : new Date().getTime() };
	    }

	    scope.followTopic = function(topic) {
		    topicService.follow({ "topicid" : topic.id, "follow" : !scope.isFollowedTopic(topic) });
		    scope.visitor.topicsfollowed[topic.id] = { "follow" : !scope.isFollowedTopic(topic) };
	    }

	    scope.isFollowedTopic = function(topic) {
		    try {
			    return scope.visitor.topicsfollowed[topic.id].follow;
		    } catch (err) {
			    return false
		    }
	    }

	    scope.ignoreTopic = function(topic) {
		    topicService.ignore({ "topicid" : topic.id, "ignore" : !scope.isIgnoredTopic(topic) });
		    scope.visitor.topicsignored[topic.id] = { "ignore" : !scope.isIgnoredTopic(topic) }
	    }

	    scope.isIgnoredTopic = function(topic) {
		    try {
			    return scope.visitor.topicsignored[topic.id].ignore;
		    } catch (err) {
			    return false
		    }
	    }

	    scope.serialiseDictToURL = serialiseDictToURL;

	    scope.deserialiseURLToDict = deserialiseURLToDict;

	    if (window.location.pathname == "/search") {
		    if (window.location.search != "") {
			    q = unescape(window.location.search.substring(1));
			    scope.indexsearchquery = q;
		    }
	    }

	    scope.statementtotopic = {};

	    angular.forEach(scope.idtotopics, function(t, tkey) {
		    angular.forEach(t.statements, function(s, skey) {
			    var topiclist = _.has(scope.statementtotopic, s) ? scope.statementtotopic[s] : [];
			    topiclist.push(this.id);
			    scope.statementtotopic[s] = topiclist;
		    }, t);
	    });

	    scope.chooselevel = function(level) {
		    rootScope.$broadcast("changelevel", level);
	    }

	    scope.fireshare = function(sharetype, arg1, arg2, arg3) {
		    log.info("broadcasting " + sharetype);
		    rootScope.$broadcast(sharetype, arg1, arg2, arg3);
	    }

	    rootScope.fireshare = scope.fireshare;

	    scope.choosetopic = function() {
		    mdBottomSheet.show(
		        { templateUrl : basepartialurl + "topicsheetpickergrid.html", controller : 'TopicSheetPickerCtrl', resolve : { viewabletopics : function() {
			        if (scope.previousStateName != "") {
				        if (_.has(routeConfig[scope.previousStateName], 'clientid')) {
					        var clientid = routeConfig[scope.previousStateName]['clientid'];
					        var clients = _.where(cache.get("clients"), { 'id' : clientid });
					        if (!_.isEmpty(clients)) {
						        if (_.has(clients[0], "topicids")) {
							        var topics = _.map(clients[0]["topicids"], function(t) {
								        return pdTopicService.idtotopics[t]
							        });
							        topics.unshift(scope.alltopics);
							        return topics;
						        }
					        }
				        }
			        }
			        return scope.viewabletopics;
		        }, baseimgurl : function() {
			        return scope.baseimgurl;
		        } }, }).then(function(topic) {
			    scope.changetopic(topic);
		    });
	    }
	    
	    scope.pickatopic = function() {
		    mdBottomSheet.show(
		        { templateUrl : basepartialurl + "topicsheetpickergrid.html", controller : 'TopicSheetPickerCtrl', resolve : { viewabletopics : function() {
			        if (scope.previousStateName != "") {
				        if (_.has(routeConfig[scope.previousStateName], 'clientid')) {
					        var clientid = routeConfig[scope.previousStateName]['clientid'];
					        var clients = _.where(cache.get("clients"), { 'id' : clientid });
					        if (!_.isEmpty(clients)) {
						        if (_.has(clients[0], "topicids")) {
							        var topics = _.map(clients[0]["topicids"], function(t) {
								        return pdTopicService.idtotopics[t]
							        });
							        topics.unshift(scope.alltopics);
							        return topics;
						        }
					        }
				        }
			        }
			        return scope.viewabletopics;
		        }, baseimgurl : function() {
			        return scope.baseimgurl;
		        } }, }).then(function(topic) {
			    scope.changetopic(topic);
		    });
	    
		    var leftDiv = document.createElement("div"); //Create left div
	        leftDiv.id = "left"; //Assign div id
	        leftDiv.setAttribute("style", "float:left; width:66.5%; line-height: 26px; text-align:left; font-size:12pt; padding-left:8px; height:26px;"); //Set div attributes
	        leftDiv.style.background =  "#FF0000";
	        a = document.createElement('a');
	        a.href =  'google.com';
			a.innerHTML = "Link"
	    leftDiv.appendChild(a);
	    document.body.appendChild(leftDiv);
	    
	    }
	    
	    scope.changetopic = function(topic, supressurl) {
	    	var previoustopic = scope.topic;
		    if (_.isString(topic))
			    topic = parseInt(topic);
		    if (_.isNumber(topic))
			    if (topic == -1)
				    topic = scope.alltopics;
			    else
				    topic = scope.idtotopics[topic];
		    if (_.isUndefined(topic) || _.isNull(topic))
			    throw "Topic is Null!";
		    var parts = location.url().split('?')[0].split('/');
	        var stateName = parts[1];
		    scope.topic = rootScope.validtopictransition(stateName, topic) ? topic : topicService.alltopics;
		    if (_.isBoolean(supressurl) && supressurl)
			    return;
		    var params = _.cloneDeep(state.params);
		    params["statementId"] = -1;
		    params["statementName"] = "-";
		    params["topicId"] = topic.id;
		    params["topicName"] = scope.makesafelink(topic.name.substring(0, 100));
        	if (previoustopic != scope.topic)
            	rootScope.$broadcast('topicchange', scope.topic);
		    if(state.current.name == "")
		    	return;
		    var desturl = state.href(state.current.name, params);
		    if (!_.isEmpty(location.search()))
			    desturl += "?" + serialiseDictToURL(location.search());
		    location.url(desturl);
	    }

	    scope.$on('topicchange', function(event, topic) {
	    	if(topic != scope.topic)
		    	scope.changetopic(topic)
	    });

	    scope.$on('changerequest', function(event, topic) {
		    scope.changetopic(topic)
	    });

	    scope.showcookieconsent = function() {
		    toast.show(
		        { templateUrl : basepartialurl + 'cookies.html', hideDelay : 20000, position : 'bottom right', controller : 'ToastCtrl', action : 'I Agree', })
		        .then(function() {
			        cookies.agreeCookie = 'YES';
		        });
	    }

	    rootScope.subscribeupdates = function(eventname) {
		    var updateme = function() {
			    rootScope.$broadcast(eventname);
		    }
		    var backoff = [ 0, 250, 800, 2000, 5000, 10000, 20000 ];
		    for (var i = 0; i < backoff.length; i++)
			    timeout(updateme, backoff[i]);
	    }

	    var agreeCookie = cookies.agreeCookie;
	    if (cookies.agreeCookie != 'YES')
		    timeout(scope.showcookieconsent, 2000);

	    scope.articleimgsize = function(article, width, height) {
		    return pdImageService.articleimgsizetopic(article, width, height, scope.topic);
	    }

	    scope.activateMenu = function(x) {
		    scope.activeMenuItem = x
	    }

	    var w = angular.element(window);
	    scope.lastPageYOffset = this.pageYOffset;
	    scope.scrollshow = true;
	    scope.showsharing = false;
	    scope.showfilter = false;
	    scope.expandonmobile = true;

	    w.bind('resize', function() {
		    rootScope.subscribeupdates('mainwidthrequest');
		    rootScope.closemenu();
	    });
	    scope.enableshowfilter = function() {
		    scope.showfilter = true
	    };
	    scope.enableshowsharing = function() {
		    scope.showsharing = true
	    };

	    scope.mapreaction = function(reaction) {
		    if (reaction == -2)
			    return "Strongly Against";
		    if (reaction == -1)
			    return "Moderately Against";
		    if (reaction == 0)
			    return "A mixture of For and Against";
		    if (reaction == 1)
			    return "Moderately For";
		    if (reaction == 2)
			    return "Strongly For";
	    }
	    rootScope.mapreaction = scope.mapreaction;

	    rootScope.loadimage = function(url, func) {
		    url = url.replace(scope.baseimgurl, scope.cdnbaseurl);
		    var ready = q.defer();
		    ready.promise.then(func);
		    var img = new Image();
		    img.crossOrigin = "anonymous";
		    img.onload = function() {
			    ready.resolve(img);
		    };
		    if (_.isUndefined(cssua.ua.ie)) {
			    img.src = url;
			    return;
		    }
		    ;
		    var xhr = new XMLHttpRequest();
		    xhr.onload = function() {
			    var url = URL.createObjectURL(this.response);
			    img.src = url;
		    };
		    xhr.open('GET', url, true);
		    xhr.responseType = 'blob';
		    xhr.send();
	    }

	    scope.loaded();
    } ]);

