pdapp.service("MatchService", ['$rootScope', '$timeout', '$log', '$location', 'ShareService', '$q', '$state', 'routeConfig', 'StatsService', 'DataCacheService', function(rootScope, timeout, log, location, shareService, q, state, routeConfig, statsService, dataCacheService) {
  var authormatches = [];
  var partymatches = [];
  var visitormatches = [];
  var visitoraggmatches = [];
  var topicid = -1;
  var brandmatches = [];
  var MAXMATCHES = 24;
  var MAXDISPLAY = 24;
  var lastddummyid = 0;
  var makeeveryoneentitysummarypromise = function() {
    var defer = q.defer();
    defer.resolve({
      id: lastddummyid++,
      name: "everyone"
    });
    return defer.promise;
  };
  var querymatches = function(query) {
    var entitytype = statsService.mapentitytypes(query.matchtype);
    var matchtype = statsService.mapmatchtypes(query.matchtype);
    var entitysummaryfetcher = dataCacheService.getsummarycache(entitytype);
    console.log(matchtype + " direct matches refreshing then fetching " + entitytype);
    var defer = q.defer();
    query["maxn"] = MAXMATCHES;
    query["matchtype"] = matchtype;
    statsService.query("posmeanentitymatches", query).then(function(res) {
      var amatches = _.take(res["matches"], MAXDISPLAY);
      if (entitytype != "visitoragg")
        entitysummaryfetcher.prefetch(_.map(amatches, 0));
      var entitypromises = [];
      angular.forEach(amatches, function(e) {
        var promise = null;
        if (entitytype == "visitoragg")
          promise = makeeveryoneentitysummarypromise();
        else
          promise = entitysummaryfetcher.getfuture(e[0]);
        this.push(promise);
      }, entitypromises);
      q.all(entitypromises).then(function(res) {
        var matches = [];
        var topmatch = null;
        for (var i = 0; i < res.length; i++) {
          var nmatch = res[i];
          nmatch.matchpc = 100 * amatches[i][1];
          var match = formatentity(entitytype, nmatch);
          if (match == null)
            continue;
          if (topmatch == null || topmatch.match < match.match)
            topmatch = match;
          matches.push(match);
        }
        log.info("broadcasting updated matches");
        defer.resolve({
          matches: matches,
          topmatch: topmatch
        });
        rootScope.$broadcast('matcheschange', query);
      });
    }, function(error) {
      defer.resolve(null)
    });
    return defer.promise;
  };
  var formatentity = function(entitytype, e) {
    var m = null;
    if (!_.isNull(e["matchpc"])) {
      m = (e["matchpc"].toFixed(0));
      if (m > 99)
        m = 100;
      if (m < -99)
        m = -100;
    }
    var name = e["name"];
    if (name == null || name == "")
      if (entitytype == 'visitor' || entitytype == 'friend')
        name = "Your friend";
      else
        return null;
    if (entitytype == 'authormp')
      name = name.replace(" MP", "");
    var twitter = e["twitter"]
    if (twitter == null)
      twitter = "";
    var pic = (_.isUndefined(e["pic"]) || _.isNull(e["pic"])) ? (imgconfig[entitytype].default) : (imgconfig[entitytype].base + e["pic"]);
    var categorys = (_.isUndefined(e["categorys"]) || _.isNull(e["categorys"])) ? [] : e["categorys"];
    var match = {
      "idx": this.length,
      "id": e["id"],
      "name": name,
      "pic": pic,
      "twitter": twitter,
      "categorys": categorys,
      "match": (m == null) ? -100 : _.parseInt(m),
      "matchpc": (m == null) ? null : m + "%"
    };
    return match;
  }
  this.querymatches = querymatches;
  this.gomatch = function(match, deststate) {
    var to = "/" + deststate + "/-1/-/" + e["id"] + "/" + makesafelink(e["name"]);
    location.url(to);
  }
  this.refreshmatches = function() {
    return;
    querymatches({
      matchtype: "author",
      clientid: 6
    }).then(function(matches) {
      authormatches = matches
    });
    querymatches({
      matchtype: "org",
      clientid: 10
    }).then(function(matches) {
      brandmatches = matches
    });
    querymatches({
      matchtype: "party",
      clientid: 8
    }).then(function(matches) {
      partymatches = matches
    });
    querymatches({
      matchtype: "visitor"
    }).then(function(matches) {
      visitormatches = matches
    });
    querymatches({
      matchtype: "visitoragg",
      trending: true
    }).then(function(matches) {
      visitoraggmatches = matches
    });
  }
  var goingtorefresh = false;
  var refreshmatchfn = this.refreshmatches;
  var updatematches = function() {
    if (goingtorefresh) {
      return;
    }
    timeout(refreshmatchfn, 120000);
    goingtorefresh = true;
  }
  rootScope.$on('progressupdate', function(event, dialtype, dialid, complexity, reactionlevelprogress) {
    updatematches();
  });
  rootScope.$on('statementchange', function(event, statement) {
    log.info("matchservice statementchange");
    updatematches();
  });
  rootScope.$on('topicchange', function(event, topic) {
    log.info("matchservice topicchange");
    topicid = topic.id;
    updatematches();
  });
  rootScope.$on('topicchange', function(event, topic) {
    log.info("matchservice topicchange");
    topicid = topic.id;
    updatematches();
  });
  this.sendtoppartymatchtotw = function(partymatch) {
    rootScope.loadimage(partymatch.pic, function(img) {
      var pngdataurl = generatematchpng(partymatch.name, img, partymatch.matchpc, rootScope.logoimg);
      var msg = "My top matched party is " + partymatch.name + " " + partymatch.twitter + " - What's yours? @PositionDial";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtotw(msg, url, pngdataurl, {
        match: partymatch
      });
    });
  }
  this.sendtoppartymatchtofb = function(partymatch) {
    rootScope.loadimage(partymatch.pic, function(img) {
      var pngdataurl = generatematchpng(partymatch.name, img, partymatch.matchpc, rootScope.logoimg);
      var msg = "My top matched party is " + partymatch.name + " - What's yours?";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtofb(msg, url, pngdataurl, {
        match: partymatch
      });
    });
  }
  this.sendtopppcmatchtotw = function(match) {
    rootScope.loadimage(match.pic, function(img) {
      var pngdataurl = generatematchpng(match.name, img, match.matchpc, rootScope.logoimg);
      var msg = "My top #GE2015 candidate match is " + match.name + " " + match.twitter + " - What's yours? @PositionDial";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtotw(msg, url, pngdataurl, {
        match: match
      });
    });
  }
  this.sendtopppcmatchtofb = function(match) {
    rootScope.loadimage(match.pic, function(img) {
      var pngdataurl = generatematchpng(match.name, img, match.matchpc, rootScope.logoimg);
      var msg = "My top candidate match is " + match.name + " - What's yours?";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtofb(msg, url, pngdataurl, {
        match: match
      });
    });
  }
  this.sendppcmatchtotw = function(match) {
    rootScope.loadimage(match.pic, function(img) {
      var pngdataurl = generatematchpng(match.name, img, match.matchpc, rootScope.logoimg);
      var msg = "My #GE2015 candidate match with " + match.name + " " + match.twitter + " - What's yours? @PositionDial";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtotw(msg, url, pngdataurl, {
        match: match
      });
    });
  }
  this.sendppcmatchtofb = function(match) {
    rootScope.loadimage(match.pic, function(img) {
      var pngdataurl = generatematchpng(match.name, img, match.matchpc, rootScope.logoimg);
      var msg = "My candidate match with " + match.name + " - What's yours?";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtofb(msg, url, pngdataurl, {
        match: match
      });
    });
  }
  this.sendpartymatchtotw = function(partymatch) {
    rootScope.loadimage(partymatch.pic, function(img) {
      var pngdataurl = generatematchpng(partymatch.name, img, partymatch.matchpc, rootScope.logoimg);
      var msg = "My party match with " + partymatch.name + " " + partymatch.twitter + " - What's yours? @PositionDial";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtotw(msg, url, pngdataurl, {
        match: partymatch
      });
    });
  }
  this.sendpartymatchtofb = function(partymatch) {
    rootScope.loadimage(partymatch.pic, function(img) {
      var pngdataurl = generatematchpng(partymatch.name, img, partymatch.matchpc, rootScope.logoimg);
      var msg = "My party match with " + partymatch.name + " - What's yours?";
      var url = "/election2015/$shareid$/-/-1/-";
      shareService.sendtofb(msg, url, pngdataurl, {
        match: partymatch
      });
    });
  }
  this.sendtopmpmatchtotw = function(mpmatch) {
    rootScope.loadimage(mpmatch.pic, function(img) {
      var pngdataurl = generatematchpng(mpmatch.name, img, mpmatch.matchpc, rootScope.logoimg);
      var msg = "My top matched MP is " + mpmatch.name + " " + mpmatch.twitter + " - What's yours? @PositionDial";
      var url = "/ifiwereinparliament/$shareid$/-/-1/-";
      shareService.sendtotw(msg, url, pngdataurl, {
        match: mpmatch
      });
    });
  }
  this.sendtopmpmatchtofb = function(mpmatch) {
    rootScope.loadimage(mpmatch.pic, function(img) {
      var pngdataurl = generatematchpng(mpmatch.name, img, mpmatch.matchpc, rootScope.logoimg);
      var msg = "My top matched MP is " + mpmatch.name + " " + mpmatch.twitter + " - Who's yours?";
      var url = "/ifiwereinparliament/$shareid$/-/-1/-";
      shareService.sendtofb(msg, url, pngdataurl, {
        match: mpmatch
      });
    });
  }
  this.sendppcencourage = function(mpmatch) {
    rootScope.loadimage(baseimgurl + "img/tweetsharenologo.jpg", function(img) {
      var pngdataurl = generateppcjpg("The #bigppcquiz on @PositionDial for #GE2015", rootScope.logosymbolimg, img);
      var msg = "Dear " + mpmatch.twitter + " please take the #bigppcquiz so we can match @PositionDial";
      var url = location.url();
      shareService.sendtotw(msg, url, pngdataurl, {
        match: mpmatch
      });
    });
  }
  this.sendtrendingmatchtotw = function(trendmatch) {
    rootScope.loadimage(trendmatch.pic, function(img) {
      var pngdataurl = generatematchpng(trendmatch.name, img, trendmatch.matchpc, rootScope.logoimg);
      var msg = "I matched today's trend by " + trendmatch.matchpc + " - What's yours? @PositionDial";
      var url = "/ifiwereinparliament/$shareid$/-/-1/-";
      shareService.sendtotw(msg, url, pngdataurl, {
        match: trendmatch
      });
    });
  }
  this.sendtrendingmatchtofb = function(trendmatch) {
    rootScope.loadimage(trendmatch.pic, function(img) {
      var pngdataurl = generatematchpng(trendmatch.name, img, trendmatch.matchpc, rootScope.logoimg);
      var msg = "I matched today's trend by " + trendmatch.matchpc + " - What's yours?";
      var url = "/ifiwereinparliament/$shareid$/-/-1/-";
      shareService.sendtofb(msg, url, pngdataurl, {
        match: trendmatch
      });
    });
  }
  rootScope.$on('matchchange', function(event, matchId, matchName) {
    var parts = location.url().split('?')[0].split('/');
    var stateName = parts[1];
    var configRouteParts = routeConfig[stateName].path.split("/");
    if (_.contains(configRouteParts, ":matchId")) {
      var pathIndex = _.indexOf(configRouteParts, ":matchId");
      parts[pathIndex] = "" + matchId
      parts[pathIndex + 1] = makesafelink(matchName);
    }
    var newurl = parts.join("/");
    location.url(newurl).replace();
  });
}
]);
pdapp.service("ComparisonService", ["ComparisonServerService", "StatsService", "pdTopicService", "$q", function(comparisonServerService, statsService, topicService, q) {
  var querycomparisons = function(query) {
    var entitytype = statsService.mapentitytypes(query.matchtype);
    var matchtype = statsService.mapmatchtypes(query.matchtype);
    console.log(matchtype + " direct comparison then fetching " + entitytype);
    query["matchtype"] = matchtype;
    var defer = q.defer();
    var processComparisons = function(response) {
      var res = response;
      var comparisons = [];
      angular.forEach(res["comparison"], function(e, k) {
        var m = (e["matchpc"] * 100).toFixed(0);
        if (m > 99)
          m = 100;
        if (m < -99)
          m = -100;
        if (!_.has(topicService.idtotopics, e.topic))
          return;
        var t = topicService.idtotopics[e.topic];
        var match = {
          "matchpc": m + "%",
          "match": m,
          "topic": t
        };
        if (_.has(e, "sourceentity"))
          match["statements"] = e["sourceentity"];
        if (query.filternomatch && e["matchpc"] == 0)
          return;
        if (query.filtertooriginaltopic && e["originaltopic"] != e["topic"])
          return;
        this.push(match);
      }, comparisons);
      defer.resolve(comparisons);
    };
    statsService.query("comparebetweenvisitorandentity", query).then(processComparisons, function(error) {
      defer.reject(null);
    });
    return defer.promise;
  }
  this.querycomparisons = querycomparisons;
}
]);
