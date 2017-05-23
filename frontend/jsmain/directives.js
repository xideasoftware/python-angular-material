
pdapp.directive('pdView', [
'$compile', 
'$http', 
'$templateCache', 
'$location', 
"$rootScope", 
"routeConfig", 
'pdTopicService', 
'Page',
'$log',
function(compile, http, templateCache, location, rootScope, routeConfig, topicService, page, log) {
    
    var element = null ;
    var parscope = null ;
    var childscope = null ;
    var stateName = null;
    var stateParams = null;
    
    var linker = function(lscope, lelement, attrs) {
        element = lelement;
        parscope = lscope;
        rootScope.$evalAsync(updateview);
    }
    
    var updateview = function() {
        if (stateName == "" || stateName == null)
            return;
        if (element == null)
            return;
        if (childscope != null )
            childscope.$destroy();
        var partialname = stateName.split("!")[0];
        var parts = expVarPath.split("/");
        var replacement = parts[parts.length-1].split(".")[0];
        if (stateName.indexOf("!") > 0){ //if we are overriding!
            partialname = stateName.replace("!",".").replace(".html","");
        } else if (partialname == replacement){ //if this partial is up for replacement
            partialname = parts[parts.length-1].replace(".html","");
        }
        if (_.endsWith(partialname, '.0'))
            partialname = partialname.replace('.0',"");
        log.info("p4 "+partialname);
        var tplURL = basepartialurl + partialname.replace(".html","") + ".html";
        log.info("t1 "+tplURL);
        log.info("s1 "+stateName);
        templateLoader = http.get(tplURL, {
            cache: templateCache
        }).success(function(html) {
        });
        var hascontroller = _.has(routeConfig, stateName) && _.has(routeConfig[stateName], 'controller');
        var inserthtml = function() {
            templateLoader.then(function(html) {
                rootScope.stateParams = stateParams;
                var template = "<ng-include src=\"'" + tplURL + "'\" ng-init=\"stateParams=stateParams\" id=\"mainviewinclude\" "  + 
                (hascontroller ? (" ng-controller=\"" + stateName.split("!")[0] + "Ctrl\" onload=\"onLoad()\"") : "") + "></ng-include>";
                template += '<div hide-gt-md id="underfullwidthfooter" pd-include src="footer.html" style="background-color:#222; border-top:15px solid #f2f2f2;height:150px;min-height:200px; position: relative; top:5%; left:-5%; width:110% "></div>';
                log.info("setting template");
                element.html(template);
                childscope = parscope.$new();
                compile(element.contents())(childscope);
                window.scrollTo(0, 1);
                ga('send', 'pageview', { 'page' : location.url(), 'title' : page.getTitle()});
                rootScope.subscribeupdates('mainwidthrequest');
                rootScope.$broadcast('topicchange', childscope.topic);
            }
            );
        }
        if (hascontroller) {
            log.info("c1 "+hascontroller);
            window.scriptloader((basejsurl + stateName.split("!")[0] + jsext).toLowerCase(), inserthtml);
        } 
        else
            inserthtml();
    }
    
    rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
        var parts = newUrl.split('?')[0].split('/');
        var oldparts = oldUrl.split('?')[0].split('/');
        var stateName = parts[3].split(".")[0];
        var oldStateName = oldparts[3].split(".")[0];
        var newtopic;
        
        var previoustopic = _.isNull(childscope) ? null  : childscope.topic;
        var configRouteParts = _.has(routeConfig, stateName) ? routeConfig[stateName].path.split("/") : [];
        if (_.contains(configRouteParts, ":topicId")) {
            var topicid = _.parseInt(parts[2 + _.indexOf(configRouteParts, ":topicId")]);
            var topic = topicService.idtotopics[topicid];
            newtopic = rootScope.validtopictransition(stateName, topic) ? topic : topicService.alltopics;
        } else
            newtopic = topicService.alltopics;
        if (!_.isNull(childscope))
            childscope.topic = newtopic;
        if (_.isNull(childscope) || previoustopic != childscope.topic)
            rootScope.$broadcast((oldStateName == stateName)?'topicchange':'toptopicchange', newtopic);
        previoustopic = newtopic;
        
        if (_.has(routeConfig, stateName)) {
            if (parts.length == configRouteParts.length + 2 && oldparts.length == parts.length) {
                var isdiff = false;
                angular.forEach(parts, function(v, i) {
                    if (v != oldparts[i]) {
                        var dkey = configRouteParts[i - 2];
                        if (dkey == ":statementId" || dkey == ":statementName")
                            return
                        
                        if (stateName == "matchfriend" || stateName == "matchparty" || stateName == "matchppc")
                            if (dkey == ":matchId" || dkey == ":matchName")
                                return
                        
                        isdiff = true;
                    }
                }
                , oldparts);
                if (!isdiff) {
                    rootScope.$broadcast("locationInternalChange", newUrl);
                    return;
                }
            }
        }
    });
    
    rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        
        stateName = toState.name;
        stateParams = toParams;
        
        if (stateName != fromState.name || !_.has(routeConfig, stateName))
            return updateview();
    
    }
    );
    
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: true,
        link: linker,
    };
}
])

