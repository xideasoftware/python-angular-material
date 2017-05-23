
pdapp = angular.module('pdapp', ['ngResource','ui.bootstrap','ngRoute','ngTouch','ngAnimate','ngSanitize']);

// android fix
var nua = navigator.userAgent;
var is_android = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
if (is_android) {
	$('select.form-control').removeClass('form-control').css('width', '100%');
}

var scriptloader = function(id, u){
  var d = document;
  var js, fjs = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement('script'); 
  js.id = id;
  js.async = 1;
  js.src = u;
  fjs.parentNode.insertBefore(js, fjs);
}; 

setTimeout("scriptloader('RGBColor', '//cdnjs.cloudflare.com/ajax/libs/amcharts/3.10.0/exporting/rgbcolor.min.js')", 0);
setTimeout("scriptloader('Canvg', '//cdnjs.cloudflare.com/ajax/libs/amcharts/3.10.0/exporting/canvg.min.js')", 0);
setTimeout("scriptloader('facebook-jssdk', '//connect.facebook.net/en_US/sdk.js')", 0);
setTimeout("scriptloader('twitter-sdk', '//platform.twitter.com/widgets.js')", 0);

// central cache service
pdapp.factory("CacheService", function($cacheFactory) {
	var cache = $cacheFactory("cacheService");
	for (jsonkey in _jsonprecache)
		cache.put(jsonkey, _jsonprecache[jsonkey]);
	return cache;
});

pdapp.factory("articleid", function() {  return -1 }); //HACK

pdapp.config(function($locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');
});

pdapp.factory('pdHttpInterceptor', function($location, $rootScope, $q) {
	return {
	  'requestError' : function(config) {
		  $rootScope.status = 'HTTP REQUEST ERROR ' + config;
		  return config || $q.when(config);
	  },
	  'responseError' : function(rejection) {
		  $rootScope.status = 'HTTP RESPONSE ERROR ' + rejection.status + '\n' + rejection.data;
		  return $q.reject(rejection);
	  },
	  'request' : function(config) {
		  return config;
	  },
	};
});

pdapp.config(function($httpProvider) {
	$httpProvider.interceptors.push('pdHttpInterceptor');
});

pdapp.config(function($sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist([ 'self', 'http://cdn.positiondial.com/**', 'https://storage.googleapis.com/cdn.positiondial.com/**',
	    'http://storage.googleapis.com/cdn.positiondial.com/**', 'http://localhost**', 'http://192.168**', 'http://\d*.positiondial-www.appspot.com**' ])
});

