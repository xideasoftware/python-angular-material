import json
import logging
import os
import time

from google.appengine.api import users
from google.appengine.ext import ndb
from jinja2 import Environment, PackageLoader
from webapp2_extras import jinja2
import webapp2

from cachemodels import ShortJsonCache, JsonCache, GenericCache
from common.env import isProduction
from common.web import BaseHandler, RestHandler
from config import webapp2config
from ui.nav import generateNavTree
from ui.trending import getTrendingStatements
from ui.twosidesaxis import generateTwoSidesAxis
import appengine_config
import cachemodels
import common


class DebugOnHandler(BaseHandler):
    def any(self):
        self.session["debug"] = True
        self.redirect('/admin')

class DebugOffHandler(BaseHandler):
    def any(self):
        self.session["debug"] = False
        self.redirect('/admin')

class AllHandsHandler(RestHandler):
    
    def any(self):
        for key in cachemodels.GenericCache.query().fetch(keys_only=True):
            logging.debug(key)
            key.delete()
        for key in cachemodels.JsonCache.query().fetch(keys_only=True):
            logging.debug(key)
            key.delete()
        for key in cachemodels.StorageCache.query().iter(keys_only=True):
            logging.debug(key)
            key.delete()
        for key in cachemodels.WebPageCache.query().iter(keys_only=True):
            logging.debug(key)
            key.delete()
        self.response.write("<html><body>Cleared Caches</body></html>")

class JsonHandler(RestHandler):
    
    def any(self):
        for key in cachemodels.JsonCache.query().fetch(keys_only=True):
            key.delete()
        self.response.write("<html><body>Cleared JSON Cache</body></html>")

class ShortJsonHandler(RestHandler):
    
    def any(self):
        for key in cachemodels.ShortJsonCache.query().iter(keys_only=True):
            key.delete()
        self.response.write("<html><body>Cleared Short JSON Cache</body></html>")

class ForceRebuildOtherHandler(webapp2.RequestHandler):
    def any(self):
        generateTwoSidesAxis(None, -1);
        generateNavTree();
       
class AdminHandler(BaseHandler):
    
    def any(self):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
        s = {'debug':"on" if self.session.get("debug", False) else "off"}    
        s['ShortJsonCache']=ShortJsonCache.query(projection=[ShortJsonCache.funcname], distinct=True).fetch()
        s['JsonCache']=JsonCache.query(projection=[ShortJsonCache.funcname], distinct=True).fetch()
        s['GenericCache']=GenericCache.query(projection=[ShortJsonCache.funcname], distinct=True).fetch()
        self.render_template('admin.html', s)

class AbstractListHandler(BaseHandler):
    
    def __init__(self, cls, cachedeleteurl, cacheviewurl, request=None, response=None):
        BaseHandler.__init__(self, request=request, response=response)
        self.cls = cls
        self.cachedeleteurl = cachedeleteurl
        self.cacheviewurl = cacheviewurl
    
    def any(self, funcname):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
        s={}
        s['funcname']=funcname
        s['cachedeleteurl']=self.cachedeleteurl
        s['cacheviewurl']=self.cacheviewurl
        s['cachedlist']=self.cls.query(self.cls.funcname == funcname).fetch( limit=1000)
        ekeys=self.cls.query(self.cls.funcname == funcname).fetch(keys_only=True, limit=1000)
        logging.debug("Found %s entity keys" % len(ekeys))
        logging.debug("Found %s entities" % len(s['cachedlist']))
        self.render_template('listcache.html', s)

class AbstractDeleteHandler(BaseHandler):
    
    def __init__(self, cls, request=None, response=None):
        BaseHandler.__init__(self, request=request, response=response)
        self.cls = cls

    def any(self, funcname, ids):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
        s={}
        s['funcname']=funcname
        if ids == "ALL":
            s['deletedlist']=self.cls.query(self.cls.funcname == funcname).fetch(keys_only=True, limit=1000)
        else:
            s['deletedlist']=[ndb.Key(self.cls,a) for a in ids.split(",")]
        ndb.delete_multi(s['deletedlist'])
        s["refreshin"] = "1" if len(s['deletedlist']) > 900 else "100000"
        self.render_template('deletedcache.html', s)

class AbstractViewHandler(BaseHandler):
    
    def __init__(self, cls, cachedeleteurl, request=None, response=None):
        BaseHandler.__init__(self, request=request, response=response)
        self.cls = cls
        self.cachedeleteurl = cachedeleteurl

    def any(self, funcname, id):
        user = users.get_current_user()
        if not user:
            self.redirect(users.create_login_url(self.request.uri))
        s={}
        s['funcname']=funcname
        s['cachedeleteurl']=self.cachedeleteurl
        item=self.cls.get_by_id(id)
        s['item']=item
        if type(item.payload) == str:
            try:
                item.payload=json.dumps(json.loads(item.payload), sort_keys=True, indent=4, separators=(',<br/>', ': '))
            except:
                pass
        else:
            try:
                item.payload=json.dumps(item.payload, sort_keys=True, indent=4, separators=(',<br/>', ': '))
            except:
                pass
        self.render_template('viewcache.html', s)
        
