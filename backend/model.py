from datetime import datetime

from google.appengine.ext import ndb


__externalmodelregister = {}

def registerExternal(m):
    __externalmodelregister[m.__name__] = m 

def getExternalModel(name):
    return __externalmodelregister[name]

#MARKER CLASS FOR MODELS THAT LIVE IN THE DATAPLATFORM INSTEAD OF THE NAMEVALUE STORE
#ALL MODELS MUST BE REGISTERED IF USED EXTERNALLY, BUT DONT NEED DEFINITIONS AS YET
class DataPlatformModel(ndb.Expando):
    pass

#MARKER CLASS FOR MODELS THAT LIVE IN THE CMS INSTEAD OF THE NAMEVALUE STORE
#ALL MODELS MUST BE REGISTERED IF USED EXTERNALLY, BUT DONT NEED DEFINITIONS AS YET
class CMSModel(ndb.Expando):
    pass

@registerExternal
class Webpage(DataPlatformModel):
    pass

@registerExternal
class Tweet(DataPlatformModel):
    pass

@registerExternal
class RssStory(DataPlatformModel):
    pass

@registerExternal
class Urls(DataPlatformModel):
    pass


class Topic(ndb.Model):
    name = ndb.StringProperty()
    enabled = ndb.BooleanProperty(default=True)
    pic = ndb.StringProperty(default="")
    featured = ndb.BooleanProperty(default=False)
    childtopics = ndb.KeyProperty(kind='Topic', repeated=True, indexed=False)
    parenttopics = ndb.KeyProperty(kind='Topic', repeated=True, indexed=False)
    priorityaxis = ndb.KeyProperty(kind='Axis', repeated=True, indexed=False)
    homefeatures = ndb.KeyProperty(kind='HomeFeature', repeated=True, indexed=False)
    relatedtopics = ndb.KeyProperty(kind='Topic', repeated=True, indexed=False)
    shortlink = ndb.TextProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)
    
class Axis(ndb.Model):
    name = ndb.StringProperty()
    enabled = ndb.BooleanProperty(default=True)
    label_1 = ndb.StringProperty()
    label_2 = ndb.StringProperty()
    featured = ndb.BooleanProperty(default=False)  
    shortlink = ndb.TextProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)
    
class MotionVote(ndb.Model):
    motion = ndb.KeyProperty(kind="Statement")
    author = ndb.KeyProperty(kind="Author")
    reaction = ndb.IntegerProperty()
    shortlink = ndb.TextProperty()

class ProductCategory(ndb.Model):
    name = ndb.StringProperty()
    parent_name = ndb.StringProperty()
    featured = ndb.BooleanProperty()

class Org(ndb.Model):
    name = ndb.StringProperty()
    country = ndb.StringProperty()
    enabled = ndb.BooleanProperty()
#added exclude_amazon and exclude_googlemap - making it a string as Boolean creates error
    exclude_amazon = ndb.StringProperty()
#added exclude_googlemap and affiliate_link and price
    exclude_googlemap = ndb.StringProperty()
    category = ndb.StringProperty()
    twitter_id = ndb.StringProperty()
    link = ndb.StringProperty()
    affiliate_link = ndb.StringProperty()
    categorys = ndb.KeyProperty(kind=ProductCategory, repeated=True, indexed=False)
    org_pic = ndb.StringProperty()
    description = ndb.StringProperty()
    price = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)

class Campaign(ndb.Model):
    name = ndb.StringProperty()
    link = ndb.StringProperty()
    details = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)

class SourceCategory(ndb.Model):
    name = ndb.StringProperty()

class Source(ndb.Model):
    name = ndb.StringProperty()
    link = ndb.StringProperty()
    category = ndb.StructuredProperty(SourceCategory, repeated=False, indexed=True)
    pic = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)

class Author(ndb.Model):
    name = ndb.StringProperty()
    authorpic = ndb.StringProperty(indexed=False)
    about = ndb.StringProperty()
    location = ndb.StringProperty()
    enabled = ndb.BooleanProperty()
    weburl = ndb.StringProperty(indexed=False)
    twitterurl = ndb.StringProperty(indexed=False)
    authorppcstatement = ndb.StringProperty(indexed=False) 
    fburl = ndb.StringProperty(indexed=False)
    category = ndb.StringProperty()
    mp_2015 = ndb.StringProperty()
    party = ndb.StringProperty()
    constituency = ndb.StringProperty(indexed=False)
    sources = ndb.KeyProperty(kind=Source, repeated=True)
    twfyurl = ndb.StringProperty(indexed=False)
    honorificprefix = ndb.StringProperty(indexed=False)
    honorificsuffix = ndb.StringProperty(indexed=False)
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)
    
        
class Article(ndb.Model):
    enabled = ndb.BooleanProperty(default=False)
    onsite = ndb.BooleanProperty(default=False)
    headline = ndb.StringProperty()
    source = ndb.KeyProperty(kind=Source)
    pic = ndb.StringProperty()
    publish_date = ndb.DateTimeProperty()
    author = ndb.KeyProperty(kind=Author)
    link = ndb.TextProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)

