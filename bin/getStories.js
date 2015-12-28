var feed = require("feed-read");

// Database
var db = require('monk')('localhost:27017/ttu2');

feed('http://www.techannounce.ttu.edu/Client/ViewRss.aspx', function(err, articles) {
    if(err) throw err;

    console.log(articles.length + ' stories found.');

    var match;
    // clean up articles
    articles.forEach(function (story) {
        // fix names
        match = story.author.match(/(.+@ttu.edu) \((.*)\)/);
        story.author = {
            name: match[2],
            email: match[1] //.toLowerCase(),
        };

        // remove redundant
        delete story.feed;
        delete story.link;
    });

    // push them to the database
    db.get('ttu2').insert(articles, function (err, doc) {
        console.log(doc.length + ' stories added.');
        db.close();
    });
});