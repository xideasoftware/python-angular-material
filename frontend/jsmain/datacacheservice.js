
pdapp.service('DataCacheService', ['$q', "EntitiesSummaryServerService", function(q,entitiesSummaryServerService) {
    
    var cachestore = {};
      	
  	this.getsummarycache = function(entitytype){
  			return createcache(entitytype, entitiesSummaryServerService.querylist);
  	}
  	
    var createcache = function(name, agetter) {
        var cachename = name+"summarycache";
        if(!_.has(cachestore,cachename)){
            entityCache = makecache(name, agetter);
            cachestore[cachename]=entityCache;
        }
        return cachestore[cachename];
    };

    var makecache = function(name, agetter) {
        var getter = agetter;
        var defers = {};
        var failures = {};
        
        var prefetch = function(ids) {
            var newids = [];
            angular.forEach(ids, function(id){
                if (_.has(defers, id))
                    return;
                defers[id] = q.defer();
                newids.push(id);
            });
            if(newids.length == 0)
                return;
            var d = {entitytype:name, entityids:newids.join()};
            getter(d, function(res){
                angular.forEach(res, function(v,id){
                    var sid = _.parseInt(id);
                    if(!_.has(defers, sid))
                        return;
                    defers[sid].resolve(v);
                });
            }, function(error){
                angular.forEach(ids, function(id){
                    failures[id] = true;
                    if(!_.has(defers, id))
                        return;
                    defers[id].reject();
                });
            });
        }
        
        var getfuture = function(id) {
            if (!_.has(defers, id))
                this.prefetch([id,]);
            return defers[id].promise;
        }

        return {
            prefetch:prefetch,
            getfuture:getfuture,
        }
    
    }

}
]);
