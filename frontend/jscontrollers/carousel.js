
pdapp.controller('carouselCtrl',['$scope', function($scope) {

    $scope.quotes = [
        {
            "quote": "Really makes you think",
            "author": "Amzath, Senegal",
            "link": ""
        },
        {
            "quote": "Figure out how your opinions and values map to the world around you",
            "author": "@Haje",
            "link": "https://twitter.com/Haje/status/582622791947710464"
        },
        {
            "quote": "Insightful comparison to party politics and where you stand",
            "author": "UH Student 9 (anonymous feedback)",
            "link": ""
        },
        {
            "quote": "The best political quiz to help you understand your position I have seen",
            "author": "Ben Page, Ipsos MORI",
            "link": "https://twitter.com/benatipsosmori/status/587522418622644224"
        },
        {
            "quote": "There's a particularly intriguing section called Antibod which gives you a news stream of articles that challenges your political views",
            "author": "Louise Ridley @ Huffington Post",
            "link": "http://www.huffingtonpost.co.uk/2015/03/31/who-should-i-vote-for-general-election_n_6977452.html"
        },
        {
            "quote": "Great app in finding your political alignments based on 2015 policies",
            "author": "@JonMorter",
            "link": "https://twitter.com/JonMorter/status/574866625091891201"
        },
        {
            "quote": "Quite fun",
            "author": "John Ray, Polis @ LSE",
            "link": "http://blogs.lse.ac.uk/polis/2014/11/27/positiondial-and-the-joys-of-self-discovery/"
        },
        {
            "quote": "I get really p***ed off when I read an article and I think, I know there's more to it than this, it's great to see the other side, fast",
            "author": "Rob, England",
            "link": ""
        },
        {
            "quote": "Essentially Tinder for political opinions - PositionDial helps you to understand exactly where you are on the political spectrum",
            "author": "Carmen Fishwick @ The Guardian",
            "link": "http://www.theguardian.com/politics/2015/apr/09/who-should-i-vote-for-in-2015-general-election-heres-some-internet-tools-to-help"
        },
        {
            "quote": "an interesting tool that allows you to question your belief systems",
            "author": "Gaia Marcus",
            "link": "https://twitter.com/la_gaia/status/585571771673370626"
        },
        {
            "quote": "Refreshing to see a site that is helping to break down the filter bubble",
            "author": "Kat, US",
            "link": ""
        },
        {
            "quote": "The most comprehensive and useable of all the [political] quizzes",
            "author": "Jessica Wilkins, London24",
            "link": "http://www.london24.com/election-2015/who_to_vote_for_the_in_general_election_2015_the_top_5_political_quizzes_1_4037560"
        },
        {
            "quote": "*star pick for wonks* - There's a cool dial widget that spins around and tells you your political stance as you go",
            "author": "Kelly McBride, Democratic Society",
            "link": "http://ge15.demsoc.org/citizens-guide/how-to-decide/voter-advice-applications"
        },
        {
            "quote": "The test of a first-rate intelligence is the ability to hold two opposed ideas in mind at the same time and still retain the ability to function.",
            "author": "F. Scott Fitzgerald",
            "link": ""
        },
        {
            "quote": "If there is any one secret of success, it lies in the ability to get the other person's point of view and see things from that person's angle as well as your own.",
            "author": "Henry Ford via Dale Carnegie",
            "link": ""
        }
    ];

    $scope.slickConfig = {
        autoplay: true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        method: {},
        event: {},
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

}]);