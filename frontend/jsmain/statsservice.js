
pdapp.service("StatsService", ["$resource", "$interval", "$q", "$log", "$http", "$location", "$cookies",
	function(resource, interval, q, log, http, location, cookies) {
    
    var requesttodefer = {};
    var reqnum = 0;
    var openattempt = 0;
    var MAXOPENINGS = 32;
    var PUBLISHTIMEOUT = 120;
    var QUERYTIMEOUT = 30;
    var OPENTIMEOUT = 30;
    var TOKENREFRESH = 300;
    var endpoint = statsserver;
		var disabled = location.protocol() == 'https';

  	var matchtypemap = {
  	  visitor: 'visitor',
      org: 'orgaction',
      author: 'authorstatement',
      authormp: 'authormotion',
      authorppc: 'authorselfie',
      party: 'partystatement',
      visitoragg: 'visitorstatementagg',
      campaign: 'campaignstatement'
    };

  	var entitytypemap = {
    	  authormotion: 'author',
        author: 'author',
        authormp: 'author',
        authorppc: 'author',
        authorselfie: 'author',
        orgaction: 'org',
        partystatement: 'party',
        visitorstatementagg: 'visitoragg',
        campaignstatement: 'campaign'
      };

    var tunnelstate = {
        primary: false,
        primaryws: null ,
        primaryendpoint: null,
    };

  	this.mapmatchtypes = function(matchtype){
		if(_.has(matchtypemap, matchtype))  
			return matchtypemap[matchtype];
		return matchtype;
  	}

  	this.mapentitytypes = function(entitytype){
  		if(_.has(entitytypemap, entitytype))  
  			return entitytypemap[entitytype];
  		return entitytype;
    	}

  	var sendauth = function() {
        log.debug("authorising websocket");
        data = {
            visitorid: _.parseInt(cookies.VISITOR_ID),
            accesskey: cookies.ANALYTICS_AUTH
        };
        tunnelstate["primaryws"].send(serialize(makepayload("auth", data, 0)));
    }
    
    var wasclosed = function() {
        tunnelstate.primary = false;
        tunnelstate["primaryws"] = null ;
        log.debug("websocket was closed");
        tryopen();
    }
    
    var lasttryopen = 0;
    var tryopen = function() {
    if(disabled)
			return;
        var newrequesttodefer = {};
        angular.forEach(requesttodefer, function(n, k) {
            if (n.success)
                return;
            if (n.at < new Date().getTime() - n.timeout) {
                n.defer.reject("TIMEOUT REACHED");
                return;
            }
            this[k] = n;
        }
        , newrequesttodefer);
        requesttodefer = newrequesttodefer;
        if (openattempt > MAXOPENINGS)
            return;
        if ((lasttryopen + openattempt * 1000) > new Date().getTime())
            return;
        lasttryopen = new Date().getTime();
        if (tunnelstate.primaryws == null ) {
            openattempt += 1;
            tunnelstate.primaryws = new WebSocket("ws://" + endpoint + "/stream");
            tunnelstate.primaryendpoint = "http://"+endpoint + "/poll";
            tunnelstate.primaryws.binaryType = 'arraybuffer';
            tunnelstate.primaryws.onopen = sendauth;
            tunnelstate.primaryws.onclose = wasclosed;
            tunnelstate.primaryws.onmessage = messagehandle;
            tunnelstate.primaryws.onerror = errorhandle;
        }
    }
    
    var messagehandle = function(event) {
        var json = deserialize(event.data);
        var data = JSON.parse(json);
		log.info(data);
        if (data.reqnum == 0) {
            tunnelstate.primary = true;
            return;
        }
        openattempt = 0;
        var request = requesttodefer[data.reqnum];
        var defer = request.defer;
        if (!data.success)
            defer.reject(data.payload);
        if(isdebug)
			log.info("Query to "+request.handler+" responded: ",data.payload," to request ",request.request," over ws");
        defer.resolve(data.payload);
        requesttodefer[data.reqnum].success = true;
    }
    
    var errorhandle = function(error) {
        console.log("websocket error " + error.data);
    }
    
    this.setup = function() {
            tryopen();
    }
    
    var makepayload = function(handler, data, reqnum) {
        var somedata = _.pick(data, _.identity);
        var somedata = _.pick(somedata, function(x) {
            return x != -1
        }
        );
        if (_.has(data, "reaction"))
            //FREE PASS FOR -1 IF A REACTION
            somedata["reaction"] = data["reaction"];
        var payload = {
            handler: '`' + handler,
            data: somedata
        };
        if (!_.isUndefined(reqnum))
            payload.reqnum = reqnum;
        return payload;
    }
    
	this.publish = function(handler, data, timeout){
        if(isdebug)
			log.info("Publishing to "+handler+" with: ",data);
        reqnum += 1;
        var defer = q.defer();
        if(disabled){
        	defer.reject("https!");
        	return defer.promise;
        }
        this.tunnelpublish(handler, data, timeout).then(function(res) {
        	defer.resolve(res);
        }).catch(function(error) {
        	var payload = makepayload(handler, data, reqnum);
            http(
            {
                method: "POST",
                url: tunnelstate["primaryendpoint"],
                data: { visitorid: _.parseInt(cookies.VISITOR_ID), accesskey: cookies.ANALYTICS_AUTH, payload:payload}
            }).success(function(data, status, headers, config) {
            	defer.resolve(data);
	            log.info("success");
			}).error(function(data, status, headers, config) {
    			defer.reject(data);
			});     	
        });
        return defer.promise;
	}

    this.tunnelpublish = function(handler, data, timeout) {
        reqnum += 1;
        if (_.isUndefined(timeout))
            timeout = PUBLISHTIMEOUT;
        var defer = q.defer();
        requesttodefer[reqnum] = {
            at: new Date().getTime(),
            handler:handler,
            request:data,
            defer: defer,
            success: false,
            timeout: timeout,
        };
        if ( tunnelstate.primary && tunnelstate.primaryws.readyState == 1 ) {
            try {
                openattempt = 0;
                tunnelstate.primaryws.send(serialize(makepayload(handler, data, reqnum)));
            } 
            catch (err) {
                defer.reject(err);
            }
        } 
        else {
            defer.reject()
        }
        return defer.promise;
    }
    
	this.query = function(handler, data, timeout){
        if(isdebug)
			log.info("Querying "+handler+" with: ",data);
        reqnum += 1;
        var defer = q.defer();
        if(disabled){
        	defer.reject("https!");
        	return defer.promise;
        }
        this.tunnelquery(handler, data, timeout).then(function(res) {
        	defer.resolve(res);
        }).catch(function(error) {
        	var payload = makepayload(handler, data, reqnum);
            http(
            {
                method: "POST",
                url: tunnelstate["primaryendpoint"],
                data: { visitorid: _.parseInt(cookies.VISITOR_ID), accesskey: cookies.ANALYTICS_AUTH, payload:payload}
            }).success(function(data, status, headers, config) {
        		if(isdebug)
					log.info("Query to "+handler+" responded: ",data.payload," to request ",payload," over pp");
				defer.resolve(data.payload);            		
			}).error(function(data, status, headers, config) {
            	defer.reject(data)
			});     	
        });
        return defer.promise;
	}

    this.tunnelquery = function(handler, data, timeout) {
        reqnum += 1;
        if (_.isUndefined(timeout))
            timeout = QUERYTIMEOUT;
        var defer = q.defer();
        requesttodefer[reqnum] = {
            at: new Date().getTime(),
            handler:handler,
            request:data,
            defer: defer,
            success: false,
            timeout: timeout,
        };
        if ( tunnelstate.primary && tunnelstate.primaryws.readyState == 1 ) {
            try {
                openattempt = 0;
                tunnelstate.primaryws.send(serialize(makepayload(handler, data, reqnum)));
            } 
            catch (err) {
                defer.reject(err);
            }
        } 
        else {
            defer.reject()
        }
        return defer.promise;
    }
    var query = this.query;
}
]);
