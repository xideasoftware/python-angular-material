from collections import defaultdict
from datetime import datetime, timedelta
import logging
import re

from google.appengine.api import taskqueue
from google.appengine.ext import ndb

from common.database import getDatabaseCursor
from common.encoding import dumpjson
from common.opaque import getlink
from common.web import RestHandler
from config import ACHIEVEMENTS
from config import VISITOR, AUTHORMP, ORG, ORGSAYS, ENTITY, VISITORAGG, PARTY, FRIEND, AUTHORPPC, AUTHORSTATEMENT, CAMPAIGN
from config import VISITORTRANSACTIONRETRIES
from data.actioncitation import getCitationForEntityByStatementId
from data.campaign import getCampaigns
from data.store import getById
from data.citation import getCommentsCitations
from search import doSearch
from ui.article import getArticle
from ui.author import getAuthorData, getAuthors, getMPAuthors
from ui.axis import getAllAxis
from ui.client import getClientData, getClientTopicStatements
from ui.comparison import getVisitorComparison
from ui.dial import getDialModelVisitor, getDialModelVisitorAgg, getDialModel
from ui.entity import getEntitySummaryAccessor
from ui.location import getConstituency, getPostcode
from ui.matches import getVisitorMatches
from ui.org import getOrgShares, getOrgShareStats, getOrg, getOrgTopics
from ui.party import getPartyData, getPartys
from ui.positionaxis import getPositionAxis, getArticlePositionHistory
from ui.product import getFeaturedProductCategories, getAllProductCategories
from ui.statement import getStatementFilter, getStatementInfo, getStatements
from ui.topic import getTopicData, getTopicArticleHistory, getAllTopics
from ui.trending import getTrendingStatements
from ui.twosidesaxis import generateTwoSidesAxis
from ui.visitor import generateVisitorData, getVisitorInterestedTopics, awardbadge, getVisitorBodArticleHistory
import common
import model


class QueryTopicHandler(RestHandler):
    def get(self):
        json_string = getAllTopics()
        self.SendJson(json_string)        

class QueryAxisHandler(RestHandler):
    def get(self):
        json_string = getAllAxis()
        self.SendJson(json_string)        

class HomeHandler(RestHandler):
    def get(self):
        self.SendJson({})

class PositionAxisHandler(RestHandler):
    def get(self):
        json_string = getPositionAxis(self.requesttopickey)
        self.SendJson(json_string)

class TwoSidesHandler(RestHandler):
    def get(self):
        featureId = self.request.params.get('feature_id', None)
        topic = self.requesttopickey
        json_string = generateTwoSidesAxis(featureId,topic)
        self.SendJson(json_string)
        
class VisitorHandler(RestHandler):
    def get(self):
        visitor = self.getVisitor()
        json_string = generateVisitorData(visitor)
        self.SendJson(json_string)

class VisitorTopicFollowedHandler(RestHandler):

    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def put(self):
        followevent = model.FollowTopic(topic = self.requesttopickey, follow='true'==self.requestParam("follow"))
        visitor = self.getVisitor()
        visitor.followedtopics.append(followevent)
        visitor.put()

class VisitorTopicIgnoredHandler(RestHandler):

    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def put(self):
        ignoreevent = model.IgnoreTopic(topic = self.requesttopickey, ignore='true'==self.requestParam("ignore"))
        visitor = self.getVisitor()
        visitor.ignoredtopics.append(ignoreevent)
        visitor.put()

class OrgShareStatsHandler(RestHandler):
    
    def get(self):
        topicid = self.requesttopickey
        orgid = self.requestorgkey
        json_string = getOrgShareStats(orgid, topicid)
        self.SendJson(json_string)

class OrgHandler(RestHandler):
    
    def get(self):
        topicid = self.requesttopickey
        orgid = self.requestorgkey
        
        #commenting out survive_release
        json_string = getOrg(orgid, topicid)
        
        #putting back in survive release
        self.SendJson(json_string)

