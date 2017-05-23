

pdapp.controller('addstatementCtrl', ['StatementService', '$scope','$rootScope','$location', 'modalService',
				function(statementService,scope,rootScope,location,modal) {
    scope.inputdata = {'link':"",'author':"",'statement':"",'topic':"",'note':""};
                  
  	scope.suggest = function(){
  		statementService.suggest(scope.inputdata, function(response){
      		var res = response;
  	    	modal.open({template:"<div class='msgpopup'>Thanks for adding to PositionDial!</div>"});
  	    });
  	};

    scope.expanded = false;
                  
    scope.loaded = function(){};
                  
    scope.expand = function(){
    scope.expanded=true;
		ga('send', 'event', 'AddPositionAttempt', 'click', 'action', 2);
    };

}]);