pdapp.directive('pdImgDefault', function() {
    return {
        restrict: 'A',
        priority: 1002,
        link: function(scope, element, attr) {
            var triggered = false;
            element.on('error', function() {
                if (!triggered) {
                    var src = attr.fallbackSrc ? attr.fallbackSrc : attr["pdImgDefault"];
                    if (src.indexOf("/") == -1)
                        src = baseimgurl + 'img/' + src;
                    element[0].src = src;
                    triggered = true;
                }
            }
            );
        }
    };
}
);



pdapp.directive('emptyInput', function($parse) {
    return {
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        //ngModel should be there & it should be of type text
        if (angular.isObject(ngModel) &&
          (!attrs.type || attrs.type === 'text')) {
          var model = $parse(attrs.ngModel);
          model.assign(scope, '');
        }
      }
    }
});


pdapp.directive('pdArticleImg',[
'ArticleService', '$q',
function(articleService, q) {
    return {
        restrict: 'A',
        scope: {
            article: '=article',
            topic: '=topic'
        },
        link: function(scope, element, attr) {
            q.when(scope.article, function(article){
                var w = attr["width"];
                var h = attr["height"];
                var d = articleService.defaultimage(w, h);
            
                if (!_.isUndefined(article.isvalid))
                    if (!article.isvalid)
                        return;
                var html = '<div style="background-size: 100%; position: relative; top: 0; left: 0;">';
                html += '<img src="' + articleService.articleimgsizetopic(article, w, h, scope.topic) 
                + '" border="0" alt="" style="width: 100%" onerror="this.onerror=null;this.src=\'' + d + '\';">';
                html += '<div style="width: 100%; position: absolute; top: 0; left: 0; z-index: 1;">';
                html += '<a href="' + article.urllink + '">';
                html += '<img src="' + articleService.overlayfor(article.article_id, w, h) + '" border="0" alt="" style="width: 100%">';
                html += '</a></div></div>';
                element.append(html);
            });
        }
    }
}
]);

pdapp.directive('tooltip', [function() {
    return {
        priority: 1001,
        restrict: 'A',
        compile: function(element, attr) {
            var tooltext = attr["tooltip"];
            var direction = ""
            if (_.has(attr, "mdDirection"))
                direction = " md-direction=" + attr["mdDirection"];
            element.append('<md-tooltip ' + direction + '>' + tooltext + '</md-tooltip>');
        }
    };
}
]);

pdapp.controller('explainerCtrl', ['$scope', '$rootScope', '$log', '$mdDialog', '$mdBottomSheet', function(scope, rootScope, log, mdDialog, mdBottomSheet) {
    
    scope.showexplainer = function(url) {
        mdBottomSheet.show({
            templateUrl: basepartialurl + url,
            controller: 'defaultPopupCtrl',
        }).then(function(topic) {
        }
        );
    }

}
]);

