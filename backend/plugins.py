import logging
import os
import urlparse

from webapp2_extras import jinja2, sessions
import webapp2

from common.env import isProduction, isAppEngineDeploy, currentVersion
from common.web import BaseHandler, RestHandler
from config import webapp2config
from data.client import getClientMap
from ui.axis import getAllAxis
from ui.topic import getAllTopics
from ui.visitor import generateVisitorData
import appengine_config
import common
import model


class PluginHandler(BaseHandler):
	def verifyClientId(self):
		accesskey = self.requestParam('accesskey')
		client = None
		for k, v in getClientMap().iteritems():
			if v.accesskey == accesskey:
				client = v
				break
		if client is None:
			self.abort(403)
		if not self.request.referer is None:
			logging.debug(self.request.referer)
			parsedreferer = urlparse.urlparse(self.request.referer)
			foundreferer = parsedreferer[1] == 'www.positiondial.com'
			for allowedreferer in client.allowed_referers:
				if allowedreferer != "" and parsedreferer[1] == allowedreferer.strip():
					foundreferer = True
					break
			if not foundreferer:
				self.abort(403)
			referer=self.request.referer.encode('ascii')
		else:
			referer=self.request.url.encode('ascii')
		return (referer, client)

class DialHandler(PluginHandler):
	
	def any(self):
		(referer, client) = self.verifyClientId()
		visitor = self.visitorkey.get()
	
		isloggedin = "false" if (visitor.name is None or visitor.name == "") else "true"
		twitterloggedin = "false" if 'twitterloggedin' not in self.session else "true" if self.session['twitterloggedin'] else "false"
		facebookloggedin = "false" if 'facebookloggedin' not in self.session else "true" if self.session['facebookloggedin'] else "false"
		if isloggedin == "false":
			twitterloggedin = "false"

		self.preloadjson = ""
		self.preloadjson += '\r\n_jsonprecache["visitor"]='+visitor+'["visitor"];\r\n'
			
		idtoaxis = getAllAxis();
		self.preloadjson += '\r\n_jsonprecache["idtoaxis"]='+idtoaxis+'["idtoaxis"];\r\n'
		idtotopic = getAllTopics();
		self.preloadjson += '\r\n_jsonprecache["idtotopics"]='+idtotopic+'["idtotopics"];\r\n'
		
		basecssurl = ("http://cdn.positiondial.com/build/"+str(currentVersion())+"/css/") if isAppEngineDeploy() else "http://%s:34567/css/" % os.environ['SERVER_NAME']
		
		self.render_template('dialplugin.html', {'username':visitor.name, 'referer':referer, 'baseimgurl':baseimgurl,
												'preloadjson':self.preloadjson, 'visitorid':self.visitorkey.id(),
												'isloggedin':isloggedin, 'clientid':client.key.id(), 'basecssurl':basecssurl,
												'twitterloggedin':twitterloggedin, 'facebookloggedin':facebookloggedin })

class TwoSidesHandler(PluginHandler):
	def any(self):
		referer = self.verifyClientId()
		homefeatures = model.HomeFeature.query(model.HomeFeature.featured_in_home == True)
		for homefeature in homefeatures:
			pass
		self.render_template('twosidesplugin.html', 
							name=self.request.get('name'), 
							homefeature = homefeature,
							topic = homefeature.topic.get(),
							axis = homefeature.axis.get(),
							article_left = homefeature.article_left.get(),
							article_right = homefeature.article_right.get(),
							referer=referer, 
							visitorid=self.session["visitorid"])
		
# Create routes.
ROUTES = [	webapp2.Route(r'/plugins/dial', DialHandler, handler_method='any'),
			webapp2.Route(r'/plugins/twosides', TwoSidesHandler, handler_method='any'),	
		]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)

def handle_403(request, response, exception):
	logging.exception(exception)
	referer = ""
	if not request.referer is None:
		parsed = urlparse.urlparse(request.referer)
		referer = parsed[1]
	else:
		parsed = urlparse.urlparse(request.url)
		referer = parsed[1]
	response.write('Could not grant access for plugin to '+referer)
	response.set_status(403)

def handle_404(request, response, exception):
	logging.exception(exception)
	response.write('Oops! I could swear this page was here!')
	response.set_status(404)

def handle_500(request, response, exception):
	logging.exception(exception)
	response.write('A server error occurred!')
	response.set_status(500)

app.error_handlers[403] = handle_403
app.error_handlers[404] = handle_404
app.error_handlers[500] = handle_500