class ShortJsonCacheListHandler(AbstractListHandler):
    
    def __init__(self, request=None, response=None):
        AbstractListHandler.__init__(self,ShortJsonCache,'shortjsonlistcachedelete','shortjsonlistcacheview',request=request, response=response)
       
class ShortJsonCacheListDeleteHandler(AbstractDeleteHandler):
    
    def __init__(self, request=None, response=None):
        AbstractDeleteHandler.__init__(self,ShortJsonCache,request=request, response=response)

class ShortJsonCacheListViewHandler(AbstractViewHandler):
    
    def __init__(self, request=None, response=None):
        AbstractViewHandler.__init__(self,ShortJsonCache,'shortjsonlistcachedelete',request=request, response=response)

class JsonCacheListHandler(AbstractListHandler):
    
    def __init__(self, request=None, response=None):
        AbstractListHandler.__init__(self,JsonCache,'jsonlistcachedelete','jsonlistcacheview',request=request, response=response)

class JsonCacheListDeleteHandler(AbstractDeleteHandler):
    
    def __init__(self, request=None, response=None):
        AbstractDeleteHandler.__init__(self,JsonCache,request=request, response=response)

class JsonCacheListViewHandler(AbstractViewHandler):
    
    def __init__(self, request=None, response=None):
        AbstractViewHandler.__init__(self,ShortJsonCache,'jsonlistcachedelete',request=request, response=response)

class GenericCacheListHandler(AbstractListHandler):
    
    def __init__(self, request=None, response=None):
        AbstractListHandler.__init__(self,GenericCache,'genericcachedelete','genericcacheview',request=request, response=response)

class GenericCacheDeleteHandler(AbstractDeleteHandler):
    
    def __init__(self, request=None, response=None):
        AbstractDeleteHandler.__init__(self,GenericCache,request=request, response=response)
               
class GenericCacheViewHandler(AbstractViewHandler):
    
    def __init__(self, request=None, response=None):
        AbstractViewHandler.__init__(self,GenericCache,'genericcachedelete',request=request, response=response)
               
class RebuildTrendingStatementsHandler(webapp2.RequestHandler):

    def any(self):
        json_string = getTrendingStatements()
        self.response.write(json_string)
        
# Create routes.
ROUTES = [webapp2.Route(r'/admin', AdminHandler, handler_method='any'),
          webapp2.Route(r'/admin/forcerebuildother', ForceRebuildOtherHandler, handler_method='any'),
          webapp2.Route(r'/admin/allhands', AllHandsHandler, handler_method='any'),
          webapp2.Route(r'/admin/setdebugon', DebugOnHandler, handler_method='any'),
          webapp2.Route(r'/admin/setdebugoff', DebugOffHandler, handler_method='any'),
          webapp2.Route(r'/admin/shortjsonlistcache/<:.*>', ShortJsonCacheListHandler, handler_method='any'),
          webapp2.Route(r'/admin/genericlistcache/<:.*>', GenericCacheListHandler, handler_method='any'),
          webapp2.Route(r'/admin/jsonlistcache/<:.*>', JsonCacheListHandler, handler_method='any'),
          webapp2.Route(r'/admin/shortjsonlistcachedelete/<funcname>/<ids>', ShortJsonCacheListDeleteHandler, handler_method='any'),
          webapp2.Route(r'/admin/genericcachedelete/<funcname>/<ids>', GenericCacheDeleteHandler, handler_method='any'),
          webapp2.Route(r'/admin/jsonlistcachedelete/<funcname>/<ids>', JsonCacheListDeleteHandler, handler_method='any'),
          webapp2.Route(r'/admin/shortjsonlistcacheview/<funcname>/<id>', ShortJsonCacheListViewHandler, handler_method='any'),
          webapp2.Route(r'/admin/genericcacheview/<funcname>/<id>', GenericCacheViewHandler, handler_method='any'),
          webapp2.Route(r'/admin/jsonlistcacheview/<funcname>/<id>', JsonCacheListViewHandler, handler_method='any'),
          webapp2.Route(r'/admin/jsoncache', JsonHandler, handler_method='any'),
          webapp2.Route(r'/admin/trendingcache', RebuildTrendingStatementsHandler, handler_method='any'),
          webapp2.Route(r'/admin/shortjsoncache', ShortJsonHandler, handler_method='any'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)
