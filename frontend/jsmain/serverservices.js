

pdapp.factory("DialService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/dialhandler", {}, {
	      "query" : { method : 'GET',
	        params : { visitorid : '@visitorid', dialtype : '@dialtype', dialid : '@dialid', topicid : '@topicid', 
	        		trending : '@trending', clientid : '@clientid', othervisitorid:'@othervisitorid' },
	        		url : '/rest/dialhandler', isArray : false },
	    });
    } ]);

pdapp.factory("StatementServerService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/statementhandler", {}, {
	      	"query" : {
	          method : 'GET',
	          params : { visitorid : '@visitorid', dialtype : '@dialtype', dialid : '@dialid', topicid : '@topicid', clientid : '@clientid',
	        			trending : '@trending', comparetype:'@comparisontype', compareid:'@compareid', categories:'@categories'}, 
	        			isArray : false },
	      	"info" : {
	          method : 'GET',
	          params : { statementid:'@statementid'}, 
	          url : '/rest/statementinfohandler',
	          isArray : false },
	      	"suggest" : { 
	      	  method : 'PUT',
	          params : { visitorid : '@visitorid', link : '@link', author : '@author', statement : '@statement', pic : '@pic', note : '@note' },
	          url : '/rest/statementsuggest', isArray : false },
	    });
    } ]);

pdapp.factory("QuizService", [ "$resource", 
	function(resource) {
		return resource("", {}, {
			"authorreact" : {
				method : 'PUT',
				params : { opaquelink : '@opaquelink', id : '@id', reaction : '@reaction'},
		          	url : '/rest/authorselfreact', isArray : false,
			},
			"authorstatement" : {
				method : 'PUT',
				params : { opaquelink : '@opaquelink', statement: '@statement'}	,
		          	url : '/rest/authorselfstatement', isArray : false,					
			},
			"authorreactionsget" :{
				method : 'GET',
				params : { opaquelink : '@opaquelink'},
		          	url : '/rest/authorselfreact', isArray : false,
			},
			"authorstatementget" :{
				method : 'GET',
				params : { opaquelink : '@opaquelink'},
		          	url : '/rest/authorselfstatement', isArray : false,
			},
			"partyreact" : {
				method : 'PUT',
				params : { opaquelink : '@opaquelink', id : '@id', reaction : '@reaction'},
		          	url : '/rest/partyselfreact', isArray : false,
			},
			"partyreactionsget" :{
				method : 'GET',
				params : { opaquelink : '@opaquelink'},
		          	url : '/rest/partyselfreact', isArray : false,
			},
		});

	}]);

pdapp.factory("BadgeServerService", [
    "$resource",
    function(resource) {
	    return resource("/rest/badgehandler", {}, {
		    "award" : {
		      method : 'PUT',
		      params : { visitorid:'@visitorid', topicid:'@topicid', clientid:'@clientid', count:'@count', badgetype:'@badgetype',
		      			level:'@level' },
		          	url : '/rest/badgehandler', isArray : false },
  	    });
} ]);

pdapp.factory("ClientServerService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/clienthandler", { client_id : '@client_id' }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("SearchService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/articlesearchhandler", { search : '@search' }, { "search" : { method : 'GET' } });
} ]);

pdapp.factory("ProductService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/featuredproductcategories", {},{ "query" : { method : 'GET', cache : cache }});
} ]);

pdapp.factory("AllProductService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/allproductcategories", {},{ "query" : { method : 'GET', cache : cache }});
} ]);

pdapp.factory("AccountService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("", {}, {
	      "detail" : { method : 'POST', url : "/account/detail", params : {} },
	      "sendpasswordreset" : { method : 'POST', url : "/account/sendpasswordreset", params : { username : '@username' } },
	      "resetpasswordservice" : { method : 'POST', url : "/account/resetpasswordservice",
	        params : { user_id : '@user_id', token : '@token', password : '@password' } },
	      "saveuserdetails" : { method : 'POST', url : "/account/saveuserdetails", params : { name : '@name', email : '@email', area : '@area' } }, });
    } ]);

