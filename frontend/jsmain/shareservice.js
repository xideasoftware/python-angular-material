function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';
    var lines = []; 
    var starty = y;   
    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push({'t':line, 'x':x, 'y':y});
            line = words[n] + ' ';
            y += lineHeight;
        } 
        else {
            line = testLine;
        }
    }
    var h = (y - starty) / 2;
    lines.push({'t':line, 'x':x, 'y':y});
    for (var m=0; m < lines.length; m++){
        line = lines[m];   
        context.fillText(line.t, line.x, line.y - h);
    }
    return lines.length;
}

function generateppcjpg(text, image, backimg) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', '955');
    canvas.setAttribute('height', '500');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 955, 5000);
    ctx.globalAlpha=0.7;
    drawimagetocontext(ctx, backimg, 0.7, 0, 0, 955, 500);
    ctx.globalAlpha=1.0;
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.font = "bold 68px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    wrapText(ctx, text, 477.5, 220, 870, 90);
    ctx.textAlign = 'center';
    var dataurl = canvas.toDataURL("image/jpeg", 85);
    canvas.parentNode.removeChild(canvas);
    return dataurl;
}

function generategenericpng(text, logoimage, trophyimg, addagreeordisagree) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', '955');
    canvas.setAttribute('height', '500');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 955, 5000);
    ctx.globalAlpha=1.0;
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.font = "bold 42px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    var linecount = (trophyimg != null)?wrapText(ctx, text, 477.5, 390, 870, 40):wrapText(ctx, text, 477.5, 220, 870, 40);
    ctx.textAlign = 'center';
    if (addagreeordisagree)
    	ctx.fillText("Do you agree or disagree...?", 478, 300 + 20 * linecount);
    if (logoimage != null)
        drawimagetocontext(ctx, logoimage, 1.0, 30, 420, 80, 80);
    if (trophyimg != null)
        drawimagetocontext(ctx, trophyimg, 0.7, 300, 50, 355, 300);
    var dataurl = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);
    return dataurl;
}

function generatestatementpng(text, topic, author, image) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', '955');
    canvas.setAttribute('height', '500');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 955, 5000);
    ctx.globalAlpha=1.0;
    ctx.fillStyle = "white";
    ctx.textAlign = 'center';
    ctx.font = "bold 26px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    var linecount = wrapText(ctx, text + " - " + author, 477.5, 220, 870, 40);
    ctx.textAlign = 'center';
    ctx.fillText("Do you agree or disagree...?", 478, 300 + 20 * linecount);
    drawimagetocontext(ctx, image, 1.0, 30, 420, 80, 80);
    var dataurl = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);
    return dataurl;
}

function getsvghtmlforelement(tagname) {
    var xmlns = "http://www.w3.org/2000/svg";
    var svgArea = document.getElementById(tagname).cloneNode(true);
    var primarynode = svgArea.getElementsByTagName("g")[0].cloneNode(true);
    var transform = document.createAttribute("transform");
    transform.value = "translate(75,25) rotate (0)";
    primarynode.attributes.setNamedItem(transform);
    var chartArea = document.createElementNS(xmlns, 'svg');
    chartArea.setAttribute("viewBox", svgArea.getAttribute("viewBox"));
    chartArea.appendChild(primarynode);
    var labels = chartArea.getElementsByTagName("text");
    angular.forEach(labels, function(label, key) {
        label.className = "";
        label.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif;font-size: 4.0px";
        label.style.fontSize = "4.0px";
    });
    var paths = chartArea.getElementsByTagName("path");
    angular.forEach(paths, function(p, key) {
        p.style.strokeWidth = "0.2px";
        p.style.stroke = "#444444";
    });
    var polylines = chartArea.getElementsByTagName("polyline");
    angular.forEach(polylines, function(p, key) {
        p.style.fill = "none";
        p.style.stroke = "#444444";
        p.style.strokeWidth = "0.2px";
    });
    return chartArea;
}




function generateblockdims(aw, ah, r, tw, th) {
    var ar = ah / aw;
    var h = th;
    var w = tw;
    var ox = 1;
    var oy = 1;
    
    if (ar > r) {
        h = th;
        w = h / ar;
        oy = 0;
        ox = (tw - w) / 2;
    } 
    else if (ar < r) {
        w = tw;
        h = w * ar;
        ox = 0;
        oy = (th - h) / 2;
    }
    return {
        w: w,
        h: h,
        ox: ox,
        oy: oy
    };
}


