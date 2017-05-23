
pdapp.controller('authorppcCtrl', ["MatchService", 'AuthorService', '$scope', '$rootScope', '$log', '$mdDialog', 'ShareService', '$sce',
function(matchesService, authorService, scope, rootScope, log, mdDialog, shareService, sce) {
    
    scope.matchtype = 'authorppc';
    scope.authorId = scope.stateParams.authorId;
    scope.clientid = 8;
    
    scope.loaded = function() {
        authorService.query({
            "author_id": scope.authorId
        }, function(response) {
            var res = response;
            scope.author = res["author"];
            scope.authorset = true;
            scope.author.authorpic = (scope.author.authorpic == null ) ? (imgconfig[scope.matchtype].default) : (imgconfig[scope.matchtype].base + scope.author.authorpic);
            scope.page.setTitle(scope.author.name);
        }
        );

        authorService.reactionstats({
            "author_id": scope.authorId
        }, function(response) {
            var res = response;
            scope.reactionstats = res["reactionstats"];
        }
        );
        
        matchesService.querymatches({
            matchtype: scope.matchtype,
            matchid: scope.authorId,
            clientid: scope.clientid
        }).then(function(matches) {
            scope.matches = matches["matches"];
        }
        );
    
    }

    scope.pctcomplete = function(){
        return d3.format("%")(scope.reactionstats.pctcomplete);
    }
    
    scope.$on('parenttopicchangerequest', function(event, topic, axisid, side) {
        var modalinstance = mdDialog.show({
            templateUrl: basepartialurl + 'authorstatementpopup.html',
            resolve: {
                topic: function() {
                    return topic;
                },
                authorid: function() {
                    return scope.authorId;
                }
            },
            controller: 'authorPopupCtrl'
        });
    
    }
    );
    
    scope.$on("sendppcmatch", function(event, provider) {
        if (provider == 'fb')
            matchesService.sendppcmatchtofb(scope.matches[0]);
        if (provider == 'tw')
            matchesService.sendppcmatchtotw(scope.matches[0]);
    });

    scope.$on("sendppcprofile", function(event, provider) {
        if (provider == 'fb')
            shareService.sendppcprofiletofb(scope.author);
        if (provider == 'tw')
            shareService.sendppcprofiletotw(scope.author);
    });

    scope.$on("sendppcencourage", function(event, provider) {
        matchesService.sendppcencourage(scope.matches[0]);
    });

    scope.getauthorstatement = function(){
        return sce.trustAsHtml(replacenewlines(scope.author.authorppcstatement));
    };
        
    scope.loaded();
}
]);