pdapp.controller('statementsheetCtrl', ['$scope', '$rootScope', '$log', '$mdDialog', '$mdBottomSheet', 
function(scope, rootScope, log, mdDialog, mdBottomSheet) {
    
    scope.querymatches = function(event, statement) {
        statementService.info({
            statementid: statement.id
        }, function(response) {
            scope.info = response["statementinfo"];
        }
        );
    }
    
    scope.$on('statementchange', scope.querymatches);
    
    scope.loaded = function() {
        rootScope.subscribeupdates('generatestatementupdate');
    }

}
]);

pdapp.directive('pdExplainer', ['$compile', '$log', function(compile, log) {
    return {
        replace: false,
        restrict: 'A',
        link: function(scope, element, attr) {
            var src = attr["pdExplainer"];
            if (_.has(attr, "pdInclude") || src.trim() == "")
                return;
            var location = "left:3px; top:2px";
            if (_.has(attr, "pdExplainerLocation")) {
                var lp = attr["pdExplainerLocation"];
                if (lp == "top-left")
                    location = "left:3px; top:2px";
                if (lp == "top-right")
                    location = "right:3px; top:2px";
                if (lp == "bottom-left")
                    location = "left:3px; bottom:2px";
                if (lp == "bottom-right")
                    location = "right:3px; bottom:2px";
            }
            var html = '<a style="position:absolute;z-index:10;overflow:hidden;' + location + '" class="md-padding helpiconouter" ';
            html += 'ng-click="showexplainer(\'' + src + '\')" class="helpicon"><i class="fa fa-question-circle" style="padding:0px;font-size:20px"></i></a>';
            element.prepend(html);
            compile(element.contents())(scope);
        },
        controller: 'explainerCtrl',
    };
}
]);

pdapp.directive('pdImg', ['$compile', '$log', function(compile, log) {
    return {
        replace: false,
        restrict: 'E',
        transclude: false,
        link: function(scope, element, attr) {
            var src = attr["src"];
            var style = _.has(attr, "style") ? attr["style"] : "";
            var automargin = (_.has(attr, "pdMarginauto")) ? (attr["pdMarginauto"] == "true") : true;
            if (automargin)
                element.css({
                    display: 'block',
                });
            var neededratio = _.has(attr, "aspectRatio") ? parseFloat(attr["aspectRatio"]) : _.has(attr, "neededRatio") ? parseFloat(attr["neededRatio"]) 
            : 0.5747126;
            if (_.has(attr, "ngSrc"))
                src = attr["ngSrc"];
            if (_.has(attr, "pdSrc"))
                src = attr["pdSrc"];
            var overlaysrc = _.has(attr, "pdOverlay") ? attr["pdOverlay"] : "";
            var fillup = _.has(attr, "pdFill");
            var overlayshrink = _.has(attr, "pdOverlayShrink") ? attr["pdOverlayShrink"] : "100";
            var overlaytop = _.has(attr, "pdOverlayTop") ? attr["pdOverlayTop"] : "0";
            if (_.isUndefined(src))
                return;
            if (src.indexOf("/") == -1)
                src = baseimgurl + 'img/' + src;
            if (overlaysrc.indexOf("/") == -1)
                overlaysrc = baseimgurl + 'img/' + overlaysrc;
            if (_.has(attr, "pdImgDefault")) {
                element.on('error', function() {
                    element[0].src = attr.fallbackSrc ? attr.fallbackSrc : attr["pdImgDefault"];
                }
                );
            }
            var naturalWidth = _.parseInt(attr["naturalWidth"]);
            var naturalHeight = _.parseInt(attr["naturalHeight"]);
            var ratio = naturalHeight / naturalWidth;
            var downwidth = neededratio / ratio;
            var padoverlay = (100 - _.parseInt(overlayshrink)) / 2;
            var pad = fillup ? 0 : (100 - 100 * downwidth) / 2;
            if (downwidth > 1.0)
                downwidth = 1.0;
            if ((strEndsWith(src, ".png") || strEndsWith(src, ".jpg")) && (!_.isUndefined(cssua.ua.ie) || !_.isUndefined(cssua.ua.firefox))) {
                var html = '<div style="">';
                html += '<div style="position: relative; padding-bottom: ' + (neededratio * 100) 
                + '%; padding-top: 0px; height: 0; margin:0px auto; overflow: hidden; margin-left:' + pad + '%; margin-right:' + pad + '%">';
                html += '<img src="' + src + '" pd-img-default="' + attr["pdImgDefault"] + '" style="position: absolute; top:0; left:0; height:100%; width:100%;"></img>';
                if (_.has(attr, "pdOverlay")) {
                    html += '<div style="width: 100%; height:100%; position: absolute; top: 0; left: 0;z-index: 1; padding:' + overlaytop + '% ' 
                    + (padoverlay) + '% 0px">';
                    html += '<div style="margin:auto; height:100%; width:' + (100 * downwidth) + '%"><img src="' + overlaysrc + '"></img></div>';
                    html += '</div>';
                }
                html += '</div></div>';
            } else {
                html = '<div style="position:relative; padding-bottom: ' + (neededratio * 100) 
                + '%; padding-top: 0px; height: 0; margin:0px auto; overflow: hidden; margin-left:' + pad + '%; margin-right:' + pad + '%">';
                html += '<img src="' + src + '" pd-img-default="' + attr["pdImgDefault"] + '" style="position: absolute; top:0; left:0; height:100%; width:100%;"></img>';
                var transformstylehack = ";-webkit-transform: translate3d(0, 0, 0);-moz-transform: translate3d(0, 0, 0);-ms-transform: translate3d(0, 0, 0);transform: translate3d(0, 0, 0);";
                if (_.has(attr, "pdOverlay")) {
                    html += '<div style="width: 100%; height:100%; ' + transformstylehack + ' position: absolute; top: 0; left: 0;z-index: 1; padding:' 
                    + overlaytop + '% ' + (padoverlay) + '% 0px">';
                    html += '<div style="margin:auto; height:100%; width:' + (100 * downwidth) + '%"><img src="' + overlaysrc + '"></img></div>';
                    html += '</div';
                }

                html += '</div>';
            }
            element.append(html);
            compile(element.contents())(scope);
        }
    }
}
]);