pdapp.factory("HomeService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/homehandler", {}, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("TopicListService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/topiclisthandler", { dialtype : '@dialtype', dialid : '@dialid' }, { "queryvisitor" : { method : 'GET' },
	      "query" : { method : 'GET', cache : cache } });
    } ]);

pdapp.factory("MatchesService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/mpmatcheshandler", { topicid : '@topicid' }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("ComparisonServerService", [ "$resource", function(resource) {
	return resource("/rest/comparisonhandler", 
		{ matchtype : '@matchtype', matchid : '@matchid', exactsourceentity : '@exactsourceentity' }, 
		{ "compare" : { method : 'GET' } });
} ]);

pdapp.factory("MatchServerService", [
    "$resource",
    function(resource) {
	    return resource("/rest/matcheshandler", { matchtype : '@matchtype', clientid : '@clientid', matchid : '@matchid', 
	    		topicid : '@topicid', statementids: '@statementids' }, {
	    	"query" : { method : 'GET'} });
    } ]);

pdapp.factory("EntitiesSummaryServerService", [
                                     "$resource",
                                     function(resource) {
                                 	    return resource("/rest/entitieshandler", { method : 'GET' }, {
                                 	    	"querylist" : { params:{entitytype : "@entitytype", entityids: '@entityids', categories: '@categories' } }
                                 	    });
                                     } ]);

pdapp.factory("OrgService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/orghandler", { orgid : '@orgid' }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("CitationsService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/getcitations", { id : '@orgid' , ciatationFor: '@citationFor'}, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("OrgMatchesService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/orgmatcheshandler", { topicid : '@topicid', orgid : '@orgid' }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("OrgPositionDialService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/orgshareshandler", { topicid : '@topicid', orgid : '@orgid' }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("TopicService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/topichandler", { topicid : '@topicid' }, { 
	      "query" : { method : 'GET', cache : cache },
	      "follow" : { method : 'PUT', url : '/rest/visitorfollowtopic', params : { topicid : '@topicid', follow: '@follow' } },
	      "ignore" : { method : 'PUT', url : '/rest/visitorignoretopic', params : { topicid : '@topicid', ignore: '@ignore' } },
	      });
    } ]);

pdapp.factory("ClientTopicChooserService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/clienttopichandler", { clientid : '@clientid' }, { "query" : { method : 'GET', cache : cache } });
} ]);

pdapp.factory("TopicChooserService", [ 
	"$resource", "CacheService", 
	function(resource, cache) {
		return resource("/rest/orgtopicshandler", { orgid : '@orgid' }, { 
		    "query" : { method : 'GET', cache : cache },
			"interestingtopics" : { url : '/rest/interestedtopics'},
	});
} ]);

pdapp.factory("ArticleServerService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/articlehandler", { article_id : "@article_id" }, {
	      "query" : { method : 'GET', cache : cache },
	      "toptopic" : { method : 'GET', url : '/rest/articlefirsttopichandler', cache : cache },
	    });
    } ]);

pdapp.factory("RegisterService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/register", {}, { "query" : { method : 'GET' },
	      "register" : { method : 'PUT', params : { email : '@email', name : '@name' }, url : '/rest/register', isArray : false } });
    } ]);

pdapp.factory("AuthorService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/authorhandler", { author_id : "@author_id", topic_id : "@topic_id", opaquelink:"@opaquelink" }, 
	    { "query" : { method : 'GET', cache : cache },
	      "list" : { method : 'GET', params : { author_category : '@author_category' }, url : '/rest/authorshandler', cache : cache },
	      "mplist" : { method : 'GET', params : { author_category : '@author_category' }, url : '/rest/authormpshandler', cache : cache },
	      "reactionstats" : { method : 'GET', params : { author_id : "@author_id" }, url : '/rest/authorreactionstats', cache : cache }
	    });
    } ]);

pdapp.factory("PartyServerService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/partyhandler", { party_id : "@party_id", topic_id : "@topic_id" }, 
	    { "query" : { method : 'GET', cache : cache },
	      "list" : { method : 'GET', params : { party_category : '@party_category' }, url : '/rest/partyshandler', cache : cache } });
    } ]);

