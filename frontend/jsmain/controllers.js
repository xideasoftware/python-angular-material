pdapp.controller('externalLinkCtrl', ['externallink', '$scope', '$rootScope', '$log', '$http', '$routeParams', '$location', '$route', 
    function(externallink, scope, rootScope, log, http, routeParams, location, route) {
        
        scope.externallink = externallink;
    
    }]);

pdapp.controller('ToastCtrl', ['$scope','$mdToast','$timeout','$location', function(scope, toast, timeout, location ) {
  scope.closeToast = function() {
  	timeout(toast.hide,1000);
  };
  scope.go = function(to) {
    location.url(to);
  };
}]);

pdapp.controller('TopicSheetPickerCtrl', ['$scope', '$rootScope', 'viewabletopics', 'baseimgurl', '$log', '$mdBottomSheet',
	function(scope, rootScope, viewabletopics, baseimgurl, log, mdBottomSheet){
	scope.viewabletopics = viewabletopics;
	scope.baseimgurl = baseimgurl;
	scope.fourgridtopics = _.chunk(viewabletopics,4);
	scope.fivegridtopics = _.chunk(viewabletopics,5);
	scope.sixgridtopics = _.chunk(viewabletopics,6);
	
	scope.topicimg = function(topic){
      	if(!(angular.isDefined(topic.pic) && !_.isNull(topic.pic) && topic.pic.length > 2))
        	return scope.baseimgurl+'img/defaultimages.png.174.100.png';
		return scope.baseimgurl+'topicimg/'+topic.pic+'.174.100.jpg';
	};

	scope.topicswitch = function(topic){
		log.info(topic.name + " picked");
		mdBottomSheet.hide(topic);
		rootScope.closemenu();
	};
}]);

pdapp.controller('TwitterPostCtrl', ['$scope', '$rootScope', 'dataurl', 'msg', '$log', '$mdBottomSheet', 'ShareService',
	function(scope, rootScope, dataurl, msg, log, mdBottomSheet, shareService){
	scope.dataurl = dataurl;
	scope.msg = msg;

	scope.close = function(){
		mdBottomSheet.cancel();
	}

	scope.post = function(){
		mdBottomSheet.hide(scope.msg);
	};
//check later if can update share match percentage here
	scope.$watch('msg', function (newValue) {
        if (newValue && newValue.length > 99) {
            scope.msg = newValue.substring(0, 99);
        }
    });
}]);

pdapp.controller('defaultPopupCtrl', ['$scope','$rootScope','$log','$mdDialog',
                                     function(scope, rootScope, log, mdDialog) {

    	scope.closemodal = function(){
    		mdDialog.hide();
    	};

	    scope.gonewtab = function(url){
		    window.open(url, '_blank');
	    };
    	
    }]);

pdapp.controller('statementInfoPopupCtrl', ['$scope','$rootScope','$log','$mdDialog','StatementService','statementid',
                                     function(scope, rootScope, log, mdDialog, statementService, statementid) {

    	scope.closemodal = function(){
    		mdDialog.hide();
    	};

		statementService.info({statementid:statementid}, function(response){
		    scope.info = response["statementinfo"];
		});

    }]);

pdapp.controller('facebookSuccessPopupCtrl', ['$scope','$rootScope','$log','$mdDialog','url',
                                     function(scope, rootScope, log, mdDialog, url) {

		scope.url = url;
    	scope.closemodal = function(){
    		mdDialog.hide();
    	};

	    scope.gonewtab = function(url){
		    window.open(url, '_blank');
	    };
    	
    }]);


pdapp.controller('requestPasswordCtrl', ['AccountService', '$scope','$rootScope','$log','$mdDialog', 
				function(accountService,scope, rootScope, log, mdDialog) {
	
	scope.reset={};
	
	scope.sendpasswordreset = function(){
		accountService.sendpasswordreset({"username":scope.reset.username}, function(response){
								var res = response;
								mdDialog.show({controller:'defaultPopupCtrl', template:generateModal("Password Reset",response.message)}); 								
		});
	};
	
}]);

pdapp.controller('defaultbadgepopupCtrl', ['$scope', '$mdDialog', 'badge', '$rootScope',
    function(scope, mdDialog, badge, rootScope) {

		scope.badge = badge;
	    scope.baseimgurl = baseimgurl;
	    scope.loaded = function(){
	    	
	  	};

		scope.closemodal = function(msg){
			mdDialog.hide(msg);
		};

	    scope.go = function(url){
			mdDialog.hide();
	    	rootScope.go(url);
	    };
	        
	        
	  scope.loaded();
}]);
