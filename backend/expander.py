
import logging

import webapp2

from common.web import BaseHandler
from config import webapp2config
from data.store import getById
import common
import model


# Create a simple request handler for the login procedure.
class Expander(BaseHandler):
    
    def get(self, shareid):
        share = model.Share.get_by_id(int(shareid))
        sharelink = share.link
        sharelink = sharelink.replace("$shareid$", shareid)
        self.redirect(sharelink, True)

    def doFacebookCrawlResponse(self):
        url = self.request.path
        share = getById(model.Share,url.split("/")[2])
        logging.info("Facebook scanned %s" % share.link)
        title = "My latest PositionDial - see how you match"
        if share.link.startswith("/election2015"):
            title = "My Election 2015 top match - what's yours?"
        ctx = {'url':"http://%s%s" % (self.request.host, share.link), 'title':title, 
               'description':'The PositionDial', 'image':share.imglink, 'site':'PositionDial.com'}
        self.render_template("facebookvisitordialgraph.html", ctx)                               

    def doTwitterCrawlResponse(self):
        url = self.request.path
        share = getById(model.Share,url.split("/")[2])
        ctx = {'url':share.link, 'description':'The PositionDial', 'image':share.imglink, 'site':'PositionDial.com'}
        self.render_template("twittervisitordialgraph.html", ctx)                               
        
    def doGoogleCrawlResponse(self):
        return
    
# Create routes.
ROUTES = [webapp2.Route(r'/d/<:.*>', Expander, handler_method='get'),]


# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)