class CitationsHandler(RestHandler):
    
    def get(self):
        entitytype = self.request.params.get('citationFor', None)
        referenceId = int(self.request.params.get('id', None))
        statment_citation_json = getCitationForEntityByStatementId(entitytype,referenceId)
        logging.info("statment_citation_json = %s",statment_citation_json)
        json_string = dumpjson({"statmentCitationJson":statment_citation_json})
        self.SendJson(json_string)

class OrgTopicHandler(RestHandler):
    
    def get(self):
        orgid = self.requestorgkey
        json_string = getOrgTopics(orgid)
        self.SendJson(json_string)    
        
class ClientTopicHandler(RestHandler):
    
    def get(self):
        clientid = self.requestParamKey('clientid')
        json_string = getClientTopicStatements(clientid)    
        self.SendJson(json_string)    
        
class ShareHistoryHandler(RestHandler):
    
    def get(self):
        topicid = self.requesttopickey
        orgid = self.requestorgkey
        json_string = getOrgShares(orgid, topicid)
        self.SendJson(json_string)
        
class ClientHandler(RestHandler):
    
    def get(self):
        clientkey = self.requestParamKey('client_id')
        json_string = getClientData(clientkey)
        self.SendJson(json_string)

class AuthorHandler(RestHandler):
    
    def get(self):
        if self.requestParam("opaquelink") is not None:
            opaquelink = self.requestParam("opaquelink")
            authorid = getlink(opaquelink, "ppc2015", "author")
        else:
            authorid = int(self.request.params.get('author_id', None))
        json_string = getAuthorData(authorid, self.requesttopickey)
        self.SendJson(json_string)

class AuthorsHandler(RestHandler):
    
    def get(self):
        authortype = self.request.params.get('author_category', None)
        json_string = getAuthors(authortype)
        self.SendJson(json_string)
        
#this is for the MPs search page
class AuthorMPsHandler(RestHandler):
    
    def get(self):
        authortype = self.request.params.get('author_category', None)
        json_string = getMPAuthors(authortype)
        self.SendJson(json_string)

class PartyHandler(RestHandler):
    
    def get(self):
        if self.requestParam("opaquelink") is not None:
            opaquelink = self.requestParam("opaquelink")
            partyid = getlink(opaquelink, "ppc2015", "party")
        else:
            partyid = int(self.request.params.get('party_id', None))
        json_string = getPartyData(partyid, self.requesttopickey)
        self.SendJson(json_string)

class PartysHandler(RestHandler):
    
    def get(self):
        json_string = getPartys()
        self.SendJson(json_string)
        
class TopicExplorerHandler(RestHandler):
    
    def get(self):
        topic = getById(model.Topic, self.requesttopickey)
        relatedtopicdict = []
        for kt in topic.relatedtopics:
            t = getById(model.Topic, kt)
            if not t is None:
                relatedtopicdict.append({'name':t.name, 'id':t.key.id()})
        res = {"relatedtopics": relatedtopicdict}
        self.SendJson(res)

class ArticleHandler(RestHandler):
    
    def get(self):
        logging.debug("Fetching article record %s", self.requestarticlekey)
        articlejson = getArticle(self.requestarticlekey)
        self.SendJson(articlejson)
        
class ArticleFirstTopicHandler(RestHandler):
    
    def get(self):
        article = getById(model.Article, self.requestarticlekey())
        firstposition = article.positions[0].get()
        topickey = firstposition.topic
        topic = topickey.get()
        self.SendJson({"id":topickey.id(), "name":topic.name})

class ArticleArchiveHandler(RestHandler):
    
    def get(self):
        article = getById(model.Article, self.requestarticlekey())
        json_string = ""
        for pos in article.positions:
            if pos.topic == self.requesttopickey and pos.axis == self.requestaxiskey:
                json_string = getArticlePositionHistory(self.requesttopickey,self.requestaxiskey,pos.position)
        self.SendJson(json_string)