function drawimagetocontext(ctx, img, ratio, x, y, w, h) {
    if (img instanceof Image) {
        var rimgdims = generateblockdims(img.width, img.height, ratio, w, h);
        ctx.drawImage(img, x + rimgdims.ox, y + rimgdims.oy, rimgdims.w, rimgdims.h);
    } 
    else {
        var svgnode = (img.nodeName == "svg") ? img : img.getElementsByTagName("svg")[0];
        var baseVal = svgnode.getAttribute("viewBox").split(" ");
        var rimgdims = generateblockdims(_.parseInt(baseVal[2]), _.parseInt(baseVal[3]), ratio, w, h);
        var oXmlSerializer = new XMLSerializer();
        var svg2 = oXmlSerializer.serializeToString(svgnode);
        ctx.drawSvg(svg2, x + rimgdims.ox, y + rimgdims.oy, rimgdims.w, rimgdims.h);
    }
}

function generatebadgejpg(header, message, backimg, trophyimg) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', '955');
    canvas.setAttribute('height', '500');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (backimg != null)
    	drawimagetocontext(ctx, backimg, 0.7, 0, 0, 955, 500);
    if (trophyimg != null)
    	if (backimg != null)
        	drawimagetocontext(ctx, trophyimg, 1.0, 200, 100, 555, 300);
        else
        	drawimagetocontext(ctx, trophyimg, 1.0, 350, 50, 255, 255);
    ctx.fillStyle = "white";
    ctx.fillRect(150, 350, 655, 130);
    ctx.strokeStyle = "black";
    ctx.strokeRect(150, 350, 655, 130);
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.font = "normal 50px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    ctx.fillText(header, 955 / 2, 400);
    ctx.font = "bold 50px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(message, 955 / 2, 460);
    var dataurl = canvas.toDataURL("image/jpeg", 85);
    canvas.parentNode.removeChild(canvas);
    return dataurl;
}

function generatematchpng(name, image, percentage, logoimg) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', '955');
    canvas.setAttribute('height', '500');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    drawimagetocontext(ctx, image, 0.8, 60, 135, 450, 200);
    drawimagetocontext(ctx, logoimg, 0.2, 300, 405, 450, 90);
    ctx.textAlign = 'center';
    ctx.font = "normal 140px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    ctx.fillText(percentage, 730, 280);
    ctx.font = "bold 50px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(name, 477, 55);
    var dataurl = canvas.toDataURL("image/png");
    canvas.parentNode.removeChild(canvas);
    return dataurl;
}

function generategamejpg(text, image) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', '955');
    canvas.setAttribute('height', '500');
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    drawimagetocontext(ctx, image, 0.6, 0, -50, 1000, 600);
    ctx.fillStyle = "white";
    ctx.fillRect(150, 350, 650, 130);
    ctx.strokeStyle = "black";
    ctx.strokeRect(150, 350, 650, 130);
    ctx.fillStyle = "black";
    ctx.textAlign = 'center';
    ctx.font = "bold 50px RobotoDraft, Roboto, 'Helvetica Neue', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(text, 500, 430);
    var dataurl = canvas.toDataURL("image/jpeg", 85);
    canvas.parentNode.removeChild(canvas);
    return dataurl;
}

