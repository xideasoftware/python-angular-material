
pdapp.controller('home2Ctrl', ['HomeService', '$scope', '$rootScope', '$log', '$state', '$mdDialog', 'CacheService', 'pdArticleService', 
    function(homeservice, scope, rootScope, log, state, mdDialog, cache, pdArticleService) {
        
        
        scope.homestream = cache.get("homestream");
        scope.trendingstatements = cache.get("trendingstatements")
        
        scope.layoutcards = function() {
            if (_.isUndefined(scope.visitor.badges) || _.isNull(scope.mainviewwidth))
                return;
            var cols = 1;
            if (scope.mainviewwidth > 1100)
                cols = 2;
            if (scope.mainviewwidth > 1600)
                cols = 3;
            if (cols != scope.cols)
                scope.homestreamgrid = _.chunk(scope.homestream, cols);
            scope.cols = cols;
        };
        scope.$on("mainviewwidthchanged", scope.layoutcards);
        
        scope.loaded = function() {
            scope.layoutcards()
        };
        
        scope.tslink = function(ts) {
            return '/getyourpositiondial/-1/-/-1/-/' + ts.id + '/' + makesafelink(ts.text) + "?tab=2";
        };
        
        scope.homeitemurl = function(h) {
            return basepartialurl + "card" + h.typ + ".html";
        };
        
        scope.statementhasyoutube = function(statement) {
            return null != scope.statementyoutube(statement);
        };
        
        scope.statementyoutube = function(statement) {
            return scope.getyoutubeid(statement.link);
        };
        
        scope.statementyoutubeurl = function(statement) {
            return sce.trustAsResourceUrl("http://www.youtube.com/embed/" + scope.statementyoutube(statement));
        };
        
        scope.statementyoutubepreview = function(statement) {
            return sce.trustAsResourceUrl("http://img.youtube.com/vi/" + scope.statementyoutube(statement) + "/hqdefault.jpg");
        };
        
        scope.mediaoverlay = function(article) {
            return pdArticleService.overlayfor(article, 100, 100);
        };
        
        scope.mediaimg = function(article) {
            var topic = scope.idtotopics[article.first];
            return pdArticleService.articleimgsizetopic(article, 100, 100, topic);
        };
        
        scope.defaultimage = function() {
            return pdArticleService.defaultimage(100, 100);
        };
        
        scope.articleimg = function(statement) {
            if (scope.statementhasyoutube(statement))
                return scope.statementyoutubepreview(statement);
            else if (typeof statement !== 'undefined' && statement.articlepic != null && statement.articlepic.length > 2)
                return baseimgurl + 'articleimg/' + statement.articlepic + ".653.380.jpg";
            else if (typeof statement !== 'undefined' && angular.isDefined(statement.topic) && _.has(scope.idtotopics, statement.topic) && scope.idtotopics[statement.topic].pic != null)
                return baseimgurl + 'topicimg/' + scope.idtotopics[statement.topic].pic + ".653.380.jpg";
            else
                return baseimgurl + 'img/white.png';
        };
        
        scope.loaded();
    }]);