class TopicLatestHandler(RestHandler):
    def get(self):
        json_string = getTopicArticleHistory(self.requesttopickey)
        self.SendJson(json_string)
        
class VisitorAntibodLatestHandler(RestHandler):
    
    def get(self):
        visitor = self.getVisitor()
        json_string = getVisitorBodArticleHistory(visitor, self.requesttopickey, antibod=True)
        self.SendJson(json_string, expiry=0)

class VisitorBodLatestHandler(RestHandler):
    
    def get(self):
        visitor = self.getVisitor()
        json_string = getVisitorBodArticleHistory(visitor, self.requesttopickey, bod=True)
        self.SendJson(json_string, expiry=0)
        
class ArticleSearchHandler(RestHandler):
    
    def get(self):
        query = self.request.params.get('search')
        json_string = doSearch(query)
        self.SendJson(json_string, expiry=0)

class DialHandler(RestHandler):
    def get(self):
        dialtype = self.requestParam('dialtype')
        dialid = self.requestParamKey('dialid')
        othervisitorkey = self.requestcompareid if self.requestcomparetype == VISITOR else None
        authorkey = self.requestcompareid if self.requestcomparetype == AUTHORMP else None
        visitor = self.getVisitor()

        pos = None
        if dialtype == FRIEND:
            friend = visitor.friends[dialid]
            pos = getDialModelVisitor(friend, self.requestclientkey, othervisitorkey, authorkey, self.requesttopickey, self.requesttrending, randomblankaxis=True)
        
        if dialtype == VISITOR:
            pos = getDialModelVisitor(self.visitorkey, self.requestclientkey, othervisitorkey, authorkey, self.requesttopickey, self.requesttrending)
            
        if dialtype == VISITORAGG:
            cutoff = datetime.now() - timedelta(hours=12)
            pos = getDialModelVisitorAgg(self.requestclientkey, othervisitorkey, authorkey, self.requesttopickey, cutoff)
        
        if dialtype == AUTHORMP:
            pos = getDialModel(int(dialid), "authormotion", self.requesttopickey)

        if dialtype == AUTHORPPC:
            pos = getDialModel(int(dialid), "authorselfie", self.requesttopickey)

        if dialtype == AUTHORSTATEMENT:
            pos = getDialModel(int(dialid), AUTHORSTATEMENT, self.requesttopickey)

        if dialtype == PARTY:
            pos = getDialModel(int(dialid), "partystatement", self.requesttopickey)

        if dialtype == ORG or dialtype == ENTITY:
            pos = getDialModel(int(dialid), "orgaction", self.requesttopickey)

        if dialtype == ORGSAYS:
            pos = getDialModel(int(dialid), "orgsocialstatement", self.requesttopickey)
        
        self.SendJson(pos, expiry=1)            
            
class MatchesHandler(RestHandler):
    def get(self):
        matchtype = self.requestParam('matchtype')
        authorkey = self.requestParam("authorids")
        if authorkey is not None:
            authorkey = [int(a) for a in authorkey.split(",")]
        visitor = self.getVisitor()

        if matchtype == FRIEND:
            matches = getVisitorMatches(self.requesttopickey, visitor, self.requestclientkey, self.requesttrending, self.requestmatchid)

        self.SendJson({"matches":matches}, expiry=1)

class ComparisonHandler(RestHandler):
    def get(self):
        matchtype = self.requestParam('matchtype')

        visitor = self.getVisitor()
        if matchtype == VISITOR or matchtype == FRIEND:
            json_string = getVisitorComparison(visitor, self.requestmatchid, self.requestclientkey, self.requesttopickey, self.requesttrending, self.exactsourceentity)
        self.SendJson(json_string, expiry=1)


            