pdapp.controller('dialPluginCtrl', [ '$scope', '$rootScope', '$log', '$http', 'CacheService', '$routeParams', '$location', '$route', '$window', '$timeout',
    function(scope, rootScope, log, http, cache, routeParams, location, route, window, timeout) {
    	scope.dialinstancecounter = {
	    	"top" : 0
    	}; // hack to enumerate dial instances
	    scope.idtoaxis = cache.get("idtoaxis");
	    scope.idtotopics = cache.get("idtotopics");
	    scope.visitor = cache.get("visitor");
	    scope.visitorid = visitorid;
	    scope.referer = referer;
	    scope.isloggedin = isloggedin;
	    scope.baseimageurl = baseimageurl;
	    scope.username = username;
	    scope.alltopics = {'id':-1, 'name':'All Topics'};
	    scope.clientid = clientid;
	    scope.mainside = true;
	    scope.facebookloggedin = facebookloggedin;
	    scope.twitterloggedin = twitterloggedin;

	    angular.forEach(scope.idtotopics, function(t, k) {
		    t["safelink"] = "/topic/" + t["id"] + "/" + t["name"].replace(" ", "-").replace(" ", "-").replace(" ", "-");
	    });

	    scope.gotopic = function(topic) {
		    location.url(topic.safelink);
	    };

	  	scope.$on('parenttopicchangerequest', function(event, topic) {
	  	});
	  	
	    scope.offsitelinks = {};

	  	scope.statementtotopic = {};
	  	angular.forEach(scope.idtotopics, function(t, tkey){
	  		angular.forEach(t.statements, function(s, skey){
	  			var topiclist = _.has(scope.statementtotopic,s)?scope.statementtotopic[s]:[];
	  			topiclist.push(this.id);
	  			scope.statementtotopic[s] = topiclist;
	  		}, t);
	  	});
	  	
		scope.flipmain = function(){
			scope.mainside = !scope.mainside;
		};

	  	scope.getclientid = function(){
	  		return scope.clientid;
	  	};

	  	scope.getyoutubeid = function(link){
	  		if(link == null)
	  			return null;
	  		var parts = link.split('/');	
	  		if(parts[2]!="www.youtube.com")
	  			return null;
	  		var params=scope.deserialiseURLToDict(parts[3].replace("#","&"));
	  		if(!_.has(params,"v"))
	  			return null;
	  		if(!_.has(params,"t"))
	  			return params["v"]+"?theme=dark";
	  		return params["v"]+"?start="+params["t"]+"&theme=dark";
	  	};

	    scope.getpngdataurl = function(tagname) 
	    {
	      var xmlns = "http://www.w3.org/2000/svg";
	      var svgArea = document.getElementById(tagname).cloneNode(true);
	      var primarynode = svgArea.getElementsByTagName("g")[0].cloneNode(true);
	      var chartArea = document.createElementNS (xmlns, 'svg');
	      chartArea.setAttribute("viewBox",svgArea.getAttribute("viewBox"));
	      chartArea.appendChild(primarynode);
	      var labels = chartArea.getElementsByTagName("text");
	      angular.forEach(labels, function(label, key){
	      	label.className = "";
	      	label.style.fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 4.0px";
	      	label.style.fontSize="4.0px";
	      });
	      var paths = chartArea.getElementsByTagName("path");
	      angular.forEach(paths, function(p, key){
	      	p.style.strokeWidth = "0.2px";
	      	p.style.stroke = "#444444";
	      });
	      var polylines = chartArea.getElementsByTagName("polyline");
	      angular.forEach(polylines, function(p, key){
	      	p.style.fill = "none";
	      	p.style.stroke = "#444444";
	    	p.style.strokeWidth = "0.2px";
	      });
	      oXmlSerializer =  new XMLSerializer();
	      var svg2 = oXmlSerializer.serializeToString(chartArea);
	      var canvas = document.createElement('canvas');
	      canvas.setAttribute('width', '1910');
	      canvas.setAttribute('height', '1000');
	      document.body.appendChild(canvas);
	      canvg(canvas, svg2);
	      dataurl=canvas.toDataURL("image/png");
	      canvas.parentNode.removeChild(canvas);
	      return dataurl;
	    };

	    scope.sendtofb = function(){
	    	var pngdataurl = scope.getpngdataurl(scope.vistordialelemid);
	    	var frm = document.forms['positiondial_dialplugin_shareform'];
	    	frm.elements["referer"].value = referer;
	    	frm.elements["visitorid"].value = visitorid;
	    	frm.elements["clientid"].value = clientid;
	    	frm.elements["provider"].value = "fb";
	    	frm.elements["dialdataurl"].value = pngdataurl;
	    	frm.elements["dialtype"].value = 'visitor';
	    	frm.elements["dialid"].value = -1;
	    	frm.elements["topicid"].value = -1;
	    	frm.submit();
	    };

	  	scope.serialiseDictToURL =function (obj){
  			var str = [];
  			for(var p in obj)
          		if (obj.hasOwnProperty(p)) {
            		str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          		}
        	return str.join("&");
      	};

      	scope.deserialiseURLToDict = function (url){
			var obj = {};
			var itsplit = url.split("?")[1].split("&");
			for(var i = 0; i < itsplit.length; i++){
    			var kv = itsplit[i].split('=');
    			obj[kv[0]] = decodeURIComponent(kv[1] ? kv[1].replace(/\+/g, ' ') : kv[1]);
			} 
			return obj;     
	  	};

	    scope.$on('vistordialelemid', function(event, vistordialelemid) {
	    	scope.vistordialelemid = vistordialelemid;
	    	rootScope.vistordialelemid = vistordialelemid;
	    });

        scope.posted = false;
	    scope.sendtotw = function(){
	    	var pngdataurl = scope.getpngdataurl(scope.vistordialelemid);
	    	var msg = scope.twittercaption.substring(0,100) +" innotechsummit.com @PositionDial";
	    	var target = 
	    	http({
    	    	method: "post",
        		url: "/rest/twitterdialpost",
        		data: {'dialdataurl':pngdataurl,'provider':'tw','message':msg,'dialtype':'visitor','dialid':-1,'topicid':-1,'clientid':-1}
    		}).success(
    			function(){
          			scope.posted = true;
					timeout(function (){scope.posted=false;scope.mainside = true;scope.twittercaption=""},5000);
  			});    	
	    };
   	}

]);

	   