class Statement(ndb.Model):
    complexity = ndb.IntegerProperty()
    enabled = ndb.BooleanProperty(default=True)
    article = ndb.KeyProperty(kind=Article)
    author = ndb.KeyProperty(kind=Author)
    citations = ndb.KeyProperty(kind='Citation', repeated = True)
    actioncitations = ndb.KeyProperty(kind='ActionCitation', repeated = True)
    opposite = ndb.KeyProperty(kind='Statement')
    pic = ndb.StringProperty()
    publish_date = ndb.DateTimeProperty()
    made_date = ndb.DateTimeProperty()
    text = ndb.TextProperty()
    info = ndb.TextProperty()
    motiontext = ndb.TextProperty()
    link = ndb.TextProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)
        
class HomeFeature(ndb.Model):
    topic = ndb.KeyProperty(kind=Topic)
    axis = ndb.KeyProperty(kind=Axis)
    article_left = ndb.KeyProperty(kind=Article)
    article_right = ndb.KeyProperty(kind=Article)
    featured_in_home = ndb.BooleanProperty(default=True)
    featured_date = ndb.DateTimeProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)
 
class NavigationStrip(ndb.Model):
    topic = ndb.KeyProperty(kind=Topic)
    enabled = ndb.BooleanProperty(default=True)
    priority = ndb.IntegerProperty()    

class PageCopy(ndb.Model):
    name = ndb.StringProperty()
    content = ndb.StringProperty(indexed=False, default="")

class StatementVote(ndb.Model):
    statement = ndb.KeyProperty(kind=Statement)
    reaction = ndb.IntegerProperty()    
    time = ndb.DateTimeProperty(default = datetime.now())

class Badge(ndb.Model):
    score = ndb.IntegerProperty() 
    level = ndb.IntegerProperty()   
    client = ndb.IntegerProperty() 
    fortime = ndb.DateTimeProperty()  
    count = ndb.IntegerProperty()   
    topic = ndb.KeyProperty(kind=Topic)
    time = ndb.DateTimeProperty(default = datetime.now())
    typ = ndb.StringProperty()   

class DialShare(ndb.Model):
    provider = ndb.StringProperty()
    dialtype = ndb.StringProperty()
    dialid = ndb.IntegerProperty()
    clientid = ndb.IntegerProperty()
    topicid = ndb.IntegerProperty()
    time = ndb.DateTimeProperty(default = datetime.now())

class Identity(ndb.Model):
    provider = ndb.StringProperty()
    name = ndb.StringProperty()
    external_id = ndb.GenericProperty()
    email = ndb.StringProperty()

class FollowTopic(ndb.Model):
    topic = ndb.KeyProperty(kind=Topic)
    follow = ndb.BooleanProperty()
        
class IgnoreTopic(ndb.Model):
    topic = ndb.KeyProperty(kind=Topic)
    ignore = ndb.BooleanProperty()

class InterestedTopics(ndb.Model):
    topic = ndb.KeyProperty(kind=Topic)
    weight = ndb.FloatProperty(default=1.0)
        
class Visitor(ndb.Model):
    _default_indexed = False
    name = ndb.StringProperty(indexed=False)
    referer = ndb.StringProperty(indexed=False)
    identities = ndb.StructuredProperty(Identity, repeated = True, indexed=True)
    votes = ndb.LocalStructuredProperty(StatementVote, repeated = True, indexed=False)
    badges = ndb.LocalStructuredProperty(Badge, repeated = True, indexed=False)
    dialshares = ndb.LocalStructuredProperty(DialShare, repeated = True, indexed=False)
    suggests = ndb.LocalStructuredProperty('Suggest', repeated = True, indexed=False)
    followedtopics = ndb.LocalStructuredProperty(FollowTopic, repeated = True, indexed=False)
    ignoredtopics = ndb.LocalStructuredProperty(IgnoreTopic, repeated = True, indexed=False)
    interestedtopics = ndb.LocalStructuredProperty(FollowTopic, repeated = True, indexed=False)
    email = ndb.StringProperty(indexed=False)
    experimentId = ndb.StringProperty(indexed=False, default="")    
    variationId = ndb.IntegerProperty(indexed=False, default=-1)    
    pic = ndb.StringProperty(indexed=False)
    friends = ndb.KeyProperty('Visitor', repeated = True)
    created = ndb.DateTimeProperty(indexed=False, auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)