pdapp.directive('pdBadge', ['$compile', '$log', 'pdTopicService', '$sce', '$rootScope', '$mdDialog', 'ShareService', 
function(compile, log, pdTopicService, sce, rootScope, mdDialog, shareService) {
    return {
        replace: true,
        scope: {
            badge: '=badge'
        },
        templateUrl: basepartialurl + "badge.html",
        link: function(scope, element, attr) {
            scope.ascard = _.has(attr, "ascard");
            scope.baseimgurl = baseimgurl;
            scope.defaultimage = pdTopicService.defaultimage;
            scope.topicimg = function(w, h) {
                return pdTopicService.topicimg(pdTopicService.idtotopics[scope.badge.topic], w, h);
            }
            scope.trophyimg = function() {
                return rootScope.trophyimg;
            }
            scope.ascardlayout = function() {
                scope.ascard ? "row" : ""
            }
            scope.sharebadge = function(provider) {
                rootScope.loadimage(scope.img(653, 380), function(backimg) {
                    var dataurl = generatebadgejpg(scope.header(), scope.message(), backimg, scope.trophyimg());
                    var msg = scope.sharetext();
                    var url = scope.backlink();
                    if (provider == 'fb')
                        shareService.sendtofb(msg, url, dataurl, {});
                    if (provider == 'tw')
                        shareService.sendtotw(msg, url, dataurl, {});
                }
                )
            }
            scope.backlink = function() {
                var m = "/getyourpositiondial/$shareid$/-/-1/-/-1/-";
                if (scope.badge.typ == "TOPICCOMPLETE")
                    if (_.has(pdTopicService.idtotopics, scope.badge.topic))
                        m = "/getyourpositiondial/$shareid$/-/" + scope.badge.topic + "/" + makesafelink(pdTopicService.idtotopics[scope.badge.topic].name) + "/-1/-";
                if (scope.badge.typ == "CHANNELLEVELCOMPLETE") {
                    if (scope.badge.client == 6)
                        m = "/ifiwereinparliament/$shareid$/-/-1/-";
                    if (scope.badge.client == 8)
                        m = "/election2015/$shareid$/-/-1/-";
                }
                if (scope.badge.typ == "NBADGES")
                    m = "/all/$shareid$/-/-1/-";
                if (scope.badge.typ == "TRENDINGCOMPLETE")
                    m = "/trendingstatements/$shareid$/-/-1/-/-1/-";
                return m;
            }
            scope.message = function() {
                var m = "";
                if (scope.badge.typ == "TOPICCOMPLETE")
                    if (_.has(pdTopicService.idtotopics, scope.badge.topic))
                        m = pdTopicService.idtotopics[scope.badge.topic].name;
                if (scope.badge.typ == "CHANNELLEVELCOMPLETE") {
                    if (scope.badge.client == 6)
                        m = "If I were in Parliament";
                    if (scope.badge.client == 8)
                        m = "Election 2015";
                }
                if (scope.badge.typ == "NBADGES")
                    m = scope.badge.count + " Position Responses";
                if (scope.badge.typ == "TRENDINGCOMPLETE")
                    m = "Trending Statements";
                return m;
            }
            scope.sharetext = function() {
                var m = "";
                if (scope.badge.typ == "TOPICCOMPLETE")
                    m = "I completed Level " + (scope.badge.level + 1) + " on @PositionDial";
                if (_.has(pdTopicService.idtotopics, scope.badge.topic))
                    m += " " + hashtagit(pdTopicService.idtotopics[scope.badge.topic].name);
                m += " - see how we match: ";
                if (scope.badge.typ == "CHANNELLEVELCOMPLETE") {
                    if (scope.badge.client == 6)
                        m = "I completed Level " + (scope.badge.level + 1) + " on the @PositionDial 'if I were in Parliament' game - see how we match: ";
                    if (scope.badge.client == 8)
                        m = "I completed Level " + (scope.badge.level + 1) + " on the @PositionDial Election 2015 game - see how we match: ";
                }
                if (scope.badge.typ == "NBADGES")
                    m = "I completed " + scope.badge.count + " Position Responses on @PositionDial - see how we match:";
                if (scope.badge.typ == "TRENDINGCOMPLETE")
                    m = "I completed todays trending statements on @PositionDial - see how we match:";
                return m;
            }
            scope.header = function() {
                var m = "";
                if (scope.badge.typ == "TOPICCOMPLETE" && scope.badge.isGameCompleted != undefined && scope.badge.isGameCompleted == true)
                {
                    m = "Complete"; 
                }
                else if (scope.badge.typ == "TOPICCOMPLETE")
                {
                    m = "Level " + (scope.badge.level + 1) + " Complete";
                }
                if (scope.badge.typ == "CHANNELLEVELCOMPLETE" && scope.badge.isGameCompleted != undefined && scope.badge.isGameCompleted == true)
                {
                    m = "Complete"; 
                }
                else if (scope.badge.typ == "CHANNELLEVELCOMPLETE")
                {
                    m = "Level " + (scope.badge.level + 1) + " Complete";
                }    
                if (scope.badge.typ == "NBADGES")
                    m = (scope.badge.count) + " Kleos";
                if (scope.badge.typ == "TRENDINGCOMPLETE")
                    m = "For " + d3.time.format(' %d %B %H:00 ')(new Date(scope.badge.fortime));
                return m;
            }
            scope.img = function(w, h) {
                var m = baseimgurl + "img/white.png";
                if (scope.badge.typ == "TOPICCOMPLETE")
                    m = scope.topicimg(w, h);
                if (scope.badge.typ == "CHANNELLEVELCOMPLETE")
                    m = baseimgurl + "img/parliament.jpg";
                if (scope.badge.typ == "NBADGES")
                    m = baseimgurl + "img/white.png";
                if (scope.badge.typ == "TRENDINGCOMPLETE")
                    m = baseimgurl + "img/white.png";
                return m;
            }
            scope.timestamptext = function() {
                return d3.time.format(' %d %b %H:00 ')(new Date(scope.badge.time))
            }
        }
    }
}
]);