class EntitySummaryHandler(RestHandler):
    def get(self):
        entitytype = self.requestParam('entitytype')
        entityids = self.getBareKeysFromRequest("entityids")
        fetcher = getEntitySummaryAccessor(entitytype)
        resdict = {}
        for eid,af in zip(entityids,[fetcher(eid, async=True) for eid in entityids]):
            adict = af.get_result()
            resdict[str(eid)] = {} if adict is None else adict 
        self.SendJson(resdict)        
        
class StatementHandler(RestHandler):
    def get(self):
        othervisitorkey = self.requestcompareid if self.requestcomparetype == VISITOR else None
        authorkey = self.requestcompareid if self.requestcomparetype == AUTHORMP else None
        trending = self.requesttrending
        if trending is not None:
            trending = trending.replace(minute=0, second=0, microsecond=0)
        statementjson = getStatementFilter(self.requesttopickey, othervisitorkey, authorkey, self.requestclientkey, trending)
        self.SendJson(statementjson)     
            
class StatementInfoHandler(RestHandler):
    def get(self):
        statementid = self.requestParamInt("statementid")
        json_string = getStatementInfo(statementid)
        self.SendJson(json_string)        

class TagCloudHandler(RestHandler):

    def get(self):
        visitor = self.getVisitor()
        topiccountbyid = defaultdict(lambda : 0)
        latestvotes = {}
        for vote in visitor.votes:
            latestvotes[vote.statement.id()] = vote.reaction
    
        for statementid, reaction in latestvotes.iteritems():
            (statementid, reaction) = (int(statementid), int(reaction))
            if statementid < 0:
                continue
            statementkey = ndb.Key('Statement', statementid)
            statement = getById(model.Statement,statementkey)
            if statement is None:
                continue
            for statementposition in statement.positions:
                topiccountbyid[statementposition.topic] = topiccountbyid[statementposition.topic] + 1
        topiccountbyname = []
        for k, v in topiccountbyid.iteritems():
            topic = k.get()
            topiccountbyname.append({"name":topic.name, "size":v, "id":k.id()})
        topiccountbyname.sort(key=lambda e: e['size'], reverse=True)
        self.SendJson({"topiccount":topiccountbyname})

        
class AuthorSelfReactHandler(RestHandler):
    
    def get(self):
        opaquelink = self.requestParam("opaquelink")
        logging.info("Opaque link is %s" % opaquelink)
        authorid = getlink(opaquelink, "ppc2015", "author")
        res = getDatabaseCursor()
        r=res.executefetchall("select * from incoming_author_reactions where author_id = %s" % authorid)
        json = dumpjson({"reactions":r})
        self.SendJson(json)
    
    def put(self):
        visitor = self.getVisitor()
        opaquelink = self.requestParam("opaquelink")
        logging.info("Opaque link is %s" % opaquelink)
        authorid = getlink(opaquelink, "ppc2015", "author")
        statementid = self.requestParamInt('id')
        reaction = self.requestParamInt("reaction")
        when = datetime.now()
        taskqueue.add(url='/persist/authorselfreactions', queue_name='persister', 
                    params={'authorid':authorid, 'statementid':statementid, 'reaction':reaction, 'when':when})
    
class PartySelfReactHandler(RestHandler):
    
    def get(self):
        opaquelink = self.requestParam("opaquelink")
        logging.info("Opaque link is %s" % opaquelink)
        partyid = getlink(opaquelink, "ppc2015", "party")
        res = getDatabaseCursor()
        r=res.executefetchall("select * from incoming_party_reactions where party_id = %s" % partyid)
        json = dumpjson({"reactions":r})
        self.SendJson(json)
    
    def put(self):
        opaquelink = self.requestParam("opaquelink")
        logging.info("Opaque link is %s" % opaquelink)
        partyid = getlink(opaquelink, "ppc2015", "party")
        statementid = self.requestParamInt('id')
        reaction = self.requestParamInt("reaction")
        when = datetime.now()
        taskqueue.add(url='/persist/partyselfreactions', queue_name='persister', 
                    params={'partyid':partyid, 'statementid':statementid, 'reaction':reaction, 'when':when})
    
