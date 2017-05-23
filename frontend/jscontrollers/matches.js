

pdapp.controller('matchesCtrl', ["MatchesService", '$scope','$rootScope','$log','$http','$routeParams','$location','$route', 'modalService',
                                       function(matchesService, scope, rootScope, log, http, routeParams, location, route, modal) {
	scope.querymatches = function() {
		matchesService.query({topicid : scope.topic.id}, function(response){
        	var res=response;
			var userimg = {"idx":0, "id":-1, "name":"You", "author_pic":baseimageurl+"user1.png", "matchpc":null, "typ":"visitor", "safelink":null};
			var entities = [userimg];
			for (n in res["authors"]){
				e=res["authors"][n];
				m = (e["matchpc"].toFixed(0));
				if (m > 99)
					m=100;
				if (m < -99)
					m=-100;
				var entity = {"idx":entities.length, "id":e["id"], "name":e["name"], "author_pic":scope.baseimgurl+"authorimg/"+e["pic"], "matchpc":m+"%", "typ":"authormp", "safelink":"/author/"+e["id"]+"/"+e["name"].replace(" ", "-").replace(" ", "-").replace(" ", "-")};
				entities.push(entity);
			}
			if (!(typeof scope.originalentities == 'undefined'))
				var oldauthorid = scope.originalentities[scope.activeindex].id;
			scope.entitycount = entities.length;
			scope.entities = entities;
			scope.originalentities = angular.copy(entities);
			if (!(typeof oldauthorid == 'undefined')){
				if (oldauthorid == -1)
					return;
				var found = false;
				for (n in scope.originalentities){
					var author = scope.entities[1];
					if (author.id == -1)
						continue;
					if (author.id != oldauthorid)
						scope.moveforwardauthor();
					else{
						found = true;
						scope.activeindex = author.idx;
						break;
					}
				}
				if (!found)
					scope.activeindex = entities[0].idx;
			}
		});
	};

	scope.loaded = function() {
		scope.topic = scope.alltopics;
		scope.querymatches();
	};

	scope.$on('parentoverridetopicchange', function(event, topic) {
		scope.topic = topic;
		scope.querymatches();
		scope.$broadcast('topicchange',scope.topic);
	});		

	scope.$on('parenttopicchangerequest', function(event, topic, axisid, side) {
		if (scope.activeindex == 0){
			var modalinstance = modal.open({
				templateUrl : basepartialurl + 'statementpopup.html',
				resolve : {
					topic : function() {
						return topic;
					},
					axisid : function() {
						return axisid;
					},
					side : function() {
						return side;
					}
				},
				controller : 'statementpopupCtrl'
			});
			return;
		}

		var modalinstance = modal.open({
				templateUrl : basepartialurl + 'authorstatementpopup.html',
				resolve : {
					topic : function() {
						return topic;
					},
					authorid : function() {
						return scope.originalentities[scope.activeindex]["id"];
					}
				},
				controller : 'authorPopupCtrl'
			});

		});
	
	scope.activeindex = 0;
	
	scope.activate = function(index) {
		scope.activeindex = index;
		scope.$broadcast('dialchange',scope.originalentities[index]["typ"], scope.originalentities[index]["id"]);
	};
	
	scope.isActive = function(index) {
		return scope.activeindex === index; 
	};
	
	scope.moveforwardauthor = function(){
		var movedentity = scope.entities.splice(1,1);
		scope.entities.push(movedentity[0]);
	};
	scope.movebackauthor = function(){
		var movedentity = scope.entities.pop();
		scope.entities.splice(1,0,movedentity);
	};

	scope.loaded();
}]);
