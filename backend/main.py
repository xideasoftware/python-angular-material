import logging

from google.appengine.api.taskqueue.taskqueue import Task
import webapp2

from common.profile import profile
from common.web import InitialPageHandler, DEFAULTPARTIALS
from ui.article import getArticleSummary
from ui.axis import getAllAxis
from ui.client import getClients
from ui.home import getHomeStreamConfig
from ui.nav import generateNavTree
from ui.topic import getAllTopics, getFeaturedTopic, getTopicArticleHistory
from ui.trending import getTrendingStatementsNow
from ui.twosidesaxis import generateTwoSidesAxis
from ui.visitor import generateVisitorData, randomStatements, everyoneElseStatements
import common


class MainHandler(InitialPageHandler):
        
    @profile
    def any(self):
        if not self.visitorisnew:
            pubfut=None
            try:
                visitorid = self.visitorkey.id()
                logging.debug("Queuing refresh of "+'/publish/user/'+str(visitorid))
                task=Task(url='/publish/user/'+str(visitorid)) 
                pubfut=task.add_async('new-visitor-queue')       
            except Exception as e:
                logging.exception(e)                           
        logging.debug("add partials")
        self.addpartials(DEFAULTPARTIALS)
        logging.debug("added partials")
        clients = getClients(async = True);
        idtotopic = getAllTopics(async = True);
        trendingstatements = getTrendingStatementsNow(async = True)
        logging.debug("added clients, idtotopic, trending")
        if self.visitorisnew:
            visitor = generateVisitorData(None, isnew = True);
        else:
            visitor = generateVisitorData(self.getVisitor());            
        self.addjson("visitor",visitor)
        logging.debug("added visitor")
        idtoaxis = getAllAxis(async = True);
        featuredtopic = getFeaturedTopic(async = True)
        navtreejson = generateNavTree(async = True)
        homestreamconfig = getHomeStreamConfig(async = True)
        topicarticlehistory = getTopicArticleHistory(None, async = True)
        randomstatements = randomStatements(async = True)
        everyonestatements = everyoneElseStatements(async = True)
        logging.debug("add clients")
        self.addjson("clients",clients.get_result())
        logging.debug("add trendingstatements")
        self.addjson("trendingstatements",trendingstatements.get_result())
        logging.debug("add idtotopic")
        self.addjson("idtotopics",idtotopic.get_result())
        logging.debug("add idtoaxis")
        self.addjson("idtoaxis",idtoaxis.get_result())
        logging.debug("add featuredtopicid")
        self.addjson("featuredtopicid",featuredtopic.get_result())
        logging.debug("add navtree")
        self.addjson("navtree",navtreejson.get_result())
        logging.debug("add topicarticlehistory")
        self.addjson("latestarticles",topicarticlehistory.get_result())
        logging.debug("add everyonestatements")
        self.addjson("everyonetrendingstatements",everyonestatements.get_result())
        logging.debug("add randomstatements")
        self.addjson("randomstatements",randomstatements.get_result())
        logging.debug("add homestreamconfig")
        self.addjson("homestreamconfig",homestreamconfig.get_result())
        logging.debug("add template")
       
        self.settemplate('index.html')
        
        if not self.visitorisnew:
            if pubfut is not None:
                try:
                    pubfut.get_result()     
                except Exception as e:
                    logging.exception(e)                           
        super(MainHandler, self).any()
                                       
class AuthorHandler(MainHandler ):
    def any(self, authorId, authorName):
        super(AuthorHandler, self).any()

class MatchHandler(MainHandler ):
    def any(self, matchType):
        super(MatchHandler, self).any()

class MatchHandlerPath(MainHandler ):
    def any(self, matchType, matchId, matchVersion):
        dest = ("/match/%s?" % matchType) + self.request.query_string
        self.redirect(dest, permanent=True)

class TopicHandler(MainHandler ):
        
    def any(self, topicId, topicName):
        self.topicId = topicId
        self.addjson("twosides",generateTwoSidesAxis(None, self.topicId),topic_id=self.topicId)
        super(TopicHandler, self).any()           
        
class OrgPositionDialHandler(MainHandler ):
    def any(self, entityId, entityName):
        super(OrgPositionDialHandler, self).any()

class ArticleRedirectHandler(webapp2.RequestHandler ):
    def any(self, articleId, topicv, topicId, axisv, axisId):
        article = getArticleSummary(articleId).get_result()
        if not article['isvalid']:
            self.abort(500)
        if not "firsttopic" in article:
            self.abort(500)
        if not "firstaxis" in article:
            self.abort(500)
        dest = "/article/%(article_id)s/%(firsttopic)s/%(firstaxis)s/%(safelink)s" % article
        self.redirect(dest, permanent=True)

class CatchAllHandler(MainHandler):
    def any(self, path):
        super(CatchAllHandler, self).any()

class BanHandle(MainHandler):
    def any(self, dummy):
        self.abort(400)
        
# Create routes.
ROUTES = [
          webapp2.Route(r'/match/<matchType>', MatchHandler, handler_method='any'),
          webapp2.Route(r'/match/<matchType>/<matchId>/<matchVersion>', MatchHandlerPath, handler_method='any'),
          webapp2.Route(r'/author/<authorId>/<authorName>', AuthorHandler, handler_method='any'),
          webapp2.Route(r'/bio/<authorId>/<authorName>', AuthorHandler, handler_method='any'),
          webapp2.Route(r'/orgmatches/<entityId>/<entityName>', OrgPositionDialHandler, handler_method='any'),
          webapp2.Route(r'/orgmatches', MainHandler, handler_method='any'),
          webapp2.Route(r'/discover/<topicId>/<topicName>', TopicHandler, handler_method='any'),
          webapp2.Route(r'/topictest/<topicId>/<topicName>', TopicHandler, handler_method='any'),
          webapp2.Route(r'/orgpositiondial/<entityId>/<entityName>', OrgPositionDialHandler, handler_method='any'),
          webapp2.Route(r'/article/detail/article_id/<articleId>/<topicv>/<topicId>/<axisv>/<axisId>', ArticleRedirectHandler, handler_method='any'),
          webapp2.Route(r'/yourpositiondial', MainHandler, handler_method='any'),
          webapp2.Route(r'/<:.*>.png', BanHandle, handler_method='any'),
          webapp2.Route(r'/<:.*>.jpg', BanHandle, handler_method='any'),
          webapp2.Route(r'/<:.*>.gif', BanHandle, handler_method='any'),
          webapp2.Route(r'/<:.*>.svg', BanHandle, handler_method='any'),
          webapp2.Route(r'/<:.*>.css', BanHandle, handler_method='any'),
          webapp2.Route(r'/<:.*>.html', BanHandle, handler_method='any'),
          webapp2.Route(r'/<:.*>.js', BanHandle, handler_method='any'),
          webapp2.Route(r'/<path:.*>', CatchAllHandler, handler_method='any'),
          ]

# Instantiate the webapp2 WSGI application.
app=common.env.startWSGIServer(ROUTES)

    


