
from authomatic.providers import oauth2, oauth1, openid, gaeopenid


CONFIG = {

    'tw': { # Your internal provider name

        # Provider class
        'class_': oauth1.Twitter,

        # Twitter is an AuthorizationProvider so we need to set several other properties too:
        'consumer_key': '5bLNSrmb8lXJECl7wqEefZnBL',
        'consumer_secret': 'qImoKotg1ZjqDwCnTAbWrGqAhb9L8KGKYJcvWWv5U5kjaAA1iu',
    },

    'fb': {

        'class_': oauth2.Facebook,

        # Facebook is an AuthorizationProvider too.
        'consumer_key': '1443870575872026',
        'consumer_secret': 'e5f4a5d97cb7bbce7b2e50ed4cd53ea4',

        # But it is also an OAuth 2.0 provider and it needs scope.
        'scope': ['user_about_me', 'email'],
    },

    'gae': {

        # OpenID provider based on Google App Engine Users API.
        # Works only on GAE and returns only the id and email of a user.
        # Moreover, the id is not available in the development environment!
        'class_': gaeopenid.GAEOpenID,
    },

    'oi': {

        # OpenID provider based on the python-openid library.
        # Works everywhere, is flexible, but requires more resources.
        'class_': openid.OpenID,
    }
}

webapp2config = {}
webapp2config['webapp2_extras.jinja2'] = {'template_path':['templates','app/partials'],
                            'environment_args': {
                                 'variable_start_string': '[[',
                                 'variable_end_string': ']]'}}
webapp2config['webapp2_extras.sessions'] = {
    'secret_key': 'jhipj;dajouhdfdfpouhau////ogjhwaipjsdpnf///dsfa;ksnd;kmcxvzj[jzji/[e[ewt7oy4ht9b023853u-ujdnsfounsdfsf',
    'session_max_age': 60*60*24*14,
    'cookie_args': { 'max_age': 60*60*24*14,
                    }
}
webapp2config['webapp2_extras.auth'] = {
                                'user_model': 'authmodels.User',
                                'user_attributes': ['name']
                                }

sqldatabase={'research':{'host':'dbmain.positiondial.com',
                         'user':'admin',
                         'passwd':'position!DB123',
                         'db':'pdops',
                         'unix_socket':'/cloudsql/positiondial-www:main',
                         }
             };

VISITOR = 'visitor'
VISITORAGG = 'visitoragg'
AUTHORMP = 'authormp'
AUTHOR = 'author'
AUTHORSTATEMENT = 'authorstatement'
AUTHORPPC = 'authorppc'
ENTITY = 'entity'
ORG = 'org'
ORGSAYS = 'orgfollowers'
PARTY = 'party'
FRIEND = 'friend'
CAMPAIGN = 'campaign'


dataplatformhostconfig={'stats':{'primaryhost':'stats2.positiondial.com','primaryhostinternal':'pdstats2'},
                        'feed':{'primaryhost':'feed.positiondial.com','primaryhostinternal':'pdfeed1'},
                        }

dataplatformconfig={'GrangeHotels':{'primaryhost':'admin.positiondial.com','port':40000},
             'grangehotelskeywords':{'primaryhost':'admin.positiondial.com','port':40001},
             'AspinalofLondon':{'primaryhost':'admin.positiondial.com','port':40002},
             'aspinalskeywords':{'primaryhost':'admin.positiondial.com','port':40003},
             'wisdomkeywords':{'primaryhost':'admin.positiondial.com','port':40004},
             'thstoolskeywords':{'primaryhost':'admin.positiondial.com','port':40005},
             'HawesAndCurtis_':{'primaryhost':'admin.positiondial.com','port':40006},
             'hawesandcurtiskeywords':{'primaryhost':'admin.positiondial.com','port':40007},
             'ItsuOfficial':{'primaryhost':'admin.positiondial.com','port':40008},
             'itsukeywords':{'primaryhost':'admin.positiondial.com','port':40009},
             'trending':{'host':'feed','port':40010},
             'feed':{'host':'feed', 'port':30001},
             'stats':{'host':'stats', 'port':40011},
             '531':{'host':'stats', 'port':40012},
             '811':{'host':'stats', 'port':40006},
             'user':{'host':'stats', 'port':40040},
             'stattests':{'host':'stats', 'port':40044},
             }

dataplatformhostconfigdev={'stats':{'primaryhost':'stats2.positiondial.com','primaryhostinternal':'pdstats2'}}
dataplatformconfigdev={'user':{'host':'stats', 'port':40045}, 'stats':{'host':'stats', 'port':40046}}


jssource=['util','controllers','serverservices','directives','factories','filters','dialdirectivecontroller','services','c',
          'shareservice','matchservice','statsservice','app','datacacheservice']

csssource=['new','dial','pd-theme']

ACHIEVEMENTS={
              'TOPICCOMPLETE':{'typ':'Completed Topic','score':1},
              'CHANNELLEVELCOMPLETE':{'typ':'Completed Channel Level','score':1},
              'NBADGES':{'typ':'Completed Amount','score':1},
              'TRENDINGCOMPLETE':{'typ':'Completed Trending','score':1},
              }

if __name__ == "__main__":
    for js in jssource:
        print js

PARTIALCDN = '/cdn/partials/'
DEFAULTPARTIALS = ['nav','navmobile','opinions','footer','sidebar','menu','topicsheetpickergrid','resetpassword','dialview','splash','account','home','positionmatches','matchesaggregated','yourlevel','voting']
DEFAULTCONTROLLERS = ['nav','dial','yourlevel','account','statementpopup','partystatementpopup','authorstatementpopup','sidebar','addarticle','resetpassword','voting','requestpassword']

VISITORTRANSACTIONRETRIES = 10
MAXCONCURRENTBACKGROUND = 7
STREAMLENGTH = 1000
CMSTIMEOUT = 30

ANALYTICSSALT = 'bnkvhutpstxgzyosolcijayciuhvrsmbldjmwsvpfuhatckfvdufhhhwvrbonnjl'

DEFAULTFEED="feed"
