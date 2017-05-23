
from datetime import datetime
import json
import logging

from google.appengine.ext import ndb
from twitter import Twitter, OAuth
import webapp2

from config import CONFIG, VISITORTRANSACTIONRETRIES
from config import webapp2config
from data.store import getById
from data.visitor import makefriendIfNeeded
from ui.share import getShareData
import model


from common.web import, RestHandler


class ShareHandler(RestHandler):

    def createShareFromPost(self):
        (sharekey, last) = model.Share.allocate_ids(1)
        posted = json.loads(self.request.body)
        sharetarget = posted["sharetarget"]
        dataurl = posted["dataurl"]
        data = posted["data"] if "data" in posted else None 
        imglink = "http://%s/shareimage/%s" % (self.request.host, sharekey)
        sharelink = "http://%s/d/%s" % (self.request.host, sharekey)
        share = model.Share(id=sharekey, imagedataurl=dataurl, link=sharetarget, imglink=imglink, visitor=self.visitorkey, data=data)
        share.put()
        return (sharelink, share)    

    def post(self):
        (sharelink, share) = self.createShareFromPost()
        self.SendJson({"link":sharelink, "imglink":share.imglink, "id":share.key.id()})

    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def get(self):
        shareid = self.requestParam('shareid')
        logging.info("share id is %s", shareid)
        share = getById(model.Share, shareid)
        othervisitor = getById(model.Visitor, share.visitor)
        visitor = self.getVisitor()
        makefriendIfNeeded(visitor, othervisitor)
        makefriendIfNeeded(othervisitor, visitor)   
        visitor.put() 
        json_string=getShareData(shareid)
        self.response.write(json_string)

class DialShareHandler(ShareHandler):
    
    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def createDialShareFromPost(self):
        posted = json.loads(self.request.body)
        providerid = posted["provider"]
        dialtype = posted["dialtype"]
        dialid = posted["dialid"]
        topicid = posted["topicid"]
        clientid = posted["clientid"]
        dialshare = model.DialShare(provider=providerid, dialtype=dialtype, dialid=dialid, topicid=topicid, clientid=clientid, time=datetime.now())
        visitor = self.visitorkey.get()
        visitor.dialshares.append(dialshare)
        visitor.put()    
        
    def post(self):
        self.createDialShareFromPost();
        super(DialShareHandler, self).post()
        
class TwitterPostHandler(DialShareHandler):
    
    def post(self):
        (sharelink, share) = self.createShareFromPost()
        posted = json.loads(self.request.body)
        message = posted["message"]
        t = Twitter(auth=OAuth(self.session['twittertoken'], self.session['twittersecret'], CONFIG['tw']['consumer_key'], CONFIG['tw']['consumer_secret']))
        pngbase64 = share.imagedataurl.split('base64')[1]
        params = {"media[]": pngbase64, "status": message+" "+sharelink, "_base64": True}
        t.statuses.update_with_media(**params)
        self.SendJson({"link":sharelink, "imglink":share.imglink, "id":share.key.id()})
        
# Create routes.
ROUTES = [
          webapp2.Route(r'/share/generic', ShareHandler),
          webapp2.Route(r'/share/dial', DialShareHandler),
          webapp2.Route(r'/share/generictwitter', TwitterPostHandler),
          ]
# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)


