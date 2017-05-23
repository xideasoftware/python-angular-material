
import json

from google.appengine.api import search
from google.appengine.ext import ndb

from common.cache import Cache
from ui.article import getArticleSummary
import cachemodels


DOCUMENT_INDEX_NAME = 'documentindex'

DOCUMENT_INDEX = search.Index(name=DOCUMENT_INDEX_NAME)

@Cache(cachemodels.ShortJsonCache)
def doSearch(query):
    search_results = DOCUMENT_INDEX.search(query)
    returned_count = len(search_results.results)
    number_found = search_results.number_found
    articlekeys = []
    for doc in search_results:
        doc_id = doc.doc_id
        articlekey = ndb.Key("Article", int(str(doc_id)))
        articlekeys.append(articlekey)
    oldarticlefutures = [getArticleSummary(t) for t in articlekeys]
    articlearchive = []
    for oldarticlefut in oldarticlefutures:
        oldarticle = oldarticlefut.get_result()
        if oldarticle['isvalid']:
            articlearchive.append({"article_id":oldarticle['article_id'], "pic":oldarticle['pic'], "link":oldarticle['link'], 
                                   "headline":oldarticle['headline'], "source":oldarticle['source'], "onsite":oldarticle['onsite'] ,
                                   "author":oldarticle['author'], "safelink":oldarticle['safelink'],
                                   "firsttopic":oldarticle['firsttopic'], "firstaxis":oldarticle['firstaxis'],
                                   })
    
    json_string = json.dumps({"articlesearch":articlearchive}, ensure_ascii=True, encoding='utf-8')
    return json_string        
