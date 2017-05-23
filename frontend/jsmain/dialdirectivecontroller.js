

pdapp.controller('dialDirectiveCtrl', [ '$http', '$scope', 'DialService', 'StatementService','$sce', '$timeout', '$log', 'AxisService', 'pdTopicService', 
                               function(http, scope, dialService, statementService, sce, timeout, log, axisService, topicService) {
	scope.data = {};
	scope.data.initialised = false;
	scope.loggedin = false;
	scope.dialexpanded = false;
	scope.compareid = -1;
	scope.comparetype = null;
	scope.showall = false;
	scope.breadcrumbs = false;
	scope.diallock = false;
	scope.dialwait = false;
	scope.data.dialstarted = false;
	scope.dialPieData = [];
	scope.activeaxisid = -1;
	scope.activeside = 0;
	scope.detailangle = 0.6;
	scope.side = 'front';
	scope.flipwithcontent = false;
	scope.msgpopover = false;
	scope.msgpoppedover = false;
	scope.maximumsizethreshold = 100000000;
	scope.maximumsizeinother = 0;
	scope.showall = false;
	scope.categories = "";

	scope.$on("selectedcategories", function(event, args){
		scope.categories = args;
		scope.fetchDialData();
	});	

	scope.ismsgpoppedover = function(){
		return scope.msgpoppedover;
	};
	
	scope.popovermsg = function(){
		return scope.msgpoppedover = true;
	};

	scope.axistopics = [];

	scope.loaded = function() {

		scope.data.dialstarted = true;
        if (_.isUndefined(scope.dialtype))
             scope.dialtype = "visitor";
        if (_.isUndefined(scope.dialid))
             scope.dialid = -1;
        if (_.isUndefined(scope.hidelabels))
             scope.hidelabels = false;
        if (_.isUndefined(scope.toplevelonly))
        	 scope.toplevelonly = false;
		log.info("Created Dial ( clientid:"+scope.clientid+", dialtype: "+scope.dialtype+
								", dialid: "+scope.dialid+", topicid:"+scope.topic.id+
								", dialwait: "+scope.dialwait+", diallock:"+scope.diallock+", trending:"+scope.trending+
				")");

			
		scope.dialid = parseInt(scope.dialid);
		scope.dialexpandedtopic = "";
		scope.initTheDial();
	};

	scope.fetchDialData = function() {
		if (!scope.data.dialstarted)
			return;
		if (scope.dialwait)
			return;
		scope.clickClearSlice(null,null);
		if(scope.usefeatured)
			scope.topic = scope.featuredtopic;
		if(!_.isNumber(scope.dialid) || scope.dialid < 0)
			if (scope.dialtype != 'visitor')
				return;
		dialService.query({
			visitorid : -1,
			dialtype : scope.dialtype,
			dialid : scope.dialid,
			topicid : scope.topic.id,
			clientid: scope.clientid,
			trending: scope.trending,
			comparetype: scope.comparetype,
			compareid: scope.compareid,
			categories: scope.categories
		}, function(response) {
			var res = response;

			scope.maximumsizethreshold = 100000000;
			scope.maximumsizeinother = 0;
			scope.updatePositionset(res["positions"]);
			scope.dialwait = false;
		});
	};

	scope.$on('updatedpositionset', function(event, dialtype, dialid, topicid, clientid, comparetype, compareid, trending, positionset) {
		if(!scope.data.dialstarted)
			return;
		//check that positionset update is for the positionset being displayed in this view
		if(dialtype != scope.dialtype)
			return;
		if(dialid !=null && scope.dialid >= 0 && dialid != scope.dialid) 
			return;
		if(topicid !=null && scope.topic.id >= 0 && topicid != scope.topic.id)
			return;
		if(clientid !=null && typeof scope.clientid != 'undefined' && clientid != scope.clientid )
			return;
		if(comparetype !=null && typeof scope.comparetype != 'undefined' && comparetype != scope.comparetype)
			return;
		if(compareid !=null && typeof scope.compareid != 'undefined' && compareid != scope.compareid)
			return;
		if(trending !=null && typeof scope.trending != 'undefined' && trending != scope.trending)
			return;
		scope.clickClearSlice(null,null);
		scope.updatePositionset(positionset);
	});

	scope.flippingdial = false;
	scope.flipdial = function() {
		scope.flippingdial = true;
		scope.side = 'back';
	};

	scope.initTheDial = function(){
		scope.initdial();
		scope.fetchDialData();
	};

	scope.updateTopic = function(topic) {
		if(scope.topic == topic)
			return;
		scope.topic=topic;
		scope.clickClearSlice(null,null);
		scope.updateBreadcrumbs();
		scope.fetchDialData();
	};

	scope.$on('locationInternalChange', scope.clickClearSlice);

	scope.$on('topicchange', function(event, topic) {
		scope.updateTopic(topic);
	});

	scope.$on('dialchange', function(event, dialtype, dialid, topic, clientid, comparetype, compareid) {
		if(!scope.data.dialstarted)
			return;
		if(scope.diallock){
			if (typeof topic != 'undefined'){
				scope.updateTopic(topic);
			};
			return;
		};
		scope.dialwait = false;
		scope.comparetype = comparetype;
		scope.compareid = compareid;
		scope.clientid = clientid;
		if (typeof topic != 'undefined'){
			scope.topic = topic;
		};
		scope.dialtype = dialtype;
		scope.dialid = dialid;
		scope.fetchDialData();
	});

	scope.textualpositiondescription = function(position){
		var wpr = position['weightedpositionround'];
		var axisname = position['axisname'];
		if(wpr == -2)
			return "strongly "+axisname;
		else if(wpr == -1)
			return axisname;
		else if(wpr == 0)
			return "in the Centre";
		else if(wpr == 1)
			return axisname;
		if(wpr == 2)
			return "strongly "+axisname;
		return "";
	};

	scope.initdial = function(){
		var box = scope.dialroot[0][0].viewBox.baseVal;
		scope.width = box.width;
		scope.height = box.height;
		scope.dialsvg = scope.dialroot.append("g");
		scope.starttrans = "translate(" + (scope.width / 2) + "," + (scope.height / 2) + ") rotate (0)"
		scope.dialsvg.attr("transform", scope.starttrans);
		scope.dialsvg.append("g").attr("class", "innercircle");
		scope.dialsvg.append("g").attr("class", "innerslices");
		scope.dialsvg.append("g").attr("class", "outerslices");
		scope.dialsvg.append("g").attr("class", "slicesplit");
		scope.diallabelssvg = scope.dialsvg.append("g").attr("class", "labels");
		scope.diallinessvg = scope.dialsvg.append("g").attr("class", "lines");
		scope.dialsvg.append("g").attr("class", "innercount").attr("transform", "translate(0,1.5)").style('opacity',1);
		scope.dialsvg.append("g").attr("class", "outercount").attr("transform", "translate(0,1.5)").style('opacity',1);
		scope.centercounttext = scope.dialsvg.append("text").attr("class", "centercount");
		scope.dialsvg.append("g").attr("class", "overslices").style("fill","#222");
		scope.dialsvg.append("g").attr("class", "innercircleoverlay");
		scope.centercounttext.attr("transform", "translate(0,1.5)").attr("text-anchor", "middle").style('opacity',1);
		scope.pie = d3.layout.pie().sort(null).value(function(d) {
			return d.value;
		});
		scope.clickcover= scope.dialroot.append("rect").attr("width", scope.height).attr("height", scope.height);
		scope.clickcover.attr("fill-opacity", 0.0).style("display", "none").attr("transform", "translate(-"+(scope.height/10+8)+",0)");
		scope.clickcover.on("click", function(d) {
			scope.clickClearSlice(this, d);
		});
		scope.dialfullcover = scope.dialroot.append("rect").attr("width", scope.height*10).attr("height", scope.height*20);
		scope.dialfullcover.attr("fill-opacity", 0.0).style("display", scope.toplevelonly?"block":"none");
		
		scope.radius = 1.1 * scope.height / 2;
		scope.innerarc = d3.svg.arc().innerRadius(scope.radius * 0.1).outerRadius(scope.radius * 0.40);
		scope.outerarc = d3.svg.arc().innerRadius(scope.radius * 0.40).outerRadius(scope.radius * 0.74);
		scope.innercountarc = d3.svg.arc().innerRadius(scope.radius * 0.33).outerRadius(scope.radius * 0.33);
		scope.outercountarc = d3.svg.arc().innerRadius(scope.radius * 0.64).outerRadius(scope.radius * 0.64);
		scope.textarc = d3.svg.arc().innerRadius(scope.radius * 0.78).outerRadius(scope.radius * 0.78);
		scope.edgearc = d3.svg.arc().innerRadius(scope.radius * 0.74).outerRadius(scope.radius * 0.74);
		scope.overarc = d3.svg.arc().innerRadius(scope.radius * 0.1).outerRadius(scope.radius * 0.74);
		scope.outsidearc = d3.svg.arc().innerRadius(scope.radius * 0.1).outerRadius(scope.radius * 2.2);

		scope.drillScale = d3.scale.linear().domain([0, 8]).range([(0.5 * Math.PI) - 0.16 * Math.PI, (0.5 * Math.PI) + 0.16 * Math.PI]); 
		scope.spacing = 0.08;
		scope.itemouterspacing = 0.04;
		scope.drillarc = d3.svg.arc().innerRadius(scope.radius * 0.80).outerRadius(scope.radius * 1.89)
		.startAngle(function(d,i){
			return scope.drillScale(i+scope.itemouterspacing);
		})
		.endAngle(function(d,i){
			return scope.drillScale(i+1-scope.itemouterspacing);
		});

		scope.proportionarc = d3.svg.arc().innerRadius(scope.radius * 1.84).outerRadius(scope.radius * 1.88)
		.startAngle(function(d,i){
			var themax = d3.max(scope.axistopics, function(d) { 
				return d.topiccount; 
			});
			return scope.drillScale(i+1-scope.spacing-(d.topiccount/themax)*(1-2*scope.spacing));
		})
		.endAngle(function(d,i){
			return scope.drillScale(i+1-scope.spacing);
		});

		scope.proportionarcouter = d3.svg.arc().innerRadius(scope.radius * 1.84).outerRadius(scope.radius * 1.88)
		.startAngle(function(d,i){
			return scope.drillScale(i+scope.spacing);
		})
		.endAngle(function(d,i){
			return scope.drillScale(i+1-scope.spacing);
		});

		scope.innercircle = scope.dialsvg.select(".innercircle").append("circle").attr("r", scope.radius * 0.1).style("fill","#fff");
		scope.innercircleoverlay = scope.dialsvg.select(".innercircleoverlay").append("circle").attr("r", scope.radius * 0.1).style("stroke-width", "0.2px").style("stroke", "#444444").attr("fill-opacity", 0.0);
		scope.innercircleoverlay.on("mouseover", function(d) {
			if(!scope.dialexpanded)	scope.mouseoverSlice(this, d);
		}).on("mouseout", function(d) {
			if(!scope.dialexpanded)	scope.mouseoutSlice(this, d);
		}).on("click", function(d) {
			scope.$emit('parenttopicchangerequest',scope.topic,null,0);
		}
		).style('cursor', 'pointer');

		scope.key = function(d) {
			return d.data.label;
		};	


		scope.detailpath = scope.dialroot.append("g").style('fill-opacity',0);

		scope.backpath = scope.detailpath.append("text").attr("transform", "translate(37,39)");
		scope.backpath.style("text-anchor", "middle");
		scope.backpath.attr('class', 'detailheader').attr('font-size', '.5em' ).text(function(d) { return 'Zoom back out' }); 
		scope.backpath.on("click", function(d) {
			scope.updateTopic(scope.topic);
		}
		).style('cursor', 'pointer');

		scope.detailpath.attr("transform", "translate(" + (scope.width / 4) + "," + (scope.height / 2) + ")");
		scope.detailtitle=scope.detailpath.append("text").attr("class","detailheader").attr('font-size', '.5em' );
		scope.detailtitle.attr("transform", "translate(37,-36)");
		scope.detailtitle.style("text-anchor", "middle");
		scope.detailtitle.text(function(d) {
			return "Topic List";
		});

		scope.detaillist=scope.dialsvg.append("g").attr("class", "detaillist");
		scope.detaillistcover=scope.dialsvg.append("g").attr("class", "detaillistcover");

		var leaveother=scope.dialroot.append("g")
		scope.leaveother = leaveother.append("text").attr("transform", "translate(0,88)").style("text-anchor", "left").attr('class', 'leaveother').style('font-size', '3px' ).style('font-weight', 'bold' );
		scope.leaveother.text("Leave Other Segment").on("click", function(d) {
			scope.maximumsizethreshold = 100000000;
			scope.maximumsizeinother = 0;
			scope.processPositionUpdate();
			scope.updateTopic(scope.topic);
		}).style('cursor', 'pointer').style("display", "none");

		if (scope.breadcrumbs){
			var breadcrumbs = scope.dialroot.append("g")
			scope.pathselectorlabel = breadcrumbs.append("text").attr("transform", "translate(0,3)").style("text-anchor", "left").attr('class', 'breadcrumb').style('font-size', '3px' ).style('font-weight', 'bold' );
			scope.pathselectorlabel.text(function(d) { return 'You are at:' }); 
			scope.pathselectorone = breadcrumbs.append("text").attr("transform", "translate(16,3)").style("text-anchor", "left").attr('class', 'breadcrumb').style('font-size', '3px' ).style('font-weight', 'bold' );
			scope.pathselectorone.text(function(d) { return 'All Topics' }); 
			scope.pathselectorone.on("click", function(d) {
				scope.$emit('parenttopicchange',scope.alltopics);
			}
			).style('cursor', 'pointer');
			scope.pathselectorsep = breadcrumbs.append("text").attr("transform", "translate(32,3)").style("text-anchor", "left").attr('class', 'breadcrumbsep').style("display", "none").style('font-size', '3px' ).style('font-weight', 'bold' );
			scope.pathselectorsep.text(function(d) { return ' > ' }); 
			scope.pathselectortwo = breadcrumbs.append("text").attr("transform", "translate(35,3)").style("text-anchor", "left").attr('class', 'breadcrumb').style("display", "none").style('font-size', '3px' ).style('font-weight', 'bold' );
			scope.pathselectortwo.text(function(d) { return 'My Topic' }); 	
		};
	};

	scope.updateBreadcrumbs = function(){
		if (!scope.breadcrumbs)
			return;
		if (scope.topic.id == -1){
			scope.pathselectorsep.style("display", "none");
			scope.pathselectortwo.style("display", "none");			
		}
		else{
			scope.pathselectorsep.style("display", "block");
			scope.pathselectortwo.style("display", "block");
			scope.pathselectortwo.text(function(d) {			
				return scope.topic.name;
			});
		}
	};

	// chrome hack - remove?
	scope.resizedial = function(){
		try {
			var h = scope.dialroot[0][0].height.baseVal.value;
			var w = scope.dialroot[0][0].width.baseVal.value;
			var newHeight=parseInt(w  * 0.6);
			if (newHeight > 400)
				newHeight = 400;
			if (newHeight > 0 && newHeight!=h)
				scope.dialroot.style('height', newHeight + 'px');
			setTimeout(scope.resizedial, 50);
		}
		catch (err){}
	};

	scope.updatePositionset = function(positionUpdate){
		scope.data.initialised = true;
		scope.positionupdate = positionUpdate;
		scope.data.haspositions = !_.isEmpty(scope.positionupdate);
		if(scope.dialtype == "visitor"){
			scope.data.showinstructions = !scope.data.haspositions;
			scope.data.showdial = scope.data.haspositions;
			scope.data.hideblank = true;
		}
		else{
			scope.data.showinstructions = !scope.data.haspositions;
			scope.data.showdial = scope.data.haspositions;
			scope.data.hideblank = scope.data.haspositions;
		}
		scope.processPositionUpdate();
		scope.processTextualPositionUpdate();
		scope.updateBreadcrumbs();
	};

	scope.textualpositions = [];

	scope.processTextualPositionUpdate = function(){
		var positions = [];
		var ipositions = [];
		scope.hasoneincenter = false;
		angular.forEach(scope.positionupdate, function(p, axisid){
			if(!_.has(axisService.idtoaxis,axisid) )
			  return;					
          	var total = p[0]+p[-1]+p[-2]+p[1]+p[2];
          	var wpr = (p[-1]*-1.0+p[-2]*-2.0+p[1]*1.0+p[2]*2.0)/total;
          	if(wpr > 1.0) wpr = 2;
          	else if(wpr > 0.25) wpr = 1;
          	else if(wpr < -1.0) wpr = -2;
          	else if(wpr < -0.25) wpr = -1;
          	else wpr = 0;
			var wp={	"weightedpositionround":wpr, 
								"center":p[0],
								"total":total};
          	if(wpr>0)
              wp["axisname"]=axisService.idtoaxis[axisid].label_2;
            else if (wpr <0)
              wp["axisname"]=axisService.idtoaxis[axisid].label_1;
            else
              wp["axisname"]="in the Center";
          	this.push(wp);
		},ipositions);	
      	_.sortBy(ipositions, 'total').reverse();
		angular.forEach(ipositions, function(p, axisid){
			if(p["weightedpositionround"]!=0)		  
          		this.push(p);
          	else if(!scope.hasoneincenter){
          		this.push(p);
              	scope.hasoneincenter = true;
            }
        },positions);
      	scope.textualpositions = positions;
      	
	};

	scope.processPositionUpdate = function(){

		var axispositions = scope.positionupdate ;
		var positions = {};
		var centrecount = 0;
		scope.hidelabels = false;
		angular.forEach(axispositions, function(p, axisid){
			if(axisid > 10000){
				scope.hidelabels = true;
				scope.diallabelssvg.style('display','none');
				scope.diallinessvg.style('display','none');
				scope.dialfullcover.style('display','block');
			}
			if(axisid < 10000 && !_.has(axisService.idtoaxis,axisid)){
				log.debug("Missing axis "+axisid);
				return;
			}	
			var themax = _.max(p);
			var pn2=p[-2];
			var pn1=p[-1];
			var p1=p[1];
			var p2=p[2];
			if (pn2==themax)
				pn2=0-pn2;
			if (pn1==themax)
				pn1=0-pn1;
			if (p1==themax)
				p1=0-p1;
			if (p2==themax)
				p2=0-p2;
			positions[""+-1*axisid]=[pn1,pn2]; 
			positions[""+axisid]=[p1,p2];  
			centrecount+=p[0];
		});
		scope.drawdialsvg(positions, centrecount);

	};
	
	scope.otheraxisid = 189714987;
	scope.positions = {};
	scope.ccount = 0;
	scope.totalWeight = 0;
	
	scope.drawdialsvg = function(positions, ccount) {
		if (_.isEmpty(positions))
			return;
		// calculate total slices to display and total weight
		var positionWeights = [];
		var weightTotal = 0;
		scope.ccount = ccount;
		var minoritylimit = 0.30;
		var nonZeroWeights = 0;
		// get starting weights and
		var positionKeys = Object.keys(positions);
		for (var pizza = 0; pizza < positionKeys.length; pizza += 1) {
			var segments = positions[positionKeys[pizza]];
			var sliceNumThis = 0;
			for (var seg = segments.length; seg > 0; seg -= 1) {
				var dc = "" + segments[seg - 1];
				sliceNumThis += Math.abs(dc);
			}
			//zero slice if too big to display
			if(sliceNumThis > scope.maximumsizethreshold)
				sliceNumThis = 0;
			positionWeights[pizza] = sliceNumThis;
			weightTotal += sliceNumThis;
			if(sliceNumThis>0)
				nonZeroWeights++;
		}
		// filter to non zero positions and colourize
		var otherWeight = 0;
		var minorityPositionThreshold = weightTotal/16;
		var otherMinimumThreshold = weightTotal/48;
		var positionData = {};
		var popPositionData = {};
		var positionLabels = [];
		var otherInner = 0;
		var otherOuter = 0;
		var otherInnerChanged = 0;
		var otherOuterChanged = 0;
		var i = 0;
		var changedinneridx = [];
		var changedouteridx = [];
		scope.maximumsizeinother = 0;
		for (var pizza = 0; pizza < positionKeys.length; pizza += 1) {
			if(!positionWeights[pizza] > 0)
				continue;
			var segments = positions[positionKeys[pizza]];
			var innerChanged = true;
			var outerChanged = true;
			if(_.has(scope.positions, positionKeys[pizza])){
				var oldSegments = scope.positions[positionKeys[pizza]];
				if(oldSegments[0] == segments[0])
					innerChanged = false;
				if(oldSegments[1] == segments[1])
					outerChanged = false;
			}
			if(positionWeights[pizza] < minorityPositionThreshold) {
				otherWeight += positionWeights[pizza];
				otherInner += Math.abs(segments[0]);
				otherOuter += Math.abs(segments[1]);
				if(innerChanged) otherInnerChanged = true;
				if(outerChanged) otherOuterChanged = true;
				// keep track of largest slice in other
				if(scope.maximumsizeinother < positionWeights[pizza])
					scope.maximumsizeinother = positionWeights[pizza];
				continue;
			}

			var d = {};
			var posKey = parseInt(positionKeys[pizza]);
			d['axisid'] = Math.abs(posKey);
			d['side'] = (posKey < 0)?-1:1;
			var axissidelabel = (scope.hidelabels)?""+posKey:(posKey < 0)?(axisService.idtoaxis[-1*posKey].label_1):(axisService.idtoaxis[posKey].label_2);
			d['label'] = positionLabels[i] = axissidelabel;
			d['value'] = positionWeights[pizza];
			d['inner'] = "" + Math.abs(segments[0]);
			d['outer'] = "" + Math.abs(segments[1]);
			d['innerColor'] = (segments[0] < 0) ? "#df0000" : "#FFFFFF";
			d['outerColor'] = (segments[1] < 0) ? "#df0000" : "#FFFFFF";
			positionData[axissidelabel] = d;
			var f = angular.copy(d);
			if(innerChanged){
				changedinneridx.push(axissidelabel);
				f['innerColor'] = "#222";
				f['value'] = 1.5*d['value'];
			}
			if(outerChanged){
				changedouteridx.push(axissidelabel);
				f['outerColor'] = "#222";
				f['value'] = 1.5*d['value'];
			}
			popPositionData[axissidelabel] = f;
			i = i + 1;
		}
		
		scope.totalWeight = 0;
		angular.forEach(positionData, function(value, key){
			scope.totalWeight += value.value;
		});

		scope.positions = positions;
		if(otherWeight > 0){
			if(otherWeight> minorityPositionThreshold){ otherWeight = minorityPositionThreshold};
			if(otherWeight< otherMinimumThreshold){ otherWeight = otherMinimumThreshold};
			positionLabels.push("Other");
			var otherd = {'axisid':scope.otheraxisid, 'label':'Other', 'value':otherWeight, 'innerColor':'#ffffff', 'outerColor':'#ffffff', 'inner':otherInner, 'outer':otherOuter};
			positionData["Other"] = otherd;
			var othere = angular.copy(otherd);
			if (otherInnerChanged){
				changedinneridx.push("Other");
				othere['value'] = 1.5*otherWeight;
				othere['innerColor'] = "#222";
			}
			if (otherOuterChanged){
				changedouteridx.push("Other");
				othere['value'] = 1.5*otherWeight;
				othere['outerColor'] = "#222";
			}
			popPositionData["Other"] = othere;
		};

		// build d3js structures
		var labels = d3.scale.ordinal().domain(positionLabels).domain();
		var data = labels.map(function(label) {
			return positionData[label];
		});
		var popData = labels.map(function(label) {
			return popPositionData[label];
		});
		scope.dialPieData = data;
		// popData is temporary, don't store it as the dial data
		scope.updatedial(popData, changedinneridx, changedouteridx, scope.ccount);
		setTimeout(function(){ scope.updatedial(data, [],	[], scope.ccount); },1000);

	};

	scope.setsegmenttransition = function(svgelement, relativeto, isexpandslice, isoverslice){
		var trans = svgelement.transition().duration(1000).attrTween("d", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				return relativeto(interpolate(t));
			};
		}).style("fill-opacity",function(d) {
			if(isoverslice){
				if(d.data.label != scope.dialexpandedtopic && d.data.label != ""){
					return 0.0;    	
				}
				return 1.0;
			}
		})
		.each('end',function(d) {
			if(scope.dialexpanded)
				if(d.data.label == scope.dialexpandedtopic)
					scope.clickSliceRotate(d);
			scope.clickcover.style("display", scope.dialexpanded?"block":"none");
		});
		if(isoverslice && !scope.dialexpanded && scope.dialexpandedtopic != ""){
			svgelement.style("fill-opacity",function(d) {
				if(d.data.label != scope.dialexpandedtopic && d.data.label != ""){
					return 0.0;    	
				}
				return 1.0;
			});
			trans.transition().delay(2000).duration(2000).style("fill-opacity",0).each('end',function(d) {;
			scope.dialexpandedtopic = "";
			scope.clickcover.style("display", scope.dialexpanded?"block":"none");
			});
		};
		if(1==1)
			return;
		trans.transition().delay(1500).duration(1500).attrTween("d", function(d) {
			this._current = this._current || d;			
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			if(d.data.label != scope.dialexpandedtopic)
				return function(t) {
				return relativeto(interpolate(t));
			};		
			return function(t) {
				return scope.outsidearc(interpolate(t));
			};
		}).style("fill-opacity",function(d) {
			if(d.data.label != scope.dialexpandedtopic || !scope.dialexpanded){
				return 0.0;    	
			}
			return 1.0;
		}).style("display",function(d) {
			if(d.data.label != scope.dialexpandedtopic || !scope.dialexpanded)
				return "none";
			return "block";
		});
	};

	scope.updatedial = function (data, changedinneridx, changedouteridx, ccount) {
		scope.changedinneridx = changedinneridx;
		scope.changedouteridx = changedouteridx;
		var svg = scope.dialsvg;
		var piedata = scope.pie(data);
		var innerslice = svg.select(".innerslices").selectAll("path.innerslices").data(piedata, scope.key);
		innerslice.enter().insert("path").attr("class", "innerslices").style("fill", function(d) {
			return d.data.innerColor;
		});

		innerslice.style("fill", function(d) { return d.data.innerColor; });

		scope.setsegmenttransition(innerslice,scope.innerarc,false,false);
		innerslice.exit().remove();

		var outerslice = svg.select(".outerslices").selectAll("path.outerslices").data(piedata, scope.key);
		outerslice.enter().insert("path").style("fill", function(d) {
			return d.data.outerColor;
		}).attr("class", "outerslices");
		outerslice.style("fill", function(d) {
			return d.data.outerColor;
		});
		scope.setsegmenttransition(outerslice,scope.outerarc,false,false);
		outerslice.exit().remove();
		var overslice = svg.select(".overslices").selectAll("path.overslices").data(piedata, scope.key);
		overslice.enter().insert("path").attr("fill-opacity", 0.0).attr("fill", "#fff").attr("class", "overslices").on("mouseover", function(d) {
			if(!scope.dialexpanded)	scope.mouseoverSlice(this, d);
		}).on("mouseout", function(d) {
			if(!scope.dialexpanded)	scope.mouseoutSlice(this, d);
		}).on("click", function(d) {
			if(d.data.label=="Other"){
				scope.maximumsizethreshold = scope.maximumsizeinother;
				scope.processPositionUpdate();
				return;
			}
			scope.clickSlice(this, d);
		});
		scope.setsegmenttransition(overslice,scope.overarc,false,true);
		overslice.exit().remove();
		var polyline = svg.select(".lines").selectAll("polyline").data(piedata, scope.key);
		polyline.enter().append("polyline");
		polyline.transition().duration(1000).attrTween("points", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = scope.textarc.centroid(d2);
				pos[0] = scope.radius * 0.76 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [ scope.edgearc.centroid(d2), scope.textarc.centroid(d2), pos ];
			};
		});
		polyline.exit().remove();
		var text = svg.select(".labels").selectAll("text").data(piedata, scope.key);
		text.enter().append("text").attr("dy", ".35em").attr("class", "labels").text(function(d) {
			return d.data.label;
		});
		text.transition().duration(1000).attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = scope.textarc.centroid(d2);
				pos[0] = scope.radius * (midAngle(d2) < Math.PI ? 0.77 : -0.77);
				return "translate(" + pos + ")";
			};
		}).styleTween("text-anchor", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start" : "end";
			};
		});
		text.exit().remove();
		var outerText = svg.select(".outercount").selectAll("text").data(piedata, scope.key);
		outerText.enter().append("text").attr("class", "outercount").text(function(d) {
			return d.data.outer;
		});
		outerText.text(function(d) {
			return d.data.outer;
		}).style("fill", function(d) {
			if(_.contains(scope.changedouteridx, d.data.label))
				return "#fff";
			else
				return "#000";
		});
		outerText.transition().duration(1000).attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = scope.outercountarc.centroid(d2);
				return "translate(" + pos + ")";
			};
		}).style("text-anchor", "middle");
		outerText.exit().remove();
		var innerText = svg.select(".innercount").selectAll("text").data(piedata, scope.key);
		innerText.enter().append("text").attr("class", "innercount").text(function(d) {
			return d.data.inner;
		});
		innerText.text(function(d) {
			return d.data.inner;
		}).style("fill", function(d) {
			if(_.contains(scope.changedinneridx, d.data.label))
				return "#fff";
			else
				return "#000";
		});
		innerText.transition().duration(1000).attrTween("transform", function(d) {
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = scope.innercountarc.centroid(d2);
				return "translate(" + pos + ")";
			};
		}).style("text-anchor", "middle");
		innerText.exit().remove();
		scope.centercounttext.text(function(d) {
			return (ccount > 0) ? ("" + ccount) : "";
		});
		
		scope.leaveother.style("display", (scope.maximumsizethreshold < 10000000)?"block":"none");
	};

	scope.mouseoverSlice = function(target, d) {
		d3.select(target).style("stroke-width", "0.5px");
		d3.select(target).style("stroke", "black");
	}

	scope.mouseoutSlice = function(target, d) {
		d3.select(target).style("stroke-width", "0.2px");
		d3.select(target).style("stroke", "#444444");
	}

	scope.clickSlice = function(target, d) {
		if (!((scope.dialtype=="orgfollowers") || (scope.dialtype=="visitor") || (scope.dialtype=="visitoragg") || (scope.dialtype=="friend") || 
			(scope.dialtype=="party") || (scope.dialtype=="authormp") || (scope.dialtype=="org") || (scope.dialtype=="entity") || (scope.dialtype=="authorppc")))
			return;
		if(scope.dialexpanded)
			return;
		if(scope.hidelabels){
			
			return;
		}
		scope.dialexpanded = true;
		scope.dialexpandedtopic = d.data.label;
		var e = d3.select(target);
		var topictitle = d.data.label;
		var axisid = d.data.axisid;
		var drilledPieData = angular.copy(scope.dialPieData);
		var atarget = _.find(drilledPieData, function(s){ return s.label == topictitle });
		if (scope.totalWeight > d.data.value)
			atarget.value = (scope.totalWeight-d.data.value)*(scope.detailangle/(Math.PI-scope.detailangle));
		scope.updatedial(drilledPieData, [],	[], scope.ccount);
		scope.detailtitle.text(function(d) {return topictitle;});		
		scope.diallabelssvg.transition().duration(500).style('opacity',0);
		scope.diallinessvg.transition().duration(500).style('opacity',0);
		scope.detaillist.transition().delay(1).duration(1).style("display","none").style('fill-opacity',0.0).style('opacity',0.0);
		scope.detaillistcover.transition().delay(1).duration(1).style("display","none").style('fill-opacity',0.0).style('opacity',0.0);
		scope.drilldial(axisid, d.data.side);
	}

	scope.rotationoffset = 0;
	scope.clickSliceRotate = function(d) {
		scope.endtrans = "translate(" + (5+ scope.width / 4) + "," + (scope.height / 2) + ") rotate (" + (90-180*midAngle(d)/Math.PI)+ ")";
		scope.detaillist.attr("transform","rotate (" + (-1*(90-180*midAngle(d)/Math.PI))+ ")");
		scope.detaillistcover.attr("transform","rotate (" + (-1*(90-180*midAngle(d)/Math.PI))+ ")");
		scope.dialsvg.transition().duration(1500).attrTween("transform", scope.rotatedialtween);
		scope.detailpath.transition().delay(1250).duration(500).style("display","block").style('fill-opacity',1.0).style('opacity',1.0);
		scope.detaillist.transition().delay(1250).duration(500).style("display","block").style('fill-opacity',1.0).style('opacity',1.0);
		scope.detaillistcover.transition().delay(1250).duration(500).style("display","block").style('fill-opacity',1.0).style('opacity',1.0);
	}

	scope.drilldial = function(axisid,side) {
		scope.activeaxisid=axisid;
		scope.activeside=side;
		statementService.drillstats({
			dialtype : scope.dialtype,
			dialid : scope.dialid,
			topicid : scope.topic.id,
			axisid : axisid,
			clientid: scope.clientid,
			side : side
		}, function(response) {			
			var res = response;
			var axistopics = [];
			for (n in res["topics"]){
				var e=res["topics"][n];
				if(_.has(topicService.idtotopics, e["id"]))
					axistopics.push(e);
			}
			scope.axistopics = axistopics;
			scope.updatedetail(axisid);
		});
	};

	scope.updatedetail = function(axisid){
		if(!scope.dialexpanded){
			scope.clickClearSlice(null,null);
			console.log("dial wasn't expanded");
			return;
		};
		if(scope.activeaxisid != axisid){
			console.log("axis id's didn't match between "+scope.activeaxisid+" and "+axisid);
			scope.clickClearSlice(null,null);
			return;
		};
		var svg = scope.dialsvg;

		var detaillist = svg.select(".detaillist").selectAll("g").data(scope.axistopics, function(d) {
			return d.id;
		});
		var bar = detaillist.enter().append("g");
		bar.attr("class", "detaillistitem")
		barHeight = 5;
		var barback = bar.append("path");
		barback.attr("d", scope.drillarc)
		.attr("id", function(d, i) { return "detaillistarc" + i; })
		.style("fill", "#888888")
		.style("fill-opacity", 1.0)
		.style("stroke-width", "0.0");
		bar.append("text")
		.attr("dy", "0.35em")
		.attr("class", "labels")
		.style("fill", "#ffffff")
		.attr("transform",function(d, i) { 
			var angle = (180/Math.PI)*(scope.drillScale(0.5+i)-(0.5 * Math.PI));
			return "translate(41 0) rotate ("+angle+" -41 0)"}
		)
		.style("text-transform","capitalize")
		.style("text-anchor","start")
		.text(function(d) { return topicService.idtotopics[d.id]["name"]});
		bar.append("path")
		.attr("d", scope.proportionarcouter)
		.attr("class", "detaillist")
		.attr("id", function(d, i) { return "detaillistarcprogress" + i; })
		.style("stroke-width", "0.0")
		.style("fill", "#ffffff")
		.style("fill-opacity", 1.0);
		bar.append("path")
		.attr("d", scope.proportionarc)
		.attr("class", "detaillist")
		.attr("id", function(d, i) { return "detaillistarcprogress" + i; })
		.style("stroke-width", "0.0")
		.style("fill", "#df2000")
		.style("fill-opacity", 1.0);
		detaillist.exit().remove();

		var detaillistcover = svg.select(".detaillistcover").selectAll("path").data(scope.axistopics, function(d) {
			return d.id;
		});
		var barover = detaillistcover.enter().append("g");
		barover.append("path")
		.attr("d", scope.drillarc)
		.attr("id", function(d, i) { return "detaillistarcover" + i; })
		.style("fill-opacity", 0.2)
		.style("fill", "#ffffff")
		.style("opacity", 0)
		.style("stroke-width", "0.4px")
		.style("stroke", "#222222")
		.style("cursor", "hand")
		.on("mouseover", function(d) {
			d3.select(this).style("opacity", 1);
		}).on("mouseout", function(d) {
			d3.select(this).style("opacity", 0);
		})
		.on("click", function(d) {
			scope.$emit('parenttopicchangerequest',topicService.idtotopics[d.id],scope.activeaxisid,scope.activeside);
			scope.$emit('parenttopicchange',topicService.idtotopics[d.id]);
		})
		detaillistcover.exit().remove();
	};

	scope.clickClearSlice =function(target, d) {
		try{
			if (scope.diallabelssvg.style('opacity') != "1")
				scope.diallabelssvg.transition().delay(1750).duration(500).style('opacity',1);
		}
		catch (e){
			return;
		}
		if (scope.diallinessvg.style('opacity') != "1")
			scope.diallinessvg.transition().delay(1750).duration(500).style('opacity',1);
		var wasexpanded= scope.dialexpanded;
		scope.dialexpanded = false;
		scope.updatedial(scope.dialPieData, [],	[], scope.ccount);
		scope.dialsvg.select(".overslices").selectAll("path.overslices").style("stroke-width","0.2px");
		if (!wasexpanded){
			scope.dialsvg.transition().duration(1).attrTween("transform", scope.rotatedialtweenback);
			scope.detailpath.transition().duration(1).style('fill-opacity',0).transition().style("display","none");		
			return;
		}
		scope.dialsvg.transition().delay(250).duration(2000).attrTween("transform", scope.rotatedialtweenback);
		scope.detailpath.transition().duration(500).style('fill-opacity',0).style('opacity',0).transition().delay(500).style("display","none");
		scope.detaillist.transition().duration(500).style('fill-opacity',0).style('opacity',0).transition().delay(500).style("display","none");
		scope.detaillistcover.transition().duration(500).style('fill-opacity',0).style('opacity',0).transition().delay(500).style("display","none");
	}

	scope.rotatedialtween = function rotatedialtween(d, i, a) {
		return d3.interpolateString(scope.starttrans, scope.endtrans);
	}

	scope.rotatedialtweenback = function rotatedialtween(d, i, a) {
		return d3.interpolateString(scope.endtrans, scope.starttrans);
	}


}]);



