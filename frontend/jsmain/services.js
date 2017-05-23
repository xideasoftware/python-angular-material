
pdapp.service('PartyService', ['CacheService', 'PartyServerService', '$q', function(cache, partyserverservice, q) {
    
    this.query = partyserverservice.query;
    var parties = [];
    var partymap = {};
    var defer = q.defer();
    
    this.list = function() {
        return defer.promise
    }
    
    partyserverservice.list({}, function(response) {
        angular.forEach(response["partys"], function(party) {
            this[party.id] = party;
        }
        , partymap);
        parties.push(partymap[2]);
        parties.push(partymap[3]);
        parties.push(partymap[4]);
        parties.push(partymap[8]);
        parties.push(partymap[32]);
        parties.push(partymap[7]);
        parties.push(partymap[11]);
        parties.push(partymap[34]);
        defer.resolve(parties);
    }
    );
    
    this.get = function(id) {
        return partymap[id];
    }
}
]);

pdapp.service('AxisService', ['CacheService', function(cache) {
    this.idtoaxis = cache.get("idtoaxis");
}
]);

pdapp.service('ClientService', ['ClientServerService', 'CacheService', function(clientServerService, cache) {
    this.query = clientServerService.query;
    this.idtoclients = {};
    angular.forEach(cache.get("clients"), function(v) {
        this[v.id] = {
            "topicids": v.topicids
        };
    }
    , this.idtoclients);
    if (_.has(this.idtoclients, 8))
        this.idtoclients[8]["name"] = "election2015";
    if (_.has(this.idtoclients, 6))
        this.idtoclients[6]["name"] = "ifiwereinparliament";
    if (_.has(this.idtoclients, 10))
        this.idtoclients[10]["name"] = "brandmatching";
}
]);

pdapp.service('pdTopicService', ['CacheService', function(cache) {
    this.idtotopics = cache.get("idtotopics");
    this.alltopics = {
        'id': -1,
        'name': 'All Topics'
    };
    this.baseimgurl = baseimgurl;
    
    this.topicimg = function(topic, width, height) {
        if (_.isNumber(topic) && _.has(this.idtotopics, topic))
            topic = this.idtotopics[topic];
        if (!(!_.isUndefined(topic) && !_.isNull(topic) && !_.isUndefined(topic.pic) && !_.isNull(topic.pic) && topic.pic.length > 2))
            return this.baseimgurl + 'img/defaultimages.png.' + width + '.' + height + '.png';
        return this.baseimgurl + 'topicimg/' + topic.pic + '.' + width + '.' + height + '.jpg';
    }
    
    this.defaultimage = function(width, height) {
        return this.baseimgurl + 'img/defaultimages.png.' + width + '.' + height + '.png';
    }
    
    this.topicnamefiltered = function(topic) {
        if (angular.isUndefined(topic))
            return "";
        if (_.isNumber(topic) && _.has(this.idtotopics, topic))
            topic = this.idtotopics[topic];
        return topic.name.split(" ").join("-");
    }
    
    this.gettopic = function(topic) {
        if (_.isNumber(topic) && _.has(this.idtotopics, topic))
            return this.idtotopics[topic];
        return null ;
    }
}
]);

pdapp.service('pdUserService', [function() {

}
]);

