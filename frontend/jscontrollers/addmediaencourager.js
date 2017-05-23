

pdapp.controller('addmediaencouragerCtrl', ['PositionAxisService','ArticleService','$scope','modalService','$rootScope','$log','$http','$routeParams','$location','$route', 
					function(positionservice, articleService, scope, modal, rootScope, log, http, routeParams, location, route) {

	scope.paindex = 0;
	scope.articleid=-1;
	scope.article=null;

	scope.isActive = function(index) {
		return scope.paindex === index; 
	};

	scope.loaded = function(topicid) {
		if (typeof topicid != 'undefined'){
			if (topicid > -1)
				scope.topic = scope.idtotopics[topicid];
			else
				scope.topic = scope.alltopics;
		}
		if (typeof scope.topic == 'undefined')
			scope.topic = scope.alltopics;
		if (routeParams.articleId != 'undefined')
			scope.articleid=routeParams.articleId;
		if (routeParams.axisId != 'undefined')
			scope.axisId=routeParams.axisId;
		else
			scope.axisId=-1;
		scope.queryPositionAxis();
		if (scope.articleid > -1){
			articleService.query({"article_id":scope.articleid}, function(response){
				scope.article = response["article"];
				scope.setArticleTaintedPas();
			})
		}
	}

	scope.setArticleTaintedPas = function (){
			var thearticle = scope.article;
			if (scope.articleid>-1 && thearticle==null) //block until both are done
				return;
			scope.pas = scope.prepas;
			angular.forEach(scope.pas, function(axisvalue, key){
				var pa = axisvalue;
				pa["articlecount"] = (pa.axis.id == scope.axisId)?-1000:0;
				pa["axis"] = scope.idtoaxis[pa.axis.id];
				angular.forEach(axisvalue.articles, function(a, p){
					if (a.isvalid)
						pa.articlecount--;
					if(thearticle != null){
						angular.forEach(thearticle.positions, function(pos,k){
							if(pa.axis.id == pos.axis && scope.topic.id == pos.topic && a.position == pos.position){
								a=scope.article;
								a['originaltopic'] = pos.topic;
								axisvalue.articles[p] = a;
							}
						});
					}
                  	if(a["headline"] != null){
                    	a["headline"] = scope.fixheadline(a.headline);
						a["urllink"] = "/article/"+a.article_id+"/"+a.originaltopic+"/"+pa.axis.id+"/"+scope.makesafelink(a.headline);
						if (a.onsite == false){
							scope.offsitelinks[a.article_id]=a.link;
						}
                    }
				});
			});
			scope.pas=_.sortBy(scope.pas, 'articlecount');		
	}

	scope.queryPositionAxis = function (){
		positionservice.query({"topic_id":scope.topic.id}, function(response){
    		var res = response;
    		scope.prepas = res["pas"];
			scope.setArticleTaintedPas();
		});
	};
    
    scope.articleimg = function(article){
      if(typeof article !== 'undefined' && angular.isDefined(article.pic) && article.pic.length > 2)
      	return scope.articleimgurl+article.pic+".174.100.jpg";
      else if(angular.isDefined(scope.topic) && _.has(scope.topic,scope.idtotopics) && scope.idtotopics[scope.topic].pic != null)
        return scope.baseimgurl+'topicimg/'+scope.idtotopics[scope.topic].pic+".174.100.jpg";
      else
        return scope.baseimgurl+'img/defaultimages.png.653.380.png';
    };
                      
	scope.topicnamefiltered = function(){
		if (angular.isUndefined(scope.topic))
			return "";
		return scope.makesafelink(scope.topic.name);
	}
	
	scope.$on('topicchange', function(event, topic) {
		scope.topic=topic;
		if (scope.topic.id == topic.id)
			return
		scope.queryPositionAxis();
	});	
	
	scope.addArticle = function (paindex){
		var axis = scope.pas[scope.paindex].axis;
		var position = paindex - 2;
		scope.suggestMediaItem(angular.copy(axis), angular.copy(scope.topic), angular.copy(position));
	};
		
    scope.prev = function () {
    	scope.paindex = (scope.paindex > 0) ? --scope.paindex : scope.pas.length - 1;
    };
    
    scope.next = function () {
    	scope.paindex = (scope.paindex < scope.pas.length - 1) ? ++scope.paindex : 0;
    };

}]);