pdapp.directive('pdDial', [function() {
    return {
        restrict: 'E',
        scope: {
            hidelevels: "@",
            hidebreadcrumbs: "@",
            clientid: "=",
            emptyimage: "@",
            emptytarget: "@",
            emptytext: "=",
            emptytextbroadcast: "@",
            caption: "=",
            captiontarget: "=",
            captionfunction: "&?",
            dialtype: "@",
            dialwait: "@",
            diallock: "=",
            toplevelonly: "=",
            smallsidebyside: "=",
            dialid: "=",
            topic: "=",
            trending: "="
        },
        templateUrl: basepartialurl + 'dialview.html',
        controller: ['$scope', '$location', '$rootScope', function(scope, location, rootScope) {
            
            scope.hidelevels = _.isUndefined(scope.hidelevels) ? false : scope.hidelevels.toLowerCase() == "true";
            scope.hidebreadcrumbs = _.isUndefined(scope.hidebreadcrumbs) ? false : scope.hidebreadcrumbs.toLowerCase() == "true";
            scope.dialwait = _.isUndefined(scope.dialwait) ? false : scope.dialwait.toLowerCase() == "true";
            
            scope.hascaption = function() {
                return !_.isUndefined(scope.captiontarget);
            }
            
            scope.gocaption = function() {
                if (!_.isUndefined(scope.captiontarget) && scope.captiontarget != 'function')
                    location.url(scope.captiontarget);
                else if (!_.isUndefined(scope.captionfunction))
                    scope.captionfunction();
            }
            
            scope.issidebysidewhensmall = function() {
                return _.isUndefined(scope.smallsidebyside) || scope.smallsidebyside;
            }
            
            scope.fireshare = rootScope.fireshare;
            
            if (_.isUndefined(scope.emptyimage))
                scope.emptyimage = "getyourPositionDial_vsimple.png";
            if (scope.emptyimage.indexOf("/") == -1)
                scope.emptyimage = baseimgurl + 'img/' + scope.emptyimage;
            if (_.isUndefined(scope.emptytarget))
                scope.emptytarget = "/getyourpositiondial/-1/-/-1/-";
            
            if (_.isUndefined(scope.dialid))
                scope.dialid = -1;
            if (_.isUndefined(scope.dialtype))
                scope.dialtype = "visitor";
        }
        ],
    }
}
]);