class AuthorSelfStatementHandler(RestHandler):
    
    def get(self):
        opaquelink = self.requestParam("opaquelink")
        logging.info("Opaque link is %s" % opaquelink)
        authorid = getlink(opaquelink, "ppc2015", "author")
        res = getDatabaseCursor()
        statements = res.executefetchall("select statement from incoming_author_statements where author_id = %s" % authorid)
        if len(statements) == 0:
            return
        json = dumpjson(statements[-1])
        self.SendJson(json)
    
    def put(self):
        opaquelink = self.requestParam("opaquelink")
        logging.info("Opaque link is %s" % opaquelink)
        authorid = getlink(opaquelink, "ppc2015", "author")
        statement = self.requestParam('statement')
        when = datetime.now()
        taskqueue.add(url='/persist/authorselfstatement', queue_name='persister', 
                    params={'authorid':authorid, 'statement':statement, 'when':when})
    
class BadgeHander(RestHandler):
    
    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def put(self):
        badgetype = self.request.params["badgetype"];
        achievement = ACHIEVEMENTS[badgetype]
        level=self.requestParamInt("level")
        count=self.requestParamInt("count")
        fortime=self.requestParamDateTimeFromJson("fortime")
        if fortime is not None:
            fortime = fortime.replace(minute=0, second=0, microsecond=0)
        clientid=self.requestParamInt("clientid")
        visitor = self.getVisitor()
        res = awardbadge(visitor, achievement['score'], self.requesttopickey, badgetype, level, count, clientid, fortime)
        visitor.put()
        self.SendJson(res)
        
class SuggestHandler(RestHandler):
    
    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def put(self):
        link = self.requestParam('link')
        author = self.requestParam('author')
        position = self.requestParam('position')
        note = self.requestParam('note')
        if not position is None:
            position = int( position)

        positions = [model.ArticlePosition(topic=self.requesttopickey, axis=self.requestaxiskey, position=position),]
        suggestion = model.Suggest(link=link, author=author, positions=positions, note=note, time=datetime.now())
        visitor = self.getVisitor()
        visitor.articlesuggests.append(suggestion)
        visitor.put()
        msg=suggestion.to_dict()
        msg['visitorid']=self.visitorkey.id()
        q = taskqueue.Queue('suggestion-queue')
        q.add(taskqueue.Task(name="suggest-"+str(self.visitorkey.id()), payload=dumpjson(msg), method='PULL'))



class RegisterHandler(RestHandler):
    
    @ndb.transactional(xg=True, retries=VISITORTRANSACTIONRETRIES)
    def put(self):
        name = self.request.params.get('name', None)
        email = self.request.params.get('email', None)
        visitor = self.getVisitor()
        if not name is None:
            visitor.name=name
        if not email is None:
            visitor.email=email
        visitor.put()
        self.SendJson({"needsregistering":visitor.email is None})        
        
    def get(self):
        visitor = self.getVisitor()
        self.SendJson({"needsregistering":visitor.email is None})        

class TopicHandler(RestHandler):
    def get(self):
        json_string=getTopicData(self.requesttopickey)
        self.SendJson(json_string)

class TrendingStatementsHandler(RestHandler):
    def get(self):
        fordate = self.requestParamDateTime("fordate")
        fordate = fordate.replace(minute=0, second=0, microsecond=0)
        json_string = getTrendingStatements(fordate)
        self.SendJson(json_string)

class InterestedTopicsHandler(RestHandler):
    
    def get(self):
        visitor = self.getVisitor()
        json_string=getVisitorInterestedTopics(visitor)
        self.SendJson(json_string)