function serialiseDictToURL(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

function deserialiseURLToDict(url) {
    var obj = {};
    if (url.split("?").length == 1)
        return obj;
    var itsplit = url.split("?")[1].split("&");
    for (var i = 0; i < itsplit.length; i++) {
        var kv = itsplit[i].split('=');
        obj[kv[0]] = decodeURIComponent(kv[1] ? kv[1].replace(/\+/g, ' ') : kv[1]);
    }
    return obj;
}

function makesafelink(link) {
    if (link == null)
        return "";
    return _.deburr(_.kebabCase(link.replace('&', 'and')).replace(/[^\w\s-]/gi, ''));
}

function hashtagit(str) {
    if (str == null)
        return "";
    return "#" + str.toLowerCase().trim().replace(/ /g, "").replace('&', 'And').replace(/[^\w\s-]/gi, '');
}

function generateModal(title, content) {
    c = "<md-dialog><div style='background-color:#fff; padding:10px'>";
    c += '<div class="pull-right"><i class="fa fa-times" style="font-size:26px; cursor:pointer; padding-right:4px" ng-click="closemodal()"></i></div>';
    c += '<h2>' + title + '</h2><div style="clear: both;"></div>';
    c += '<div style="height: auto; overflow: hidden;">';
    c += '<div style="text-align: center; width: 96%; padding-left: 10px; padding-right: 10px; padding-bottom: 10px; padding-top: 1px; font-family: Arial; font-size: 0.9em; font-weight:bold; background-color: #fff; margin-top: 6px;">';
    c += content;
    c += '</div></div></div></md-dialog>';
    return c;
}

var cssua = function(n, l, p) {
    var q = /\s*([\-\w ]+)[\s\/\:]([\d_]+\b(?:[\-\._\/]\w+)*)/, r = /([\w\-\.]+[\s\/][v]?[\d_]+\b(?:[\-\._\/]\w+)*)/g, s = /\b(?:(blackberry\w*|bb10)|(rim tablet os))(?:\/(\d+\.\d+(?:\.\w+)*))?/, t = /\bsilk-accelerated=true\b/, u = /\bfluidapp\b/, v = /(\bwindows\b|\bmacintosh\b|\blinux\b|\bunix\b)/, w = /(\bandroid\b|\bipad\b|\bipod\b|\bwindows phone\b|\bwpdesktop\b|\bxblwp7\b|\bzunewp7\b|\bwindows ce\b|\bblackberry\w*|\bbb10\b|\brim tablet os\b|\bmeego|\bwebos\b|\bpalm|\bsymbian|\bj2me\b|\bdocomo\b|\bpda\b|\bchtml\b|\bmidp\b|\bcldc\b|\w*?mobile\w*?|\w*?phone\w*?)/, 
    x = /(\bxbox\b|\bplaystation\b|\bnintendo\s+\w+)/, k = {parse: function(b, d) {
            var a = {};
            d && (a.standalone = d);
            b = ("" + b).toLowerCase();
            if (!b)
                return a;
            for (var c, e, g = b.split(/[()]/), f = 0, k = g.length; f < k; f++)
                if (f % 2) {
                    var m = g[f].split(";");
                    c = 0;
                    for (e = m.length; c < e; c++)
                        if (q.exec(m[c])) {
                            var h = RegExp.$1.split(" ").join("_"), l = RegExp.$2;
                            if (!a[h] || parseFloat(a[h]) < parseFloat(l))
                                a[h] = l
                        }
                } else if (m = g[f].match(r))
                    for (c = 0, e = m.length; c < e; c++)
                        h = m[c].split(/[\/\s]+/), h.length && "mozilla" !== h[0] && (a[h[0].split(" ").join("_")] = h.slice(1).join("-"));
            w.exec(b) ? (a.mobile = RegExp.$1, s.exec(b) && (delete a[a.mobile], a.blackberry = a.version || RegExp.$3 || RegExp.$2 || RegExp.$1, RegExp.$1 ? a.mobile = "blackberry" : "0.0.1" === a.version && (a.blackberry = "7.1.0.0"))) : v.exec(b) ? a.desktop = RegExp.$1 : x.exec(b) && (a.game = RegExp.$1, c = a.game.split(" ").join("_"), a.version && !a[c] && (a[c] = a.version));
            a.intel_mac_os_x ? (a.mac_os_x = a.intel_mac_os_x.split("_").join("."), delete a.intel_mac_os_x) : a.cpu_iphone_os ? (a.ios = a.cpu_iphone_os.split("_").join("."), delete a.cpu_iphone_os) : a.cpu_os ? 
            (a.ios = a.cpu_os.split("_").join("."), delete a.cpu_os) : "iphone" !== a.mobile || a.ios || (a.ios = "1");
            a.opera && a.version ? (a.opera = a.version, delete a.blackberry) : t.exec(b) ? a.silk_accelerated = !0 : u.exec(b) && (a.fluidapp = a.version);
            if (a.applewebkit)
                a.webkit = a.applewebkit, delete a.applewebkit, a.opr && (a.opera = a.opr, delete a.opr, delete a.chrome), a.safari && (a.chrome || a.crios || a.opera || a.silk || a.fluidapp || a.phantomjs || a.mobile && !a.ios ? delete a.safari : a.safari = a.version && !a.rim_tablet_os ? a.version : {419: "2.0.4",417: "2.0.3",
                    416: "2.0.2",412: "2.0",312: "1.3",125: "1.2",85: "1.0"}[parseInt(a.safari, 10)] || a.safari);
            else if (a.msie || a.trident)
                if (a.opera || (a.ie = a.msie || a.rv), delete a.msie, a.windows_phone_os)
                    a.windows_phone = a.windows_phone_os, delete a.windows_phone_os;
                else {
                    if ("wpdesktop" === a.mobile || "xblwp7" === a.mobile || "zunewp7" === a.mobile)
                        a.mobile = "windows desktop", a.windows_phone = 9 > +a.ie ? "7.0" : 10 > +a.ie ? "7.5" : "8.0", delete a.windows_nt
                }
            else if (a.gecko || a.firefox)
                a.gecko = a.rv;
            a.rv && delete a.rv;
            a.version && delete a.version;
            return a
        },
        format: function(b) {
            var d = "", a;
            for (a in b)
                if (a && b.hasOwnProperty(a)) {
                    var c = a, e = b[a], c = c.split(".").join("-"), g = " ua-" + c;
                    if ("string" === typeof e) {
                        for (var e = e.split(" ").join("_").split(".").join("-"), f = e.indexOf("-"); 0 < f; )
                            g += " ua-" + c + "-" + e.substring(0, f), f = e.indexOf("-", f + 1);
                        g += " ua-" + c + "-" + e
                    }
                    d += g
                }
            return d
        },encode: function(b) {
            var d = "", a;
            for (a in b)
                a && b.hasOwnProperty(a) && (d && (d += "\x26"), d += encodeURIComponent(a) + "\x3d" + encodeURIComponent(b[a]));
            return d
        }};
    k.userAgent = k.ua = k.parse(l, p);
    l = k.format(k.ua) + 
    " js";
    n.className = n.className ? n.className.replace(/\bno-js\b/g, "") + l : l.substr(1);
    return k
}(document.documentElement, navigator.userAgent, navigator.standalone);

pdapp.service('ShareService', ["ShareServerService", '$http', '$location', '$mdBottomSheet', '$mdDialog', '$rootScope', '$q', 'pdTopicService', '$cookies', 
function(shareServerService, http, location, mdBottomSheet, mdDialog, rootScope, q, pdTopicService, cookies) {
    
    this.query = shareServerService.query;
    
    this.openfbdialog = function(pic, link, caption, description) {
        var params = {
            'app_id': 1443870575872026,
            'display': 'page'
        };
        params['picture'] = pic;
        params['redirect_uri'] = location.absUrl();
        params['link'] = link;
        params['caption'] = caption;
        params['description'] = description;
        console.log(params['link']);
        var fburl = "https://www.facebook.com/dialog/feed?" + serialiseDictToURL(params);
        window.location.href = fburl;
    }

    var openfbdialog = this.openfbdialog;
    
    this.generatetopicshare = function(topic, provider) {
        var dialsvg = null ;
        try {
            dialsvg = getsvghtmlforelement(rootScope.vistordialelemid);
        } 
        catch (e) {
        }
        
        rootScope.loadimage(pdTopicService.topicimg(topic, 653, 380), function(backimg) {
            var dataurl = generatebadgejpg("Completed Topic", topic.name, backimg, dialsvg);
            var msg = "I completed " + topic.name + " on @PositionDial - see how we match: ";
            var url = "/getyourpositiondial/$shareid$/-/" + topic.id + "/" + makesafelink(topic.name) + "/-1/-";
            if (provider == 'fb')
                sendtofb(msg, url, dataurl, {});
            if (provider == 'tw')
                sendtotw(msg, url, dataurl, {});
        }
        );
    }

    this.sendppcprofiletotw = function(author) {
        rootScope.loadimage(author.authorpic, function(img) {
           	var pngdataurl = generatebadgejpg(author.name, "See profile on PositionDial", null, img);
            var msg = "#GE2015 candidate " + author.name + " " + ((author.twitterurl==null)?"":author.twitterurl) 
            		+ " - How do you match? @PositionDial";
            var url = "/authorppc/-1/-/"+author.id+"/"+makesafelink(author.name);
            sendtotw(msg, url, pngdataurl, {
            });
		});
    }
    
    this.sendppcprofiletofb = function(author) {
        rootScope.loadimage(author.authorpic, function(img) {
           	var pngdataurl = generatebadgejpg(author.name, "See profile on PositionDial", null, img);
            var msg = "General Election 2015 Candidate " + author.name + " - How do you match?";
            var url = "/authorppc/-1/-/"+author.id+"/"+makesafelink(author.name);
            sendtofb(msg, url, pngdataurl, {
            });
        }
        );
    }
    
    this.generategenericshare = function(provider) {
        var dataurl = generategenericpng("Where do you stand?", null, rootScope.logosymbolimg, false);

        var msg = "I completed my @PositionDial - see how we match";
        if(provider == 'fb')
            msg = "I completed my PositionDial - see how we match"
        var url = "/getyourpositiondial";
        if (provider == 'fb')
            sendtofb(msg, url, dataurl, {});
        if (provider == 'tw')
            sendtotw(msg, url, dataurl, {});
    }
    
    var generatestatementshare = function(statement, provider) {
        
        var topic = pdTopicService.gettopic(statement.topic);
        var authorname = (_.has(statement, "author") && _.has(statement.author, "name")) ? statement.author.name : "";
        var dataurl = generatestatementpng(statement.text, topic.name, authorname, rootScope.logosymbolimg);
        var msg = "I've just seen this statement in " + topic.name + " @PositionDial";
        var url = "/getyourpositiondial/$shareid$/-/" + topic.id + "/" + makesafelink(topic.name) + "/-1/-";
        if (provider == 'fb')
            sendtofb(msg, url, dataurl, {});
        if (provider == 'tw')
            sendtotw(msg, url, dataurl, {});
    }
    
    rootScope.$on("sharestatement", function(event, statement, provider) {
        generatestatementshare(statement, provider);
    }
    );
    
    this.sendtotw = function(msg, sharetarget, dataurl, data) {
        if (!twitterloggedin) {
            data = {
                'data': data,
                'msg': msg,
                'sharetarget': sharetarget
            };
            http(
            {
                method: "post",
                url: "/share/generic",
                data: {
                    'dataurl': dataurl,
                    'provider': 'tw',
                    'sharetarget': sharetarget,
                    'data': data
                }
            }).success(
            function(response) {
                var server = location.protocol() + "://" + location.host();
                var searchparams = deserialiseURLToDict(location.absUrl());
                searchparams['twpostid'] = response["id"];
                var ref = location.absUrl().split("?")[0] + "?" + serialiseDictToURL(searchparams);
                window.location.href = server + "/login/tw?referer=" + ref;
            }
            );
            return;
        }
        
        mdBottomSheet.show({
            templateUrl: basepartialurl + "twitterpostsheet.html",
            controller: 'TwitterPostCtrl',
            resolve: {
                'dataurl': function() {
                    return dataurl
                },
                'msg': function() {
                    return msg
                }
            },
        }).then(function(usermsg) {
            posttotw(usermsg, sharetarget, dataurl, data);
        }
        );
    }

    var sendtotw = this.sendtotw;
    
    this.sendtofb = function(msg, sharetarget, dataurl, data) {
        http(
        {
            method: "post",
            url: "/share/generic",
            data: {
                'dataurl': dataurl,
                'provider': 'fb',
                'sharetarget': sharetarget,
                'data': data
            }
        }).success(
        function(response) {
            openfbdialog(response["imglink"], response["link"], '', msg);
        }
        );
    }

    var sendtofb = this.sendtofb;
    
    this.posttotw = function(msg, sharetarget, dataurl, data) {
        var target = 
        http({
            method: "post",
            url: "/share/generictwitter",
            data: {
                'dataurl': dataurl,
                'provider': 'tw',
                'message': msg,
                'sharetarget': sharetarget,
                'data': data
            }
        }).success(
        function(response) {
            mdDialog.show({
                controller: 'defaultPopupCtrl',
                templateUrl: basepartialurl + 'twittersuccesspopup.html'
            });
        }
        );
    }
    var posttotw = this.posttotw;
    
    this.sendmydialtofb = function(msg, sharetarget, dataurl) {
        http(
        {
            method: "post",
            url: "/share/dialshare",
            data: {
                'dataurl': dataurl,
                'provider': 'fb',
                'dialtype': 'visitor',
                'dialid': -1,
                'topicid': -1,
                'clientid': -1,
                'sharetarget': sharetarget
            }
        }).success(
        function(response) {
            openfbdialog(response["imglink"], response["link"], '', msg);
        }
        );
    }

}
]);
