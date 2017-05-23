import datetime
import importlib
import logging
import os

from google.appengine.api import search
from google.appengine.api import taskqueue
from google.appengine.ext import ndb
import webapp2

from common.cache import deferaction, AnyExisting
from common.env import isAppEngineDeploy
from common.profile import profile
from common.q import query
from common.structure import makeKeyDefault
from config import DEFAULTFEED
from config import webapp2config, VISITOR, AUTHORMP, ORG, ORGSAYS, ENTITY, VISITORAGG, PARTY, FRIEND, AUTHORPPC, AUTHORSTATEMENT, CAMPAIGN
from data.store import getObjMap, getById
from data.topic import getAllTopicParentsAndChildren
from publish.generic import clearCache
from publish.generic import queryObject
from publish.statsgeneric import syncStatsGeneric, sendStatsBatch
from publish.topic import syncTopics
from search import DOCUMENT_INDEX
from ui.article import getArticleSummary, getArticle
from ui.author import getAuthors, getAuthorData, getAuthorDataSummary
from ui.axis import getAllAxis
from ui.campaign import getCampaignDataSummary
from ui.client import getClientData, getClients
from ui.dial import getDialModel
from ui.home import getHomeStreamConfig
from ui.nav import generateNavTree
from ui.org import getOrgShares, getOrgShareStats, getOrg, getOrgTopics, getOrgDataSummary
from ui.party import getPartyData, getPartys, getPartyDataSummary
from ui.positionaxis import getPositionAxis
from ui.product import getFeaturedProductCategories, getAllProductCategories
from ui.statement import getStatementFilter, getStatementInfo, getStatementSummary
from ui.topic import getAllTopics, getTopicArticleHistory, getFeaturedTopic
from ui.trending import getTrendingStatementsNow, getTrendingStatements
from ui.twosidesaxis import generateTwoSidesAxis
import common
import model


try:
    import cPickle as pickle
except:
    import pickle 
    
isappenginedeploy = isAppEngineDeploy()

class BackgroundHandler(webapp2.RequestHandler):
    
    @profile
    def dispatch(self):
        try:
            webapp2.RequestHandler.dispatch(self)
        finally:
            clearCache()

class BackgroundJustQueueHandler(webapp2.RequestHandler):
    
    @profile
    def dispatch(self):
        webapp2.RequestHandler.dispatch(self)
    