class Client(ndb.Model):
    name = ndb.StringProperty()
    enabled = ndb.BooleanProperty(default=True)
    accesskey = ndb.StringProperty()
    topic_ids=ndb.KeyProperty(kind=Topic, repeated=True, indexed=False)
    statement_ids=ndb.KeyProperty(kind=Statement, repeated=True, indexed=False)
    allowed_referers = ndb.StringProperty(repeated=True, indexed=False)
    vanityurl = ndb.StringProperty()
    imageurl = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)

class Share(ndb.Model):
    link = ndb.StringProperty(indexed=False)
    imglink = ndb.StringProperty(indexed=False)
    imagedataurl = ndb.TextProperty()
    data = ndb.PickleProperty(indexed=False, compressed=True)
    created = ndb.DateTimeProperty(auto_now_add = True, indexed=True)
    visitor = ndb.KeyProperty(kind=Visitor)

class Party(ndb.Model):
    name = ndb.StringProperty()
    pic = ndb.StringProperty()
    twitter = ndb.StringProperty()
    facebook = ndb.StringProperty()
    url = ndb.StringProperty( indexed=False) 
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=True)
    
class Citation(ndb.Model):
    citation = ndb.StringProperty( indexed=False)
    reaction = ndb.IntegerProperty()
    statement = ndb.KeyProperty( kind=Statement, indexed=False)
    author = ndb.KeyProperty(kind=Author, repeated=False, indexed=False)
    mp = ndb.KeyProperty(kind=Author, repeated=False, indexed=False)
    commentator = ndb.KeyProperty(kind=Author, repeated=False, indexed=False)
    campaign = ndb.KeyProperty(kind=Campaign, repeated=False, indexed=False)
    party = ndb.KeyProperty(kind=Party, repeated=False, indexed=False)
    org = ndb.KeyProperty(kind=Org, repeated=False, indexed=False)
    visitor = ndb.KeyProperty(kind=Visitor, repeated=False, indexed=False)
    origin = ndb.StringProperty()
    madedate = ndb.DateTimeProperty()
    datechecked = ndb.DateTimeProperty()
    url = ndb.StringProperty( indexed=False) 
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=True)

class ActionCitation(ndb.Model):
    citation = ndb.StringProperty( indexed=False)
    reaction = ndb.IntegerProperty()
    statement = ndb.KeyProperty( kind=Statement, indexed=False)
    author = ndb.KeyProperty(kind=Author, repeated=False, indexed=False)
    mp = ndb.KeyProperty(kind=Author, repeated=False, indexed=False)
    commentator = ndb.KeyProperty(kind=Author, repeated=False, indexed=False)
    campaign = ndb.KeyProperty(kind=Campaign, repeated=False, indexed=False)
    party = ndb.KeyProperty(kind=Party, repeated=False, indexed=False)
    org = ndb.KeyProperty(kind=Org, repeated=False, indexed=False)
    visitor = ndb.KeyProperty(kind=Visitor, repeated=False, indexed=False)
    series = ndb.StringProperty()
    rating = ndb.StringProperty()
    madedate = ndb.DateTimeProperty()
    datechecked = ndb.DateTimeProperty()
    link = ndb.StringProperty( indexed=False) 
    sourcelink = ndb.StringProperty( indexed=False) 
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=True)
    
class Suggest(ndb.Model):
    reaction = ndb.IntegerProperty()
    citation = ndb.TextProperty()
    by = ndb.StringProperty()
    statement = ndb.KeyProperty(Statement)
    citation = ndb.KeyProperty(Citation)
    topic = ndb.KeyProperty(Topic)
    author = ndb.KeyProperty(Author)
    note = ndb.TextProperty()
    accepted = ndb.BooleanProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=True)

# DataPlatform Position Classes - don't live in datastore    
class Position(DataPlatformModel):
    topic = ndb.KeyProperty(kind=Topic)
    axis = ndb.KeyProperty(kind=Axis)
    position = ndb.IntegerProperty()
    shortlink = ndb.TextProperty()
    created = ndb.DateTimeProperty(auto_now_add = True)
    modified = ndb.DateTimeProperty(auto_now = True, indexed=False)

class StatementPosition(Position):
    statement = ndb.KeyProperty(kind="Statement", )
        
class ArticlePosition(Position):
    article = ndb.KeyProperty(kind="Article")

class AuthorPosition(Position):
    author = ndb.KeyProperty(kind="Author")

class CampaignPosition(Position):
    campaign = ndb.KeyProperty(kind="Campaign")

class OrgActionPosition(Position):
    entity = ndb.KeyProperty(kind="Org")

class OrgSaidPosition(Position):
    entity = ndb.KeyProperty(kind="Org")    
















