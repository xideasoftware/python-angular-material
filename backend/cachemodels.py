
from google.appengine.ext import ndb


class GenericCache(ndb.Model):
    payload = ndb.PickleProperty()
    funcname = ndb.StringProperty(indexed=True)
    args = ndb.PickleProperty()
    kwargs = ndb.PickleProperty()
    release = ndb.StringProperty(indexed=False, default = "")
    checksum = ndb.IntegerProperty(indexed=False, default = -1)
    created = ndb.DateTimeProperty(indexed=True)
    accessed = ndb.DateTimeProperty(indexed=False)
    weight = ndb.FloatProperty(indexed=False, default = 0.0)
    persistent = ndb.BooleanProperty(indexed=False, default = False)
    size = ndb.IntegerProperty(indexed=True)
    duration = ndb.FloatProperty(indexed=False)

class WebPageCache(GenericCache):
    pass

class StorageCache(GenericCache):
    pass
    
class JsonCache(GenericCache):
    pass

class ShortJsonCache(GenericCache):
    pass

class InstanceCache(GenericCache):
    pass

class ImageCache(GenericCache):
    EXPIRY = 7200
    pass

class SingletonCache(GenericCache):
    pass