STRIPTOCHARDIGITS = re.compile("[^a-zA-Z0-9]")        
class PostcodeFragmentSearch(RestHandler):
    def get(self):
        pcf = self.requestParam("pcf").lower()
        jsontext = getPostcode(pcf)
        self.SendJson(jsontext)
        
class FeaturedProductCategoriesHandler(RestHandler):
    def get(self):
        json_string = getFeaturedProductCategories()
        self.SendJson(json_string)  

class AllProductCategoriesHandler(RestHandler):
    def get(self):
        json_string = getAllProductCategories()
        self.SendJson(json_string)                
        
class ConstituencySearch(RestHandler):
    
    def get(self):
        conname = self.requestParam("conname").lower()
        jsontext = getConstituency(conname)
        self.SendJson(jsontext)

class AuthorReactionStats(RestHandler):
    def get(self):
        authorid = int(self.request.params.get('author_id', None))
        res = getDatabaseCursor()
        r=res.executefetchone("SELECT least(count(*)/40,1.0) as pctcomplete from (select distinct statement_id FROM pdops.incoming_author_reactions where author_id=%s) as a" % authorid)
        json = dumpjson({"reactionstats":r})
        self.SendJson(json)

class BrandNameListHandler(RestHandler):
    def get(self):
        table_name =  "pdops.org"
        sql_query = "SELECT org_id,name,category_ids,org_pic, description,  exclude_googlemap FROM "+table_name+" where featured like '%1%' order by name"
        sql_cursor = getDatabaseCursor()
        sql_response = sql_cursor.executefetchall(sql_query)
        json = dumpjson({"brandList":sql_response})
        self.SendJson(json)

class BrandLocationListHandler(RestHandler):
    def get(self):
        table_name =  "pdops.org"
        sql_query = "SELECT * FROM pdops.org_location"
        sql_cursor = getDatabaseCursor()
        sql_response = sql_cursor.executefetchall(sql_query)
        json = dumpjson({"brandLocation":sql_response})
        self.SendJson(json)

class CampaignListHandler(RestHandler):
    def get(self):
        sql_response = getCampaigns()
        json = dumpjson({"campaignList":sql_response})
        self.SendJson(json)        


class MPListHandler(RestHandler):
    def get(self):
        table_name =  "pdops.author"
        sql_query = "SELECT * FROM "+table_name+" where category_id ='1'"
        sql_cursor = getDatabaseCursor()
        sql_response = sql_cursor.executefetchall(sql_query)
        json = dumpjson({"politicianList":sql_response})
        self.SendJson(json)

class MPActionHandler(RestHandler):
    def get(self):
        table_name =  "pdops.action_citation"
        sql_query = "SELECT * FROM " + table_name + " where mp_id > '1'"
        sql_cursor = getDatabaseCursor()
        sql_response = sql_cursor.executefetchall(sql_query)
        json = dumpjson({"politicianActionCitation":sql_response})
        self.SendJson(json)

class CommentHandler(RestHandler):
    def post(self):
        reaction = int(self.requestParam("reaction"))
        statementid = self.requestParam("statementid")
        comment = str(self.requestParam("comment"))
        visitorid = self.session.get("visitorid", None)
        source = "PositionDial comment"
        comment_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sql_query = "INSERT INTO pdops.reaction_citation (reaction, statement_id, visitor_id,  origin, citation, made_date) VALUES (%s,%s,%s,\'%s\',\'%s\',\'%s\')"%(reaction,statementid,visitorid,source,comment,comment_date)
        logging.info(sql_query)
        sql_cursor = getDatabaseCursor()
        sql_response = sql_cursor.executefetchall(sql_query)
        logging.info("sql_response = %s",sql_response)
        json = dumpjson({"success":True})
        self.SendJson(json, expiry=1)
    def get(self):
        comment_list = []
        sql_response = getCommentsCitations()
        for comment in sql_response:
            if "visitor_id" in comment:
                visitor_obj = model.Visitor.get_by_id(comment['visitor_id'])
                if visitor_obj:
                    comment["name"] = visitor_obj.name
                else:
                    comment["name"] = "-"
            comment_list.append(comment)
        json = dumpjson({"commentList":comment_list})
        self.SendJson(json) 