pdapp.service('ArticleService', ['CacheService', 'DataCacheService', 'pdTopicService', '$rootScope', 'StatsService', 'ArticleServerService',
				function(cache, dataCacheService, pdTopicService, rootScope, StatsService, articleService) {
    
    this.basepartialurl = basepartialurl;
    this.baseimgurl = baseimgurl;
    this.articleimgurl = articleimgurl;
    this.imgconfig = imgconfig;
    this.offsitelinks = {};
    
	this.query = articleService.query;
	
	var cache = dataCacheService.getsummarycache("article");
	
	this.prefetch = function(ids){cache.prefetch(ids)}

	this.getfuture = function(id){return cache.getfuture(id)}

    this.defaultimage = function(width, height) {
        return this.baseimgurl + 'img/defaultimages.png.' + width + '.' + height + '.png';
    }
    
    this.articleimgsizetopic = function(article, width, height, topic) {
        var validimglink = (angular.isDefined(article) && angular.isDefined(article.pic) && !_.isNull(article.pic) && article.pic.length > 2);
        if (_.has(article, "pictype") && validimglink) {
            if (validimglink) {
                if (article["pictype"] == "article")
                    return this.articleimgurl + article.pic + '.' + width + '.' + height + '.jpg';
                if (article["pictype"] == "source")
                    return this.baseimgurl + 'sourceimg/' + article.pic + '.' + width + '.' + height + '.jpg';
                if (article["pictype"] == "author")
                    return this.baseimgurl + 'authorimg/' + article.pic + '.' + width + '.' + height + '.jpg';
            
            }
        } 
        else {
            if (validimglink)
                return this.articleimgurl + article.pic + '.' + width + '.' + height + '.jpg';
            if (angular.isDefined(topic) && !_.isNull(topic))
                return pdTopicService.topicimg(topic, width, height);
        }
        
        return this.baseimgurl + 'img/defaultimages.png.' + width + '.' + height + '.png';
    }
    
    this.fixheadline = function(headline) {
        return headline.split("&amp;").join("&").replace(/[^\x00-\x7F]/g, "").trim();
    }
    
    this.makesafelink = makesafelink;
    
    this.overlayfor = function(article_id, w, h) {
        if (!_.isNumber(article_id))
            if (_.has(article_id, "article_id"))
                article_id = article_id["article_id"];
            else if (_.has(article_id, "id"))
                article_id = article_id["id"];
        var overlay = ''
        var inReadIt = _.has(rootScope.visitorreadarticles, article_id);
        var isOffsite = true;
        if (inReadIt && isOffsite)
            overlay = 'readitoffsite';
        else if (inReadIt)
            overlay = 'readit';
        else if (isOffsite)
            overlay = 'offsite';
        else
            overlay = 'blank';
        return baseimgurl + "img/" + overlay + 'overlay.png.' + w + '.' + h + '.png';
    }

    this.readarticle = function(article_id, resultfn, errorfn) {
        StatsService.publish("readmedia", { id : article_id }).then(resultfn, errorfn);
    }

	this.readarticles = function(query, resultfn, errorfn) {
		StatsService.query("readmediahistory",query).then(function(res){
			angular.forEach(res["media"], function(x){x.time=new Date(x.time)});
			resultfn(res);
			}, errorfn);
	};
}
]);

pdapp.service("BadgeService", ["BadgeServerService", "$rootScope", "$log", function(badgeServerService, rootScope, log) {
    
    this.awardtopicbadge = function(topicid, level, display) {
        log.info("Awarding TOPICCOMPLETE for " + topicid + " lvl " + level);
        badgeServerService.award({
            topicid: topicid,
            badgetype: 'TOPICCOMPLETE',
            level: level
        }, function(response) {
            var res = response;
            rootScope.$broadcast('awardedbadge', response['badge'], display);
        }
        );
    }

    this.awardtopicgamebadge = function(topicid, level, display) {
        log.info("Awarding Game Completed TOPICCOMPLETE for " + topicid + " lvl " + level);
        badgeServerService.award({
            topicid: topicid,
            badgetype: 'TOPICCOMPLETE',
            level: level
        }, function(response) {
            var res = response;
            res["badge"]["isGameCompleted"] = true;
            rootScope.$broadcast('awardedgamebadge', res["badge"], display);
        }
        );
    }
    this.awardchannelbadge = function(clientid, level, display) {
        log.info("Awarding CHANNELLEVELCOMPLETE for " + clientid + " lvl " + level);
        badgeServerService.award({
            clientid: clientid,
            badgetype: 'CHANNELLEVELCOMPLETE',
            level: level
        }, function(response) {
            var res = response;
            rootScope.$broadcast('awardedbadge', response['badge'], display);
        }
        );
    }
    this.awardchannelgamebadge = function(clientid, level, display) {
        log.info("Awarding Game CHANNELLEVELCOMPLETE for " + clientid + " lvl " + level);
        badgeServerService.award({
            clientid: clientid,
            badgetype: 'CHANNELLEVELCOMPLETE',
            level: level
        }, function(response) {
            var res = response;
            res["badge"]["isGameCompleted"] = true;
            rootScope.$broadcast('awardedgamebadge', res['badge'], display);
        }
        );
    }
    
    this.awardnbadge = function(count, display) {
        log.info("Awarding NBADGES for " + count);
        badgeServerService.award({
            badgetype: 'NBADGES',
            count: count
        }, function(response) {
            var res = response;
            rootScope.$broadcast('awardedbadge', response['badge'], display);
        }
        );
    }
    
    this.awardtrendbadge = function(fortime, display) {
        log.info("Awarding TRENDING for " + fortime);
        badgeServerService.award({
            badgetype: 'TRENDINGCOMPLETE',
            fortime: fortime
        }, function(response) {
            var res = response;
            rootScope.$broadcast('awardedbadge', response['badge'], display);
        }
        );
    }
}
])

