pdapp.controller('clientTopicChooserCtrl', [
		'ClientTopicChooserService',
		'$scope',
		'$rootScope',
		'$log',
		'$http',
		'$routeParams',
		'$location',
		'$route',	
		function(clientTopicChooserService, scope, rootScope, log, http, routeParams, location, route) {

	scope.loaded = function() {
		scope.fetchTopics();
	};
	
	scope.clienttopiccount = {};
	scope.totalcount = 0;
	
	scope.fetchTopics = function (){
		clientTopicChooserService.query({'clientid':scope.clientid}, function(response){
    		var res = response;	
    		var alltopic = {"idx":0, "id":-1, "name":"All Topics", "count":0};
			var topics = [alltopic];
			for (n in res["topics"]){
				t=res["topics"][n];
				var topic = {"idx":topics.length, "id":t["id"], "name":t["name"], "count":t["count"]};
				topics.push(topic);
				scope.clienttopiccount[t["id"]] = t["count"];
				scope.totalcount += t["count"];
			}
			scope.clienttopics = topics;
			alltopic["count"]=scope.totalcount;
		});
	};

	scope.activate = function(index) {
		scope.activeindex = index;
		scope.$emit('parenttopicchange',scope.topics[index])
	};

	  scope.statementtotopic = {};
	  angular.forEach(scope.idtotopics, function(t, tkey){
	  	angular.forEach(t.statements, function(s, skey){
	  		var topiclist = _.has(scope.statementtotopic,s)?scope.statementtotopic[s]:[];
	  		topiclist.push(this.id);
	  		scope.statementtotopic[s] = topiclist;
	  	}, t);
	  });

	scope.reactionprogress = function(topic){
	  	if (topic.id == -1)
	  		return Math.round(100*_.size(scope.visitorvotes) / scope.totalcount);
		else
	  		return Math.round(100*_.size(_.intersection(_.keys(scope.visitorvotes),scope.idtotopics[topic.id].statements)) / scope.clienttopiccount[topic.id]); 
	};

}]);

