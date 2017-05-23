pdapp.controller('yourTagsCtrl', [
		'TagCloudService',
		'$scope',
		'$rootScope',
		'$log',
		'$http',
		'$routeParams',
		'$location',
		'$route',	
		function(tagCloudService, scope, rootScope, log, http, routeParams, location, route) {
			scope.needsome = false;
			scope.compare = function(a,b) {
  				if (a.size > b.size)
     				return -1;
  				if (a.size < b.size)
    				return 1;
  				return 0;
			}
			
			scope.loaded = function() {
				topicid = scope.topicid;
				tagCloudService.query({
					"topic_id" : topicid
				}, function(response) {
					var topiccount = response["topiccount"];
					topiccount.sort(scope.compare);
					scope.yourtags = topiccount;
					scope.needsome = topiccount.length==0;
				});
			}
			
		}
]);

