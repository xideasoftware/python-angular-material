
pdapp.filter('nospace', function() {
	return function(value) {
		return (!value) ? '' : value.replace(/\s+/g, " ");
	};
});

pdapp.filter('maxsmalllength', ['$mdMedia', '$filter', function ($media, $filter) {
    return function (input, maxlength) {
        if ($media('gt-md')) {
            return input;
        } else {
        	if (input.length > maxlength)
            	return input.substring(0, maxlength) +"...";
            else
            	return input;
        };
    };
}]);

pdapp.filter('nicetime', function(){
	var formatter = d3.time.format('%d %b %H:%M');
	return function(value) {
		return formatter(value);
	};
});

//try custom filter

pdapp.filter('choosecategory', function() {
	return function (orgs, currentcategoryselected){
		
	
		var filtered = [];
		for (var i = 0; i < orgs.length; i++){
			var org = orgs[i];
				if (org.category_ids == parseInt(currentcategoryselected)) {
				filtered.push(org);
			}
		}
		return filtered;
	};
});

pdapp.filter('unique', function() {
	   return function(collection, keyname) {
	      var output = [], 
	          keys = [];

	      angular.forEach(collection, function(homeitem) {
	          var key = homeitem[keyname];
	          if(keys.indexOf(key) === -1) {
	              keys.push(key);
	              output.push(homeitem);
	          }
	      });
	      return output;
	   };
	});
