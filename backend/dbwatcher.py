
import logging

from google.appengine.api import memcache
import webapp2

from common.database import getDatabaseCursor
from common.ndbcache import recachenow
from config import webapp2config
import common


memcacheclient = memcache.Client()

STATS = ('author_selfie_reaction','statement_position','author_position','article_position')
BATCHLIMIT = 1000

class ScanDatabaseHandler(webapp2.RequestHandler):

    def any(self):
        res = getDatabaseCursor()
        lastchangedid = memcacheclient.get("cmslatestchangeditemid")
        logging.info("Looking for changes beyond %s" % lastchangedid)
        if lastchangedid is None: # pick up id from a week ago if none
            r=res.executefetchasdictlist("select * from changed_items where last_changed < DATE_ADD(CURDATE(), INTERVAL - 7 DAY) ORDER BY last_changed DESC limit 10")
            lastchangedid = r[0]["changed_id"]
        items=res.executefetchasdictlist("select * from changed_items where changed_id > %s ORDER BY changed_id ASC limit 1000" % lastchangedid)
        allauthors=True
        for item in items:
            if item["name"] != "author":
                allauthors=False
        if allauthors:
            logging.info("Stopping authors waking us up since %s" % lastchangedid)
            return
        
        currenttype = None
        lastsentid = None
        for item in items:
            name = item["name"]
            itemid = item["id"]
            changeid = item["changed_id"]
            if name in STATS:
                if (currenttype != None and currenttype != name) or (lastsentid != None and abs(itemid-lastsentid) > BATCHLIMIT):
                    recachenow(name.replace("_",""), id=itemid, endid=lastsentid, eventid=changeid)               
                    lastchangedid = changeid
                    memcacheclient.set("cmslatestchangeditemid", lastchangedid)
                    lastsentid = None
                lastsentid = itemid
            else:   
                recachenow(name.replace("_",""), id=itemid, eventid=changeid)
                lastchangedid = changeid
                memcacheclient.set("cmslatestchangeditemid", lastchangedid)
            currenttype = name
        if lastsentid != None:
            recachenow(name.replace("_",""), id=itemid, endid=lastsentid, eventid=changeid)
            lastchangedid = changeid
            memcacheclient.set("cmslatestchangeditemid", lastchangedid)                           
        logging.info("Remembering last changed item was %s" % lastchangedid)
        
         
# Create routes.
ROUTES = [
          webapp2.Route(r'/dbwatcher', ScanDatabaseHandler, handler_method='any'),
          ]
# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)