var dialinstancecounter = 1;

pdapp.directive('pdDialSvg', [
'$compile', 
'$window', 
'$log', 
'$rootScope', 
'ShareService', 
function(compile, window, log, rootScope, shareService) {
    return {
        restrict: "E",
        replace: true,
        transclude: true,
        controller: 'dialDirectiveCtrl',
        link: function(scope, element) {
            log.info("linking dial");
            dialinstancecounter += 1;
            scope.dialwidgetid = "dialwidget" + dialinstancecounter;
            var template = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' 
            + 'style="border: 0px solid #000000" viewBox="0 0 150 90" id="' + scope.dialwidgetid + '"></svg>';
            element.html(template);
            compile(element.contents())(scope);
            scope.dialroot = d3.select(element[0].children[0]);
            if (!_.isUndefined(scope.$parent.clientid))
                scope.clientid = scope.$parent.clientid;
            if (!_.isUndefined(scope.$parent.topic))
                scope.topic = scope.$parent.topic;
            if (!_.isUndefined(scope.$parent.dialtype))
                scope.dialtype = scope.$parent.dialtype;
            if (!_.isUndefined(scope.$parent.dialid))
                scope.dialid = scope.$parent.dialid;
            if (!_.isUndefined(scope.$parent.showall))
                scope.showall = scope.$parent.showall;
            if (!_.isUndefined(scope.$parent.dialwait))
                scope.dialwait = scope.$parent.dialwait;
            if (!_.isUndefined(scope.$parent.diallock))
                scope.diallock = scope.$parent.diallock;
            if (!_.isUndefined(scope.$parent.trending))
                scope.diallock = scope.$parent.trending;
            if (!_.isUndefined(scope.$parent.toplevelonly))
                scope.toplevelonly = scope.$parent.toplevelonly;
            if (_.isUndefined(scope.dialtype))
                scope.dialtype = "visitor";
            if (scope.dialtype == 'visitor' && scope.dialid == -1)
                rootScope.$broadcast('vistordialelemid', scope.dialwidgetid);
            
            scope.loaded();
        }
    }
}
]);

