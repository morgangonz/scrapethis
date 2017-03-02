var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

// Require handlebars
var exphbs = require('express-handlebars');
// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
  defaultLayout: 'main',
});
// Set up view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Require request and cheerio. This makes the scraping possible
var request = require('request');
var cheerio = require('cheerio');

// Require mongoose and mongodb objectid
var mongoose = require('mongoose');
var ObjectId = require('mongojs').ObjectID;

// Database configuration
mongoose.connect('mongodb://localhost/scraper');
var db = mongoose.connection;

// Show any mongoose errors
db.on('error', function(err) {
  console.log('Database Error:', err);
});

// Require our scrapedData and comment models
var ScrapedData = require('./scrapedDataModel');

// Scrape data when app starts
var options = {
  url: 'http://www.yogajournal.com/category/lifestyle/',
 
};
// Make a request for the news section of yogajournal.com
request(options, function(error, response, html) {
  // Load the html body from request into cheerio
  var $ = cheerio.load(html);

    // Create mongoose model
    var scrapedData = new ScrapedData({
      title: title,
      synopsis: synopsis,
      articleURL: articleURL
    });
    // Save data
    scrapedData.save(function(err) {
      if (err) {
        console.log(err);
      }
      //console.log('Saved');
    });
  });

// Express 
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

// Main route send main page
app.get('/', function(req, res) {
  ScrapedData
    .findOne()
    .exec(function(err,data) {
      if (err) return console.error(err);
      // If successful render first data
      res.render('index', {
        title: data.title,
        synopsis: data.synopsis,
        articleURL: data.articleURL,
        comments: data.comments
      });
    })
});

// Add comment data to the db
app.post('/comment/', function(req, res) {
  // Update scraped data with comment
  ScrapedData.findByIdAndUpdate(
    req.params.id, {
      comments: {
        text: req.body.comment
      }
    },
    
    function(err, data) {
      if (err) return console.error(err);
      res.json(data.comments);
    }
  );
});



// Listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});

