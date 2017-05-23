pdapp.controller('dialCtrl', [ '$scope', '$rootScope', '$log', 
	function( scope, rootScope, log) {
       	log.info("dialid from dial parent is now "+scope.$parent.dialid);
		scope.loaded = function() {
       		log.info("dialid from dial parent is now "+scope.$parent.dialid);
			log.info("Created Dial View Controller ( clientid:"+scope.clientid+", dialtype: "+scope.dialtype+
								", dialid: "+scope.dialid+", topicid:"+scope.topic.id+
								", dialwait: "+scope.dialwait+", diallock:"+scope.diallock+
				")");
	    
	    	if(_.isUndefined(scope.emptyimage))
				scope.emptyimage = "getyourPositionDial_vsimple.png";
          	if (scope.emptyimage.indexOf("/") == -1)
          		scope.emptyimage = baseimgurl+'img/'+scope.emptyimage;

	    	if(_.isUndefined(scope.emptytarget))
				scope.emptytarget = "/getyourpositiondial/-1/-/-1/-";
	    	if(_.isUndefined(scope.caption))
				scope.caption = scope.$parent.caption;
			scope.issidebysidewhensmall = function(){return true};
		};
} ]);