/*adding product server service using existing orghandler - MC*/
pdapp.factory("ProductServerService", [
                                     "$resource",
                                     "CacheService",
                                     function(resource, cache) {
                                 	    return resource("/rest/orghandler", { org_id : "@org_id", topic_id : "@topic_id" }, 
                                 	    { "query" : { method : 'GET', cache : cache },
                                 	      "list" : { method : 'GET', params : { product_category : '@product_category' }, url : '/rest/orghandler', cache : cache }
                                 	    });
                                     } ]);

pdapp.factory("PositionAxisService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/positionaxishandler", { topic_id : "@topic_id" }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("TwoSidesService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/twosideshandler", { topic_id : "@topic_id", feature_id : "@feature_id" }, { "query" : { method : 'GET', cache : cache } });
} ]);

pdapp.factory("TopicExplorerService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/topicexplorerhandler", { topic_id : "@topic_id", ishome : "@ishome" }, { "query" : { method : 'GET', cache : cache } });
} ]);

pdapp.factory("TopicLatestService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/topiclatesthandler", { topic_id : "@topic_id", ishome : "@ishome" }, { "query" : { method : 'GET', cache : cache } });
} ]);

pdapp.factory("VisitorAntibodService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/visitorantibodhandler", { topic_id : "@topic_id" }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("VisitorBodService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/visitorbodhandler", { topic_id : "@topic_id" }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("TagCloudService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/tagcloudhandler", { topic_id : "@topic_id" }, { "query" : { method : 'GET', cache : cache } });
} ]);

pdapp.factory("StatementHistoryService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/statementhistoryhandler", { topic_id : "@topic_id", compareid:'@compareid'}, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("ShareHistoryService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/sharehistoryhandler", { topicid : "@topicid", orgid : "@orgid" }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("ShareServerService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/share/generic", { shareid : '@shareid'}, 
	    	{ "query" : { method : 'GET', cache : cache } });
    } ]);

pdapp.factory("VisitorService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("/rest/visitordata", { }, 
	    	{ "query" : { method : 'GET' } });
    } ]);

pdapp.factory("SocialAnalysisService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
	    return resource("", {}, {
	      "toptweettopicmatches" : { method : 'GET', url : '/restpro/toptweettopicmatches', params : { orgid : '@orgid' }, cache : cache },
	      "topconversationkeywords" : { method : 'GET', url : '/restpro/topconversationkeywords', params : { orgid : '@orgid' }, cache : cache }, });
    } ]);

pdapp.factory("ConstituencyAuthorService", [
    "$resource",
    "CacheService",
    function(resource, cache) {
		return resource("", {}, {
			"postcodelocationauthorsearch" : {method : 'GET', url : '/rest/postcodelocationauthorsearch', params : {pcf:'@pcf'}, cache : cache },
			"locationauthorsearch" : {method : 'GET', url : '/rest/locationauthorsearch', params : {conname:'@conname'}, cache : cache }, });
}]);

pdapp.factory("BrandService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/getbrands", { }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("LocationService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/getbrandslocation", { }, { "query" : { method : 'GET' } });
} ]);

pdapp.factory("CampaignService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/getcampaigns", { }, { "query" : { method : 'GET' } });
} ]);
pdapp.factory("MPService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/getpoliticians", { }, { "query" : { method : 'GET' } });
} ]);
pdapp.factory("MPActionService", [ "$resource", "CacheService", function(resource, cache) {
	return resource("/rest/getmpaction", { }, { "query" : { method : 'GET' } });
} ]);
pdapp.factory("CommentService", [ "$resource", "CacheService",
	function(resource, cache) {
	    return resource("", {}, {
	      "saveComment" : { method : 'POST', url : "/rest/comment", params : { reaction : "@reaction",  statementid: "@statementid", comment: "@comment"}},
	      "query" : { method : 'GET', url : "/rest/comment", params : { }} 
	  	});
} ]);