ROUTES=[
        ('/rest/authorselfreact', AuthorSelfReactHandler),
        ('/rest/partyselfreact', PartySelfReactHandler),
        ('/rest/authorselfstatement', AuthorSelfStatementHandler),
        ('/rest/orgshareshandler', OrgShareStatsHandler),
        ('/rest/orgtopicshandler', OrgTopicHandler),
        ('/rest/matcheshandler', MatchesHandler),
        ('/rest/comparisonhandler', ComparisonHandler),
        ('/rest/orghandler', OrgHandler),
        ('/rest/topichandler', TopicHandler),
        ('/rest/clienthandler', ClientHandler),
        ('/rest/clienttopichandler', ClientTopicHandler),
        ('/rest/querytopics', QueryTopicHandler),
        ('/rest/queryaxiss', QueryAxisHandler),
        ('/rest/homehandler', HomeHandler),
        ('/rest/tagcloudhandler', TagCloudHandler),
        ('/rest/positionaxishandler', PositionAxisHandler),
        ('/rest/topicexplorerhandler', TopicExplorerHandler),
        ('/rest/topiclatesthandler', TopicLatestHandler),
        ('/rest/visitorantibodhandler', VisitorAntibodLatestHandler),
        ('/rest/visitorbodhandler', VisitorBodLatestHandler),
        ('/rest/visitorfollowtopic', VisitorTopicFollowedHandler),
        ('/rest/visitorignoretopic', VisitorTopicIgnoredHandler),
        ('/rest/visitordata', VisitorHandler),
        ('/rest/twosideshandler', TwoSidesHandler),
        ('/rest/authorhandler', AuthorHandler),
        ('/rest/partyhandler', PartyHandler),
        ('/rest/authorshandler', AuthorsHandler),
        ('/rest/authormpshandler', AuthorMPsHandler),
        ('/rest/partyshandler', PartysHandler),
        ('/rest/articlesearchhandler', ArticleSearchHandler),
        ('/rest/articlehandler', ArticleHandler),
        ('/rest/entitieshandler', EntitySummaryHandler),
        ('/rest/articlearchivehandler', ArticleArchiveHandler),
        ('/rest/articlefirsttopichandler', ArticleFirstTopicHandler),
        ('/rest/dialhandler', DialHandler),
        ('/rest/statementhandler', StatementHandler),
        ('/rest/statementinfohandler', StatementInfoHandler),
        ('/rest/featuredproductcategories', FeaturedProductCategoriesHandler),
        ('/rest/allproductcategories', AllProductCategoriesHandler),
        ('/rest/badgehandler', BadgeHander),
        ('/rest/suggest', SuggestHandler),
        ('/rest/register', RegisterHandler),
        ('/rest/sharehistoryhandler', ShareHistoryHandler),
        ('/rest/interestedtopics', InterestedTopicsHandler),
        ('/rest/trendingstatements', TrendingStatementsHandler),
        ('/rest/postcodelocationauthorsearch', PostcodeFragmentSearch),
        ('/rest/locationauthorsearch', ConstituencySearch),
        ('/rest/authorreactionstats', AuthorReactionStats),
        ('/rest/getbrands', BrandNameListHandler),
        ('/rest/getbrandslocation', BrandLocationListHandler),
        ('/rest/getcitations', CitationsHandler),
        ('/rest/getcampaigns', CampaignListHandler),
        ('/rest/getpoliticians', MPListHandler),
        ('/rest/getmpaction', MPActionHandler),
        ('/rest/comment', CommentHandler),
]
app=common.env.startWSGIServer(ROUTES)