pdapp.directive('pdInclude', [
'$q', 
'$timeout', 
'$compile', 
'$window', 
'$log', 
function(q, timeout, compile, window, log) {
    
    var linker = function(scope, element, attrs) {
        var onload = "loaded()";
        var src = attrs["src"].replace("'", "").replace("'", "");
        var inherittemplate = "";
        if (_.has(attrs, "layout"))
            inherittemplate += " layout=\"" + attrs["layout"] + "\"";
        if (_.has(attrs, "layout-align"))
            inherittemplate += " layout-align=\"" + attrs["layout-align"] + "\"";
        if (_.has(attrs, "layout-fill"))
            inherittemplate += " layout-fill=\"" + attrs["layout-fill"] + "\"";
        if (_.has(attrs, "flex"))
            inherittemplate += " flex=\"" + attrs["flex"] + "\"";
        if (!_.has(attrs, "pdController")) {
            var template = "<ng-include src=\"'" + basepartialurl + src + "'\" " + inherittemplate + "></ng-include>";
            element.html(template);
            compile(element.contents())(scope);
            return;
        }
        if (_.has(attrs, "pdExplainer")) {
            scope.dialexplainer = attrs["pdExplainer"];
        }
        var controller = (attrs["pdController"] == "") ? src.split(".")[0] : attrs["pdController"];
        controller = controller.replace("Ctrl", "");
        var init = attrs["pdInit"];
        var template = "<ng-include src=\"'" + basepartialurl + src + "'\" ng-controller=\"" + controller + "Ctrl\" " + "ng-init=\"" + init 
        + ";stateParams=stateParams\" onload=\"" + onload + "\" " + inherittemplate + "></ng-include>";
        
        window.scriptloader((basejsurl + controller + jsext).toLowerCase(), function() {
            log.info("subloaded " + controller + "Ctrl");
            element.html(template);
            compile(element.contents())(scope);
        }
        );
    }
    
    return {
        restrict: 'A',
        transclude: true,
        link: linker,
    }

}
]);

pdapp.directive('pdDisabled', function() {
    return {
        
        link: function(scope, elem, attr) {
            var color = elem.css('color')
            , textDecoration = elem.css('text-decoration')
            , cursor = elem.css('cursor')
            , currentValue = !!scope.$eval(attr.myDisabled)
            , current = elem[0]
            , next = elem[0].cloneNode(true);
            
            var nextElem = angular.element(next);
            
            nextElem.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            );
            
            nextElem.css('color', 'gray');
            nextElem.css('cursor', 'not-allowed');
            nextElem.attr('tabindex', -1);
            
            scope.$watch(attr.pdDisabled, function(value) {
                // double negation for non-boolean attributes e.g. undefined
                value = !!value;
                
                if (currentValue != value) {
                    currentValue = value;
                    current.parentNode.replaceChild(next, current);
                    var temp = current;
                    current = next;
                    next = temp;
                }
            
            }
            )
        }
    }
}
);


