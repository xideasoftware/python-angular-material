

pdapp.controller('buzzCtrl', [ 'SocialAnalysisService','$scope', '$rootScope', '$log', '$http', '$routeParams', '$location', '$route', 'modalService',
    function(socialAnalysisService, scope, rootScope, log, http, routeParams, location, route, modal) {

    	socialAnalysisService.topconversationkeywords({
			"orgid" : routeParams['orgId']
		}, function(response) {
			var res=response;
    		scope.buzzdata = res["topconversationkeywords"];
			scope.maxvalue=_.max(_.map(scope.buzzdata, function(te) { return te.value }));
			scope.colordomain=_.map([0.16,0.24,0.36,0.49,0.64,0.81], function(x){return x*scope.maxvalue});
			scope.tagcloudcolor = d3.scale.linear().domain(scope.colordomain).range(scope.colorrange);
			scope.tagcloudaltcolor = d3.scale.linear().domain(scope.colordomain).range(scope.altcolorrange);
			scope.fontratio = 0.3*_.max([scope.width,scope.height])/scope.maxvalue;
	    	d3.layout.cloud().size([scope.width, scope.height]).words(scope.buzzdata)
	    		.padding(0.5).rotate(function() {
		    	return ~~(Math.random() * 2) * 0;
	    	}).text(function(d) { 
		    	return d.label; 
			}).fontSize(function(d) {
		    	var a=scope.fontratio * d.value;
		    	a=(a < 2)?2:a;
		    	a=(a > 20)?24:a;
		    	return a;
	    	}).on("end", scope.drawcloud).start();
	    });

		scope.colorrange=["#222","#333", "#444", "#555", "#666", "#777", "#888"];
		scope.altcolorrange=["#522", "#622", "#733", "#844", "#944", "#b55", "#d55"];


	    scope.thechart = d3.select('#buzzChart svg');
	    var box = scope.thechart[0][0].viewBox.baseVal;
	    scope.width = box.width;
	    scope.height = box.height;

	    scope.drawcloud = function(words) {
		    scope.chartroot = scope.thechart.append("g");
		    scope.starttrans = "translate(" + (scope.width / 2) + "," + (scope.height / 2) + ") rotate (0)"
		    scope.chartroot.attr("transform", scope.starttrans);
			scope.chartroot.selectAll("text").data(words)
			.enter()
			.append("text").style("font-size", function(d) {
			    return d.size + "px";
		    }).style("font-family", "'bebas_neueregular', Impact, Charcoal, sans-serif")
		    .style("fill", function(d,i){
		    	return (~~(Math.random() * 2))==1?scope.tagcloudcolor(d.value):scope.tagcloudaltcolor(d.value); 
		    })
		    .attr("text-anchor", "middle")
		    .attr("transform", function(d) {
			    return "translate(" + [ d.x, d.y ] + ")rotate(" + d.rotate + ")";
		    }).text(function(d) {
			    return d.text;
		    });
	    }

    } ]);