class RebuildOrgStats(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        orgid = int(self.request.get('orgid'))
        logging.info("Rebuilding Cache for %d" % orgid)
        orgkey = ndb.Key('Org', orgid)
        logging.info("Rebuilding Stats for %d" % orgid)
        getOrgShares(orgkey, None, deferred_recache=True)
        logging.info("Rebuilt Shares %d" % orgid)
        getOrgShareStats(orgkey, None, deferred_recache=True)
        logging.info("Rebuilt Share Stats %d" % orgid)
        getOrgTopics(orgkey, deferred_recache=True)
        logging.info("Rebuilt Org Topics %d" % orgid)
        logging.info("Done rebuilding Cache for %d" % orgid)
        self.response.write("<html><body>Done rebuilding Cache for %d</body></html>" % orgid)

class RebuildOrgStatsShares(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        orgid = int(self.request.get('orgid'))
        logging.info("Rebuilding Cache for %d" % orgid)
        orgkey = ndb.Key('Org', orgid)
        logging.info("Done rebuilding Cache for %d" % orgid)
        self.response.write("<html><body>Done rebuilding Cache for %d</body></html>" % orgid)

class RebuildOrgStatsShareStats(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        orgid = int(self.request.get('orgid'))
        logging.info("Rebuilding Cache for %d" % orgid)
        orgkey = ndb.Key('Org', orgid)
        logging.info("Done rebuilding Cache for %d" % orgid)
        self.response.write("<html><body>Done rebuilding Cache for %d</body></html>" % orgid)

class RebuildOrgStatsSocialDial(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        orgid = int(self.request.get('orgid'))
        logging.info("Rebuilding Cache for %d" % orgid)
        orgkey = ndb.Key('Org', orgid)
        logging.info("Done rebuilding Cache for %d" % orgid)
        self.response.write("<html><body>Done rebuilding Cache for %d</body></html>" % orgid)

class RebuildOrgStatsAxisStats(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        orgid = int(self.request.get('orgid'))
        logging.info("Rebuilding Cache for %d" % orgid)
        orgkey = ndb.Key('Org', orgid)
        logging.info("Done rebuilding Cache for %d" % orgid)
        self.response.write("<html><body>Done rebuilding Cache for %d</body></html>" % orgid)

class RebuildStatement(BackgroundHandler):

    @ndb.toplevel
    def any(self,statementid):
       statementdict = getStatementSummary(statementid)
        getStatementInfo(statementid)
        getStatementFilter(None, None,None,None, None, deferred_recache=True)
        topicids = query(DEFAULTFEED, 'exec distinct topic from statementposition where entity=%s' % statementid)
        for topicid in topicids:
            topic = getById(model.Topic, topicid)
            if topic is not None:
                for atopic in topic.parenttopics:
                    getStatementFilter(atopic,None,None,None, None, deferred_recache=True)
                    getTopicArticleHistory(atopic, deferred_recache=True)
        for client in getObjMap(model.Client):
            getStatementFilter(None,None,None, client, None, deferred_recache=True)
        self.response.write("<html><body>Done rebuilding statement Cache</body></html>")
        getTopicArticleHistory(None, deferred_recache=True)

class SyncAllStatementPosition(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        syncStatsGeneric("statement_position", None, primarykey="position_id", force=True, sourceview="statement_position_active",
                        querysql = "last_changed as time, position_id as id, statement_id as entity, 0 as sourceentity, topic_id as topic, axis_id as axis, position_no as position", 
                        )        

class RebuildStatementPosition(BackgroundHandler):

    @ndb.toplevel
    def any(self,statementpositionid):
        logging.info("Rebuilding statement position cache")
        poslist = statementpositionid.split("-") if "-" in statementpositionid else (statementpositionid, statementpositionid)    
        syncStatsGeneric("statement_position", range(int(poslist[0]), int(poslist[1])+1), primarykey="position_id", 
                        querysql = "last_changed as time, position_id as id, statement_id as entity, 0 as sourceentity, topic_id as topic, axis_id as axis, position_no as position", 
                        )        
        getStatementFilter(None,None,None,None, None, deferred_recache=True)
        self.response.write("<html><body>Done rebuilding statement Cache</body></html>")

class RebuildAuthorPosition(BackgroundHandler):

    @ndb.toplevel
    def any(self,authorpositionid):
        poslist = authorpositionid.split("-") if "-" in authorpositionid else (authorpositionid, authorpositionid)    
        syncStatsGeneric("author_position", range(int(poslist[0]), int(poslist[1])+1), primarykey="position_id", 
                        querysql = "last_changed as time, position_id as id, author_id as entity, 0 as sourceentity, topic_id as topic, axis_id as axis, position_no as position", 
                        )        
        self.response.write("<html><body>Done rebuilding Author position Cache</body></html>")

class SyncAllArticlePosition(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        syncStatsGeneric("article_position", None, primarykey="position_id", force=True, remember=False, batch=30000, limit=10000000, skiptableflush=True,
                        querysql = "last_changed as time, position_id as id, article_id as entity, 0 as sourceentity, topic_id as topic, axis_id as axis, position_no as position", 
                        )        

class RebuildArticlePosition(BackgroundHandler):

    @ndb.toplevel
    def any(self,articlepositionid):
        posrange = articlepositionid.split("-") if "-" in articlepositionid else (articlepositionid, articlepositionid)  
        syncStatsGeneric("article_position", range(int(posrange[0]), int(posrange[1])+1) , primarykey="position_id", 
                        querysql = "last_changed as time, position_id as id, article_id as entity, 0 as sourceentity, topic_id as topic, axis_id as axis, position_no as position", 
                        )        
        getTopicArticleHistory(None, deferred_recache=True)
        for topicid in query(DEFAULTFEED, "distinct exec topic from articleposition where id within (%s;%s)" % (int(posrange[0]),int(posrange[1])+1)):
            topic = getById(model.Topic, topicid)
            if topic is not None:
                for atopic in topic.parenttopics:
                    getTopicArticleHistory(atopic, deferred_recache=True)
                    getPositionAxis(atopic, deferred_recache=True)
                getTopicArticleHistory( topic, deferred_recache=True)
                
class RebuildStatementPositions(BackgroundHandler):
    
    @ndb.toplevel
    def any(self):
        logging.info("Rebuilding statement position cache")
        logging.info("Done rebuilding statement position cache")      
        self.response.write("<html><body>Done rebuilding statementposition Cache</body></html>")

class RebuildMotionVote(BackgroundHandler):
    
    @ndb.toplevel
    def any(self):
        syncStatsGeneric("motion_vote", None,  
                        querysql = "last_changed as time, vote_id as id, motion_id as entity, author_id as person, reaction", 
                        dest = "authormotionreaction", batch = 2000, primarykey="vote_id", force=True)

class RebuildAxis(BackgroundHandler):
    
    @ndb.toplevel
    def any(self,axisid):
        getAllAxis(deferred_recache=True)
        
class RebuildSource(BackgroundHandler):
    
    def any(self,sourceid):
        pass
        
class RebuildCampaign(BackgroundHandler):
    
    def any(self,id):
        pass
        
class RebuildSourcecategory(BackgroundHandler):
    
    def any(self,id):
        pass
        
        
class RebuildProductcategory(BackgroundHandler):
    
    def any(self,id):
        getById(id, recache=True)
        getFeaturedProductCategories(deferred_recache=True)
        getAllProductCategories(deferred_recache=True)
        
class RebuildTrendingStatementsHandler(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        now=datetime.datetime.now()
        now = now.replace(minute=0, second=0, microsecond=0)
        getTrendingStatements(now, deferred_recache=True)
        getTrendingStatementsNow(deferred_recache=True)
        getTopicArticleHistory(None, deferred_recache=True)
        getStatementFilter(None, None,None,None, now, deferred_recache=True)

class RebuildNavigationstrip(BackgroundHandler):
    
    @ndb.toplevel
    def any(self,navid):
        generateNavTree(deferred_recache=True)

            
class RebuildClient(BackgroundHandler):
    
    @ndb.toplevel
    def any(self,clientid):
        row = queryObject( "client", sourceview="client_depth", key=clientid)
        kdbclient={'id':row['client_id']}
        kdbclient['statementids']=[] if (row['statement_ids'] is None or row['statement_ids'].strip()=='') else [int(a) for a in filter(lambda x:len(x.strip())>0,row['statement_ids'].split(','))]
        sendStatsBatch([kdbclient,], "client")
        getClients(deferred_recache=True)
        getClientData(clientid, deferred_recache=True)
        getStatementFilter(None,None,None, ndb.Key(model.Client, clientid), None, deferred_recache=True)
        self.response.write("<html><body>Done rebuilding Client Cache</body></html>")

class SyncAllClientLazy(BackgroundHandler):
    deferaction("recache","rebuildAllClients",pickup_later=True)

class SyncAllClient(BackgroundHandler):
    
    def any(self):
        rebuildAllClients()

@ndb.toplevel
def rebuildAllClients():
    syncStatsGeneric("client", None, primarykey="client_id", force=True, commalist="statementids", sourceview="client_depth",
                        querysql = "last_changed as time, client_id as id, topicstatement_ids as statementids"
                        )      

class RebuildParty(BackgroundHandler):
    
    @ndb.toplevel
    def any(self,partyid):
        getPartys(deferred_recache=True)
        getPartyData(partyid, None, deferred_recache=True)
        getPartyDataSummary(partyid, deferred_recache=True)
        self.response.write("<html><body>Done rebuilding Party Cache</body></html>")
        
class Dummy(BackgroundHandler):
    
    @ndb.toplevel
    def any(self,dummy):
        pass
    
class RebuildCitation(BackgroundHandler):
    
    @ndb.toplevel
    def any(self,citationid):
        citation = getById(model.Citation, citationid)
       
                                
class RebuildFeature(BackgroundHandler):
    
    @ndb.toplevel
    def any(self, featureid):
     
        generateTwoSidesAxis(None, None, deferred_recache=True)
        generateTwoSidesAxis(featureid, None, deferred_recache=True)
          
class RebuildArticle(webapp2.RedirectHandler):
    
    @ndb.toplevel
    def any(self, articleid):
        if "-" in articleid:
            articleid=articleid.split("-")[0]
        
        row = queryObject( "article", key=articleid)
        if row is None:
            logging.error( "article does not exist" )
            return
                    
        fields=[search.TextField(name='headline', value=row["headline"]),
            search.TextField(name='typ', value="article")]
        document = search.Document(
            doc_id=unicode("article"+str(row['article_id'])),
            fields=fields,
            language='en')
        DOCUMENT_INDEX.put([document,], deadline=None)
        
#Need to discuss what we are doing with 'onsite' now that we no longer have any article pages on site

        syncStatsGeneric("article", range(row['article_id'], row['article_id']+1) , primarykey="article_id",
                        querysql ="publish_date as time, article_id as id, source_id as source, author_id as author, true as onsite", 
                        )        
        getArticle(articleid, deferred_recache=True)
        getArticleSummary(articleid, deferred_recache=True)
        
class SyncAllArticle(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        syncStatsGeneric("article", None, primarykey="article_id", force=True, remember=False, batch=30000, limit=10000000, skiptableflush=True,
                        querysql = "publish_date as time, article_id as id, source_id as source, author_id as author, false as onsite", 
                        )        
                
class RebuildAuthor(BackgroundHandler):
    
    @ndb.toplevel
    def any(self, authorid):
        for cat in ['mp']:
            getAuthors(cat, deferred_recache=True)
#trying to fix author - hiding caching as think this isn't working because of the caching being hidden on the function
        #getAuthorData(authorid, None, deferred_recache=True)
        getAuthorData(authorid, None)
        getAuthorDataSummary(authorid, deferred_recache=True)
        getDialModel(int(authorid), AUTHORSTATEMENT, AnyExisting, deferred_recache=True)
        logging.info("Rebuilt Author Cache")   
    
class RebuildOrg(BackgroundHandler):
    def any(self, orgid):
        getFeaturedProductCategories(deferred_recache=True)
        getAllProductCategories(deferred_recache=True)
        getOrg(orgid, None, deferred_recache=True)
        getOrgDataSummary(orgid, deferred_recache=True)
        getDialModel(int(orgid), "orgaction", AnyExisting, deferred_recache=True)
        pass
                    
class RebuildDataHandler(BackgroundHandler):
 
    def any(self, key):
        if 'ANY' in key:
            return
        recachedict = pickle.loads(self.request.body) 
        funcname = recachedict['funcname']
        (funcmodule, funcshostname) = funcname.split(":")
        try:
            func = getattr(importlib.import_module(funcmodule), funcshostname)
        except:
            return
        kwargs = recachedict['kwargs']
        args = recachedict['args']
        okey = recachedict['key'] if key in recachedict else None
        if okey is None:
            key = makeKeyDefault(funcname, *args, **kwargs)
            logging.info("Made key %s" % key )
        else:
            key = okey

        q = taskqueue.Queue('recache-function-queue')
        tasks = q.lease_tasks_by_tag(600, 1000, key)
        if len(tasks) == 0:
            logging.info("Abandoning task %s;%s;%s" % (okey,args,kwargs) )
            return
        try:
            func(*args, **kwargs)
        except TypeError as coderror:
            logging.exception(coderror)
        q.delete_tasks(tasks)
        #TODO: queue for later
        queuedtasks = q.lease_tasks_by_tag(3600, 1, "queuedforlater")
        for queuedtask in queuedtasks:
            recachedict = pickle.loads(queuedtask.payload)
            (funcmodule, funcshostname) = funcname.split(":")       
            kwargs = recachedict['kwargs']
            args = recachedict['args']
            logging.info("Queuing defered for later task (%s, %s, %s, %s)" % (funcmodule,funcshostname,args,kwargs) )
            deferaction(funcmodule, funcshostname, *args, **kwargs)
        

class SyncAllTopic(BackgroundHandler):

    @ndb.toplevel
    def any(self):
        syncTopics([])                 

class RebuildTopic(BackgroundHandler):

    def any(self,topicid):
        topic = int(topicid)
        logging.info("Rebuilding topic %s", topicid)
        getAllTopicParentsAndChildren(deferred_recache=True)
        getAllTopics(deferred_recache=True)
        getFeaturedTopic(deferred_recache=True)
        deferaction("publish.topic", "syncTopics", (), force=True)                   
     
class RebuildAHome(BackgroundHandler):

    def any(self):
        getTopicArticleHistory(None, deferred_recache=True)

class WebpageRecacheDummyHandler(BackgroundHandler):
    
    def any(self):
        pass

class SyncAllReactionCitationHandler(BackgroundHandler):
    
    def any(self):
        partystats = syncStatsGeneric("reaction_citation", None, primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, campaign_id as person, reaction",
                        dest = "campaignstatementreaction", wherenotnull="person", force=True
                        )             
        for partyid in set([p["person"] for p in partystats]):
            getPartyData(partyid, AnyExisting, deferred_recache=True)                             
        commentatorstats = syncStatsGeneric("reaction_citation", None, primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, party_id as person, reaction",
                        dest = "partystatementreaction", wherenotnull="person", force=True
                        )
        for commentatorid in set([p["person"] for p in commentatorstats]):
            getAuthorData(commentatorid, AnyExisting, deferred_recache=True)                             
        campaignstats = syncStatsGeneric("reaction_citation", None, primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, commentator_id as person, reaction",
                        dest = "authorstatementreaction", wherenotnull="person", force=True
                        )             
                          

    
class RebuildReactionCitationHandler(BackgroundHandler):
    
    def any(self,citationid):
        poslist = citationid.split("-") if "-" in citationid else (citationid, citationid)    
        partystats = syncStatsGeneric("reaction_citation", range(int(poslist[0]), int(poslist[1])+1), primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, party_id as person, reaction",
                        dest = "partystatementreaction", wherenotnull="person"
                        )
        for partyid in set([p["person"] for p in partystats]):
            getPartyData(partyid, AnyExisting, deferred_recache=True)                             
        commentatorstats = syncStatsGeneric("reaction_citation", range(int(poslist[0]), int(poslist[1])+1), primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, commentator_id as person, reaction",
                        dest = "authorstatementreaction", wherenotnull="person"
                        )                           
        for commentatorid in set([p["person"] for p in commentatorstats]):
            getAuthorData(commentatorid, AnyExisting, deferred_recache=True)                             
        campaignstats = syncStatsGeneric("reaction_citation", range(int(poslist[0]), int(poslist[1])+1), primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, campaign_id as person, reaction",
                        dest = "campaignstatementreaction", wherenotnull="person"
                        )                                    


class SyncAllActionCitationHandler(BackgroundHandler):
    
    def any(self):
        orgactionstats = syncStatsGeneric("action_citation", None, primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, org_id as person, reaction",
                        dest = "orgactionreaction", wherenotnull="person", sourceview = "action_citation_featured", force=True
                        )
        for orgid in set([p["person"] for p in orgactionstats]):
            getOrg(orgid, AnyExisting, deferred_recache=True)                             
        authormpstats = syncStatsGeneric("action_citation", None, primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, mp_id as person, reaction",
                        dest = "authormotionreaction", wherenotnull="person", sourceview = "action_citation_detail", force=True
                        )
        for authormpid in set([p["person"] for p in authormpstats]):
            getAuthorData(authormpid, AnyExisting, deferred_recache=True)                             

class RebuildActionCitationHandler(BackgroundHandler):
    
    def any(self,citationid):
        poslist = citationid.split("-") if "-" in citationid else (citationid, citationid)    
        orgactionstats = syncStatsGeneric("action_citation", range(int(poslist[0]), int(poslist[1])+1), primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, org_id as person, reaction",
                        dest = "orgactionreaction", wherenotnull="person", sourceview = "action_citation_featured"
                        )
        for orgid in set([p["person"] for p in orgactionstats]):
            getOrg(orgid, AnyExisting, deferred_recache=True)                             
        authormpstats = syncStatsGeneric("action_citation", range(int(poslist[0]), int(poslist[1])+1), primarykey="citation_id", 
                        querysql = "last_changed as time, citation_id as id, statement_id as entity, mp_id as person, reaction",
                        dest = "authormotionreaction", wherenotnull="person", sourceview = "action_citation_detail"
                        )
        for authormpid in set([p["person"] for p in authormpstats]):
            getAuthorData(authormpid, AnyExisting, deferred_recache=True)                             

class RebuildHomeStreamHandler(BackgroundHandler): 

    def any(self):
        json = getTopicArticleHistory(None)
        jsonconfig = getHomeStreamConfig()
        self.response.write({'homestreamconfig':jsonconfig, 'topicarticlehistory':json})       
            
# Create routes.
ROUTES = [
          webapp2.Route(r'/recache/rebuild/allmotionvotes', RebuildMotionVote, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/allstatementpositions', RebuildStatementPositions, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/topic/<topicid>', RebuildTopic, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/client/<clientid>', RebuildClient, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/client', SyncAllClient, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/clientlazy', SyncAllClientLazy, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/position_axis/<dummy>', Dummy, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/motion_vote/<dummy>', Dummy, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/motionvotes', RebuildMotionVote, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/homefeature/<featureid>', RebuildFeature, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/articleposition/<articlepositionid>', RebuildArticlePosition, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/articleposition', SyncAllArticlePosition, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/article', SyncAllArticle, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/axis/<axisid>', RebuildAxis, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/authorposition/<authorpositionid>', RebuildAuthorPosition, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/source/<sourceid>', RebuildSource, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/reactioncitation/<citationid>', RebuildReactionCitationHandler, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/reactioncitation', SyncAllReactionCitationHandler, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/actioncitation/<citationid>', RebuildActionCitationHandler, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/actioncitation', SyncAllActionCitationHandler, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/party/<partyid>', RebuildParty, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/source_category/<id>', RebuildSourcecategory, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/product_category/<id>', RebuildProductcategory, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/statementposition/<statementpositionid>', RebuildStatementPosition, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/statementposition', SyncAllStatementPosition, handler_method='any'),
          webapp2.Route(r'/recache/syncstats/topic', SyncAllTopic, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/navigationstrip/<navid>', RebuildNavigationstrip, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/statement/<statementid>', RebuildStatement, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/article/<articleid>', RebuildArticle, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/Article/<articleid>', RebuildArticle, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/author/<authorid>', RebuildAuthor, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/org/<orgid>', RebuildOrg, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/campaign/<id>', RebuildCampaign, handler_method='any'),
          webapp2.Route(r'/recache/rebuilddata/<key>', RebuildDataHandler, handler_method='any'),
          webapp2.Route(r'/recache/webpage', WebpageRecacheDummyHandler, handler_method='any'),
          webapp2.Route(r'/recacheunsafe/trendingstatements', RebuildTrendingStatementsHandler, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/homestream', RebuildHomeStreamHandler, handler_method='any'),
          webapp2.Route(r'/recache/rebuild/politicalparty/<partyid>', RebuildParty, handler_method='any'),
          ]

        

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)
