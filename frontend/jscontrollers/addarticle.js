

pdapp.controller('addarticleCtrl', ['ArticleService', 'axis','topic','position','$scope', '$mdDialog',
				function(articleService,axis,topic,position,scope,mdDialog) {
	scope.axis = axis;
	scope.topic = topic;
	scope.position = position;
	scope.inputdata = {'link':"",'author':""};
	scope.suggest = function(){
		articleService.suggest({"topic_id":scope.topic.id,"axis_id":scope.axis.id,"position":scope.position,"link":scope.inputdata['link'],"author":scope.inputdata['author'] }, function(response){
    		var res = response;
			mdDialog.hide();
	    	mdDialog.show({template:"<div class='msgpopup'>Thanks for adding to PositionDial!</div>"});
	    });
	};
	scope.closemodal = function(){
		mdDialog.hide();
	};
}]);

