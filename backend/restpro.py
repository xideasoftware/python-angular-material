
import webapp2

from common.env import isProduction
from common.q import query
from config import webapp2config


from common.web import, RestHandler


class ProRestHandler(RestHandler):
    
    def dispatch(self):
        # CHECK IS PRO USER
        super(RestHandler, self).dispatch()
                
class TwitterTopTopicMatches(ProRestHandler):
    
    def get(self):    
        self.SendJson({"toptweettopicmatches":query(self.requestorgkey.id(),"selecttoptopicmatches[]")})
        
class TwitterTopConversationKeywords(ProRestHandler):
    
    def get(self):    
        res = []
        for item in query(self.requestorgkey.id(),'flip `keyword`count!{(key x;value x)} desc count each group lower raze conversation[`textenum]'):
            if len(res) > 500:
                break
            keyword = item['keyword'].lower()
            if keyword in STOPWORDS:
                continue
            if keyword.startswith("http"):
                continue
            if len(keyword) < 2 or len(keyword) > 20:
                continue
            if keyword.isdigit():
                continue
            res.append({'label':item['keyword'], 'value':int(item['count'])})
        self.SendJson({"topconversationkeywords":res})

ROUTES = [
        ('/restpro/toptweettopicmatches', TwitterTopTopicMatches),
        ('/restpro/topconversationkeywords', TwitterTopConversationKeywords),
]
app=common.env.startWSGIServer(ROUTES)


STOPWORDS=frozenset(['all', 'gt', 'show', 'anyway', 'four', 'latter', 'per', 'go', 'mill', 'find', 'seemed', 'one', 'whose', 
                     'everything', '(', 'whoever', 'enough', 'should', 'to', 'only', 'under', 'must', 'do', 'his', 'get', 
                     'very', 'de', 'none', 'cannot', 'every', 'yourselves', 'him', 'becomes', '`', 'made', 'cry', 'this', 
                     'she', 'where', 'ten', 'up', 'namely', 'are', 'further', 'click', 'sincere', 'even', 'what', 'mine', 
                     '+', 'please', 'yet', 'behind', 'above', 'between', 'it', 'neither', 'ever', 'across', 'can', 'we', 
                     'full', 'youd', 'never', 'however', 'here', 'others', 'alone', 'along', 'fifteen', 'both', 'toward', 
                     'last', 'many', 'whereafter', 'wherever', 'against', 'etc', 'amount', 'became', '{', 'whole', '',
                     'otherwise', 'among', 'via', 'co', 'afterwards', 'had', 'whatever', 'except', 'hers', '\n', ' ',
                     'moreover', 'throughout', '[', 'from', 'would', '&', 'two', 'been', 'next', 'eleven', 'httpwww', 
                     'much', 'call', 'therefore', 'interest', 'themselves', 'thru', 'until', 'empty', 'more', 'rather', 
                     'fire', 'beforehand', 'hereby', 'else', 'everywhere', 'former', 'those', '^', 'me', 'myself', 'these', 
                     'bill', 'will', 'while', 'anywhere', 'nine', 'thin', 'my', '~', 'whenever', 'give', 'almost', 
                     'is', 'thus', 'herein', 'cant', 'itself', 'something', 'in', 'keep', 'ie', 'if', '!', ')', 'six', 
                     'same', 'wherein', 'beside', 'how', 'when', 'several', 'may', 'after', 'upon', 'hereupon', 'such', 
                     'a', 'off', 'whereby', 'third', 'together', 'nevertheless', 'well', 'perhaps', 'without', 'so', 
                     'the', 'con', 'yours', 'less', 'being', 'indeed', 'over', 'move', 'not', 'own', 'through', 'during', 
                     'fify', 'still', 'its', 'before', '$', 'thence', 'somewhere', 'thick', 'seems', ',', 'lt', 'ours', 
                     'has', 'might', '<', 'then', 'them', 'someone', 'around', 'thereby', 'five', 'they', 'front', 'amp', 
                     'now', '\\', 'nor', 'name', 'hereafter', 'always', 'whither', 'either', 'each', 'become', '|', 'http',
                     'therein', 'twelve', 'weve', 'because', 'often', 'there', 'eg', 'some', 'back', 'our', 'beyond', 
                     'ourselves', 'out', 'rt', 'for', 'bottom', 'although', 'since', 'forty', '/', 're', 'am', 'three', '?', 
                     'thereupon', 'be', 'sixty', 'whereupon', 'nowhere', 'besides', 'found', 'put', 'anyhow', 'by', '_', 'on', 
                     'about', 'anything', 'of', 'could', 'side', 'whence', 'due', 'ltd', 'hence', 'onto', 'or', 'first', 
                     'already', 'seeming', 'formerly', 'into', 'within', 'yourself', 'down', 'everyone', 'done', 'another', 
                     'couldnt', '.', 'your', '"', 'fill', 'her', 'whom', 'twenty', 'top', '*', 'system', 'least', 'anyone', 
                     'their', 'too', ':', 'was', 'himself', 'elsewhere', 'mostly', 'that', 'becoming', 'nobody', 'amongst', 
                     'somehow', 'part', '@', 'herself', 'than', 'he', 'hundred', 'whether', 'see', 'us', 'i', 'below', 'un', 
                     'were', '>', 'and', 'describe', '\r', 'few', 'an', 'meanwhile', '\n\r', 'as', 'sometime', 'at', 'have', 
                     ';', 'seem', 'any', 'inc', 'again', 'hasnt', '%', 'no', 'whereas', '-', 'detail', 'also', 'other', 'take', 
                     'which', 'latterly', 'you', '=', 'towards', 'though', 'thereafter', 'who', '#', 'most', 'eight', 'but', 
                     'nothing', ']', 'why', "'", '}', 'noone', 'sometimes', 'amoungst', '\r\n', 'serious', 'with', 'once'])
        