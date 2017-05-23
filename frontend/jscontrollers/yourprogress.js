pdapp.controller('yourprogressCtrl', [ 'StatementService', 'ArticleService', '$scope', '$rootScope', '$log', '$http', '$routeParams', '$location', '$route', 'modalService',
                                        function(statementService, articleService, scope, rootScope, log, http, routeParams, location, route, modal) {


	scope.topicids = [];
	scope.statementprogressloaded = false;
	scope.articleprogressloaded = false;
	scope.topic = scope.alltopics;

	scope.$on('parenttopicchange2', function(event, topic){
		scope.topicids = [topic.id,];
		scope.topic = topic;
		scope.query();
		scope.$broadcast('topicchange',scope.topic);
	});

	scope.loaded = function(){ scope.query()};

	scope.query = function() {
		scope.totalprogress = [];
		statementService.drillvotes({
			dialtype : 'visitor',
			topicid : scope.topicids,
			history : true,
		}, function(response) {
			scope.statementprogress = [];
			angular.forEach(response["statements"], function(s, key){ 
				s['link']=topic.safelink+'?statementid='+s.id+'&statementtext='+scope.makesafelink(s.text.substring(0,100));
				s['cummulation']=this.length+1;
				s['kleos']=1;
				this.push(s);
				scope.totalprogress.push(_.clone(s));
			},scope.statementprogress);
			if(!_.isEmpty(scope.statementprogress)){
				zeroth = {'time':scope.statementprogress[0].time-10000, 'cummulation':0, 'kleos':0};
				scope.statementprogress.unshift(zeroth);
				scope.totalprogress.push(_.clone(zeroth));
			};
			scope.statementprogress.push({'time':new Date().getTime(), 'cummulation':scope.statementprogress.length, 'kleos':0});
			scope.statementprogressloaded = true;
			scope.updateTimeseries();
		});

		articleService.readarticles({
			topicid : scope.topicids,
		}, function(response) {
			scope.articleprogress = [];
			angular.forEach(response["articlesread"], function(a, key){ 
				if (a["headline"] == null)
				  	return;
				a["headline"] = scope.fixheadline(a.headline);
				a["urllink"] = "/article/" + a.article_id + "/" + a.firsttopic + "/" + a.firstaxis + "/" + scope.makesafelink(a.headline);
				if (a.onsite == false) {
					scope.offsitelinks[a.article_id] = a.link;
				};
				a['cummulation']=this.length+1;
				a['kleos']=1;
				this.push(a);
				scope.totalprogress.push(_.clone(a));
			},scope.articleprogress);
			if(!_.isEmpty(scope.articleprogress)){
				zeroth = {'time':scope.articleprogress[0].time-10000, 'cummulation':0, 'kleos':0};
				scope.articleprogress.unshift(zeroth);
				scope.totalprogress.push(_.clone(zeroth));
			};
			scope.articleprogress.push({'time':new Date().getTime(), 'cummulation':scope.articleprogress.length, 'kleos':0})
			scope.articleprogressloaded = true;
			scope.updateTimeseries();
		});
		
	};

	scope.updateTimeseries = function(){
		if(!scope.statementprogressloaded || !scope.articleprogressloaded)
			return;
		scope.totalkleos = [];
		scope.totalkleoscum = 0;
		angular.forEach(_.sortBy(scope.totalprogress,'time'), function(t, key){ 
			scope.totalkleoscum+=t.kleos;
			t['cummulation']=scope.totalkleoscum;
			this.push(t);
		},scope.totalkleos);
		scope.totalkleos.push({'time':new Date().getTime(), 'cummulation':scope.totalkleos.length})

		scope.ts = [ { key : "Position Responses", values : scope.statementprogress, color: '#7777ff', area: false },
					{ key : "Article Reads", values : scope.articleprogress, color: '#77ff77', area: false },
		];
		scope.drawchart();
	}

	scope.drawchart = function(){
		nv.addGraph(function() {
			scope.chart = nv.models.lineChart();
			scope.chart.margin({left: 80, right:50, bottom:50});  
			scope.chart.useInteractiveGuideline(true);  
			scope.chart.transitionDuration(250);  
			scope.chart.showLegend(true);       
			scope.chart.showYAxis(true);       
			scope.chart.showXAxis(true);     
			scope.chart.x(function(d) { 
				return d.time; 
			});
			scope.chart.y(function(d) { 
				return d.cummulation; 
			});

			scope.chart.xAxis
			.axisLabel('Timeline')
			.tickFormat(function(d) {
				return d3.time.format(' %d %b %H:%M ')(new Date(d));
			});

			scope.chart.yAxis
			.axisLabel('Kleos')
			.tickFormat(d3.format('d'));

			d3.select('#progressChart svg').datum(scope.ts).call(scope.chart);

			nv.utils.windowResize(scope.chart.update);

			return scope.chart;
		});
	};

	scope.loaded();
}]);