pdapp.service("StatementService", [
"$q", 
"StatementServerService", 'DataCacheService',
"StatsService", "$location", "$rootScope", "$state", 'routeConfig', 'ClientService', '$log',
function(q, statementServerService, dataCacheService, statsService, location, rootScope, state, routeConfig, clientService, log) {
    this.query = statementServerService.query;
    this.info = statementServerService.info;
	
	var cache = dataCacheService.getsummarycache("statement");
	
	this.prefetch = function(ids){cache.prefetch(ids)}

	this.getfuture = function(id){return cache.getfuture(id)}

    this.vote = function(query, resultfn, errorfn) {
        statsService.publish("vote", query).then(function(res) {
            statsService.query("queryposition", query).then(function(res) {
                resultfn({
                    positions: res
                });
            });
        });
    }

	this.votehistory = function(resultfn, errorfn) {
		statsService.query("votehistory",{}).then(resultfn, errorfn);
	};
    
    this.suggest = statementServerService.suggest;

    this.drillvotes = function(query, resultfn, errorfn) {
    	var safequery = {dialtype : statsService.mapmatchtypes(query.dialtype), side:query.side};
		if(query.dialid > 0)
			safequery.dialid = query.dialid;
		if(query.topicid > 0)
			safequery.topicid = query.topicid;
		if(query.axisid > 0)
			safequery.axisid = query.axisid;
		if(query.clientid > 0)
			safequery.clientid = query.clientid;
		statsService.query("drillvotes",safequery).then(resultfn, errorfn);
	};

    this.drillstats = function(query, resultfn, errorfn) {
    	var safequery = {matchtype : statsService.mapmatchtypes(query.dialtype), side:query.side};
		if(query.dialid > 0)
			safequery.dialid = query.dialid;
		if(query.topicid > 0)
			safequery.topicid = query.topicid;
		if(query.axisid > 0)
			safequery.axisids = query.axisid;
		if(query.clientid > 0)
			safequery.clientid = query.clientid;
		statsService.query("drillvotetopiccount",safequery).then(resultfn, errorfn);
	};

    rootScope.$on('statementchange', function(event, statement) {
		    var params = _.cloneDeep(state.params);
		    rootScope.page.setTitle("see the different sides of the story - " + statement.text);
		    var parts = location.url().split('?')[0].split('/');
		    var stateName = parts[1];
		    var configRouteParts = routeConfig[stateName].path.split("/");
		    if (_.contains(configRouteParts, ":statementId")) {
			    var pathIndex = _.indexOf(configRouteParts, ":statementId");
			    parts[pathIndex] = "" + statement.id
			    parts[pathIndex + 1] = makesafelink(statement.text.substring(0, 100));
		    }
		    
		    var newurl = parts.join("/");
		    if (location.url().split('?').length > 1)
			    newurl += "?" + location.url().split('?')[1];
		    location.url(newurl).replace();
	    });

	    rootScope.gonewpathstatement = function(clientid, topic, trending, statement) {
		    var url = null;
		    if(_.isNumber(statement))
		    	statement = {id:statement, text:"-"}
		    var statementurl = _.isUndefined(statement)?"/-1/-":("/" + statement.id + "/" + makesafelink(statement.text));
		    if (!_.isUndefined(trending) && ("" + trending) != "-1")
			    location.url("/trendingstatements/-1/-/-1/-" +statementurl+ "?tab=1");
		    else if (!_.isUndefined(clientid) && ("" + clientid) != "-1")
			    location.url("/" + makesafelink(clientService.idtoclients[clientid].name) + "/-1/-" +statementurl+ "?tab=2");
		    else if (topic.id > -1)
			    location.url("/getyourpositiondial/" + topic.id + "/" + makesafelink(topic.name) + "/-1/-" +statementurl + "?tab=2");
		    else
			    location.url("/all/-1/-" +statementurl+ "?tab=1");
	    }

}
]);

