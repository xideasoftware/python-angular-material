pdapp.controller('mediaCtrl', [ 'ArticleService', '$scope', '$rootScope', '$log',
    function(articleService, scope, rootScope, log)
    {
		scope.itemcount = 8;
		scope.extendby = 8;
		scope.fetchedcount = 0;
		scope.topicids = [];
		scope.topic = scope.alltopics;
		scope.readhistory = [];
		scope.mediaitems = [];

		scope.$on('parenttopicchange2', function(event, topic){
			scope.topicids = [topic.id,];
			scope.topic = topic;
			scope.fetchReadMedia();
			scope.$broadcast('topicchange',scope.topic);
		});
	
	    scope.loaded = function() {
		    scope.fetchReadMedia();
	    };
	    
	    scope.fetchReadMedia = function() {
			scope.fetchedcount = 0;
			scope.itemcount = 8;
			scope.readhistory = [];
			scope.mediaitems = [];
	    	articleService.readarticles((scope.topic.id>0)?{topicid:scope.topic.id}:{}, function(readhistory) {
			    scope.readhistory = readhistory["media"];
			    scope.prefetch();
		    });
	    };

	    scope.prefetch = function(){
	    	var fetchlimit = _.min([scope.itemcount+2*scope.extendby, scope.readhistory.length]);
	    	var fetchsection =_.take(scope.readhistory, fetchlimit);
        	var aids = _.map(fetchsection, 'entity');
			articleService.prefetch(aids);
			angular.forEach(fetchsection, function(item){
				if(!_.has(item,"article")){
					articleService.getfuture(item.entity).then(function(article){
						if(!_.has(item,"article")){
							item.article = angular.copy(article);
							item.article.readat = item.time;
							scope.mediaitems.push(item.article);
						}
					});
				};
			});
	    };
      
        scope.addmore = function(){
		  	scope.itemcount += scope.extendby;
			scope.prefetch();
  		};

		scope.loaded();

        scope.mediaoverlay = function(article) {
            return articleService.overlayfor(article, 100, 100);
        };
        
        scope.mediaimg = function(article) {
            var topic = scope.idtotopics[article.first];
            return articleService.articleimgsizetopic(article, 100, 100, topic);
        };
        
        scope.defaultimage = function() {
            return articleService.defaultimage(100, 100);
        };
        	    
    } ]);
