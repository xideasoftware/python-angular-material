
import datetime
import logging
import os

from google.appengine.api import taskqueue
from google.appengine.ext import ndb
import webapp2

from common.env import currentVersion, isProduction
from common.filecache import fetchBulkJavascript, getBulkJavascript
from common.filecache import needsminifyjs
from common.filestorage import listfiles, load
from common.ga import getCachedRunningExperiments
from common.q import getQConnection
from common.web import filepreload
from ui.axis import getAllAxis
from ui.client import getClients
from ui.nav import generateNavTree
from ui.statement import getStatementFilter
from ui.topic import getAllTopics, getTopicArticleHistory
from ui.trending import getTrendingStatementsNow, getTrendingStatements
from ui.visitor import randomStatements, everyoneElseStatements
import common


class WarmUpHandler(webapp2.RequestHandler):
    
    @ndb.toplevel 
    def any(self):
        if not isProduction():
            return
        getQConnection("user").publish("1b")
        getBulkJavascript()
        currentversion = currentVersion()
        filepreload(False, async=True)
        filepreload(True, async=True)
        
        #JSON preload
        getClients( async=True)
        getAllTopics( async=True)
        now=datetime.datetime.now()
        now = now.replace(minute=0, second=0, microsecond=0)
        getTrendingStatements(now,  async=True)
        getTrendingStatementsNow( async=True)
        getAllAxis( async=True)
        generateNavTree( async=True)
        getCachedRunningExperiments( async=True)
        getStatementFilter(None, None, None, 8, None, async=True)
        getStatementFilter(None, None, None, 6, None, async=True)
        getStatementFilter(None, None, None, None, now, async=True)       
        getStatementFilter(None, None, None, None, None, async=True)       
        getTopicArticleHistory(None,  async=True)
        randomStatements( async=True)
        everyoneElseStatements( async=True)
        
ROUTES = [webapp2.Route(r'/_ah/warmup', WarmUpHandler, handler_method='any'),]
app=common.env.startWSGIServer(ROUTES)
        