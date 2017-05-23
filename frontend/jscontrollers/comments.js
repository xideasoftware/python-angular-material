
pdapp.controller('commentsCtrl', [ 'CommentService', '$scope', '$rootScope', '$log', '$mdDialog',
	function(commentService, scope, rootScope, log,mdDialog) {
		scope.comments = {};
		scope.activeComment = {"comment":"","reaction":""};
		scope.commentsReaction = {};
		scope.activestatementid = null;
		scope.activeStatementText = "";
		scope.reactionToTextHash = {"":"","2":"strongly agree","1":"agree","0":"neither really","-1":"disagree","-2":"strongly disagree"}
		scope.havevoted = function(reaction) {
			if(scope.comments[scope.activestatementid] != undefined && scope.comments[scope.activestatementid]["reaction"] != undefined && scope.comments[scope.activestatementid]["reaction"].toString() == reaction)
   			{
   				return true;
   			}
   			else
   			{
   				return false;
   			}
  		}
  		scope.voteoncomment = function(reaction)
  		{
  			scope.activeComment["reaction"] = reaction;
  		}
  		scope.$on('statementchange', function(event, statement){
	    	scope.activestatementid = statement.id;
	    	scope.activeStatementText = statement.text;
			scope.loaded();
	    });
	    scope.postComment = function(){
	    	if(scope.isloggedin == false)
	    	{
	    		mdDialog.show({
					controller: 'defaultPopupCtrl',
					template: generateModal("Please try again", "Please<a class='highlight' href='/account'> log in / register</a> to add a comment")
				});	
	    	}
	    	else
	    	{
	    		commentParams = {"reaction":scope.activeComment["reaction"],"statementid":scope.activestatementid,"comment":scope.activeComment["comment"]};
	    		commentService.saveComment(commentParams, 
        			function(response) {
	    			}
	    		);	
	    	}
	    }
		scope.loaded = function() {
			scope.activeComment = {"comment":"","reaction":""};
			if(scope.activestatementid != null)
			{
				if(scope.comments[scope.activestatementid] == undefined)
				{
					scope.comments[scope.activestatementid] = {"comment":"","reaction":""};
					if((scope.comments[scope.activestatementid] != undefined || scope.comments[scope.activestatementid]["reaction"] == "") && scope.visitorvotes[scope.activestatementid] != undefined && scope.visitorvotes[scope.activestatementid]["reaction"] != undefined)
					{
						scope.comments[scope.activestatementid]["reaction"] = scope.visitorvotes[scope.activestatementid]["reaction"].toString();
					}
				}
				scope.activeComment = scope.comments[scope.activestatementid];
			}
		};
		scope.loaded();
	 }]);