pdapp.directive('pdMatches', [
'ClientService', 
'pdTopicService', 
function(clientService, topicService) {
    return {
        restrict: 'E',
        scope: {
            matchtype: "@",
            matches: "=",
            highlight: "@",
            channel: "@",
            data: "=",
            activematch: "=",
            guessmatch: "=",
            clientid: "=",
            trending: "=",
            topicid: "=",
            hasdetail: "=?",
            activatefn: "&?activate"
        },
        templateUrl: basepartialurl + "matchesaggregated.html",
        controller: [
        '$scope', 
        '$location', 
        '$rootScope', 
        '$element',
        '$timeout',
        function(scope, location, rootScope, element, timeout) {
            scope.friendshare = function(provider) {
                rootScope.fireshare(scope.channel, provider);
            }
            
            if (_.isUndefined(scope.hasdetail))
                scope.hasdetail = true;
            
            scope.gotodetailtarget = function() {
                if (scope.matchtype == 'party') {
                    location.url('/matchparty');
                }
                if (scope.matchtype == 'authormp')
                    location.url('/matchmp');
                if (scope.matchtype == 'friend') {
                    location.url(friendlink());
                }
            }
            
            scope.cssua = rootScope.cssua;

            scope.defaultimage = imgconfig[scope.matchtype].default;
            
            scope.activatelink = function(a) {
                if ("true" == scope.highlight)
                    scope.activematch = a;
                if (scope.matchtype == 'party') {
                    location.url('/party/-1/-/' + a.id + '/' + makesafelink(a.name));
                }
                if (scope.matchtype == 'org') {
                    location.url('/brandprofile/-1/-/' + a.id + '/' + makesafelink(a.name));
                }
                if (scope.matchtype == 'authorstatement')
                  	location.url('/author/-1/-/' + a.id + '/' + makesafelink(a.name));
                if (scope.matchtype == 'authormp')
                    location.url('/mp/-1/-/' + a.id + '/' + makesafelink(a.name));
                if (scope.matchtype == 'authorppc') {
                    location.url('/politician/-1/-/' + a.id + '/' + makesafelink(a.name));
                }
                if (scope.matchtype == 'friend') {
                    location.url(friendlink(a));
                }
            }
            
            scope.activate = _.isUndefined(scope.activatefn()) ? scope.activatelink : scope.activatefn();
            
            var friendlink = function(a) {
                var url = '/matchfriend';
                url += (_.isUndefined(scope.clientid) || ("" + scope.clientid) == "-1") ? ("/-1/-") 
                : ("/" + scope.clientid + "/" + makesafelink(clientService.idtoclients[scope.clientid].name));
                url += (_.isUndefined(scope.trending) || ("" + scope.trending) == "-1") ? ("/-1/-") : ("/" + scope.trending + "/trending");
                url += (_.isUndefined(scope.topicid) || ("" + scope.topicid) == "-1") ? ("/-1/-") 
                : ("/" + scope.topicid + "/" + makesafelink(topicService.idtotopics[scope.topicid].name));
                if (_.isUndefined(a))
                    a = {
                        id: -1,
                        name: "-"
                    };
                url += '/' + a.id + '/' + makesafelink(a.name);
                return url;
            }
        
            scope.isscrolling = false;   
            var scrolltimer = timeout(function() {},0);
            var scrolltarget = element;
            var scrolltarget = angular.element(scrolltarget[0].children[0]);
            var scrolltarget = angular.element(scrolltarget[0].children[0]);

            var scrollfn = function(event){
                timeout.cancel(scrolltimer);
      		    scrolltimer = timeout(function() {
      			    scope.isscrolling = false;
               		rootScope.$broadcast("touchscrollended");
      		    }, 1000);
            	if(scope.isscrolling)
            		return;
            	scope.isscrolling = true;
            	rootScope.$broadcast("touchscrollstarted");
            };

            scope.$on('$destroy', scrolltarget.bind("scroll",scrollfn));

        }
        ],
    }
}
]);


pdapp.directive('pdMainWidth', ['$log', '$rootScope', '$timeout', function(log, rootScope, timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            var pagewidth = function(force) {
                var w = element[0].clientWidth;
                if (w > 0 && (this.lastw != w || force))
                    rootScope.$broadcast("mainviewwidthchanged", w);
                this.lastw = w;
            }
            ;
            rootScope.$on("mainwidthrequest", pagewidth(true));
            var pagewidthschedule = function() {
                pagewidth();
                timeout(pagewidthschedule, 200);
            }
            timeout(pagewidthschedule, 100);
        }
    }
}
]);
