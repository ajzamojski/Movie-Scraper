// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

// Make public a static dir
app.use(express.static(process.cwd() + "/public"));

// Database configuration with mongoose
var databaseUri = "mongodb://localhost/metascrape";

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
	mongoose.connect(databaseUri);
}

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

require("./routing/html-routes.js")(app);
// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.imdb.com/movies-in-theaters/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=2750721702&pf_rd_r=0ZKJFK35E6X4BEV54TBV&pf_rd_s=right-2&pf_rd_t=15061&pf_rd_i=homepage&ref_=hm_otw_hd", function(error, response, html) {

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
   	console.log("hellllo");
   // Save an empty result object
    var result = [];
    // Now, we grab every h2 within an article tag, and do the following:

    // console.log($('div.product').children('.img_wrapper').children('a').children('img').attr("src"));
    var lItem = 0;

    $(".list").each(function(i, element) {


    	console.log($(element).find("h3").text());
 		if (lItem == 1) {
 			  	// console.log(element);

 			  $(".list_item").each(function(i2, element2){

 			  	 	var imgLink = $(element2).find('img.poster.shadowed').attr('src');
				    var title = $(element2).find('h4').text();
				    var description = $(element2).find(".overview-top").find(".outline").text();
				    if ($(element2).find(".rating_txt").find(".metascore").text() == "") {
				    	var metaScore = "No score yet"
				    }
				    else {
				    var metaScore = $(element2).find(".rating_txt").find(".metascore").text();
				  	}

					result.push({ link: imgLink, title: title, description: description, score: metaScore });

    	});

 		}
 		else {
 			console.log("no results found");
 			lItem += 1;
 		}
    // console.log(result);

    });
      res.json(result);
  });
  // Tell the browser that we finished scraping the text
});

//route to get all the articles
app.get("/savedarticles", function(req, res) {

	Article.find({}, function(error, doc) {

		if (error) {
			console.log(error);
		}
		else {
			res.json(doc);
		}
	});
});

//route to get all the movies with their associated notes
app.get("/comments/:id", function(req, res) {

	console.log("this is the comments route");
	console.log(req.params.id);

	Article.find({"_id": req.params.id}).populate("note").exec(function(error, doc) {

		if (error) {
			console.log(error);
		}
		else {
			res.json(doc);
		}

	});
});

//save a new movie in the db
app.post("/savemovie", function(req, res){

	var newMovie = { 
		title: req.body.titleVal,
		description: req.body.descVal,
		score: req.body.scoreVal,
		link: req.body.srcVal };

	var entry = new Article(newMovie);

	// save that entry to the db
  entry.save(function(err, doc) {
    // Log any errors
    if (err) {
      console.log(err);
    }
    // Or log the doc
    else {
      console.log(doc);
      res.send(doc);
    }
  });

});

//route to save a note that is linked with an article
app.post("/savenote/:id", function(req, res){

	console.log("we are a the server side savenote");
	var newNote = new Note(req.body);
	console.log(newNote);
	console.log(req.body);
	console.log(req.params.id);
	newNote.save(function(error, doc) {

		if (error) {
			console.log(error);
		}

		else {
			// console.log("past the save point");
			// console.log(doc);
			Article.findOneAndUpdate({"_id": req.params.id}, {$push: {"note": doc._id}}, {new: true})

			.exec(function(err, data) {

				if (err) {
					console.log(err);
				}
				else {
					res.send(data);
				}
			});
		}
	});
});

//route to remove a comment
app.post("/commentremove/:id", function(req, res) {

	console.log(req.params.id);

	Note.remove({"_id": req.params.id}, function(err, doc) {

		if (err) {
			console.log(err);
		}
		else {
			res.json(doc);
		}

	});

});

//route to remove an article
app.delete("/articleremove/:id", function(req, res) {

	console.log(req.params.id);

	Article.remove({"_id": req.params.id}, function(err, doc) {

		if (err) {
			console.log(err);
		}
		else {
			res.json(doc);
		}

	});

});

// Listen on port 3000
app.listen(3005, function() {
  console.log("App running on port 3005!");
});