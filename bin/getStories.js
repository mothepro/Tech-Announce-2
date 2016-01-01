var feed = require('feed-read');
var db = require('monk')('localhost:27017/ttu2');

var getStories = function(close) {
    close = !!close;
    var match;

    feed('http://www.techannounce.ttu.edu/Client/ViewRss.aspx', function (err, articles) {
        if (err) throw err;

        console.log(articles.length + ' stories found.');

        // clean up articles
        articles.forEach(function (story) {
            // fix names
            match = story.author.match(/(.+@.+) \((.*)\)/);
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
            if(err)     throw err;
            if(close)   db.close();

            console.log(doc.length + ' stories added.');
        });
    });
};

if(process.argv[2]) { // run as cronjob
    process.argv.splice(0, 2);

    var cron = require('cron').CronJob,
        src = process.argv.join(' ').replace(/'|"/g, '');

    console.log('Getting stories on cron "'+ src +'".');

    new cron(src, getStories, function() { db.close(); }, true);
} else // do it once now
    getStories(true);