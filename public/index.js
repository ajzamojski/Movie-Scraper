
//onclick event to send a request for a scrape with the metacritic site
$("#scrapeMovies").click(function () {

	$.get("/scrape", function(data){
		console.log("scrape complete");

	//INSERT RESULT MODAL HERE
		console.log(data);
		for (var i = 0; i < data.length; i++) {
			filmDiv = $("<div>");
			filmDiv.addClass("movieDiv col-md-5");
			filmDiv.attr("data-divid", i);
			imgMovie = $("<img>");
			imgMovie.addClass("movieImgPic");
			imgMovie.attr("src", data[i].link);
			movieTitle = $("<p id= 'imgTitle'>" + data[i].title + "</p>");
			movieDesc = $("<p id= 'movieDesc'>" + data[i].description + "</p>");
			movieScore = $("<p id= 'movieScore'>" + data[i].score + "</p>")
			movieButton = $("<br><button> Save Movie </button>");
			movieButton.attr("data-divid", i);
			movieButton.attr("data-titleVal", data[i].title);
			movieButton.attr("data-descVal", data[i].description);
			movieButton.attr("data-scoreVal", data[i].score);
			movieButton.attr("data-srcVal", data[i].link);
			movieButton.addClass("saveMovie btn btn-default btn-sm");

			filmDiv.append(movieTitle);
			filmDiv.append(movieDesc);
			filmDiv.append(movieScore);
			filmDiv.append(imgMovie);
			filmDiv.append(movieButton);
			$("#articleDiv").append(filmDiv);
		}
	});
});

//on click event to save a new movie in to the db
$(document).on("click", ".saveMovie", function() {

	var divtoremove = ($(this).attr("data-divid"));
	console.log(divtoremove);
	$("div[data-divid='" + divtoremove +"']").remove();

	var titleVal = ($(this).attr("data-titleVal"));
	var descVal = ($(this).attr("data-descVal"));
	var scoreVal = ($(this).attr("data-scoreVal"));
	var srcVal = ($(this).attr("data-srcVal"));

	console.log(titleVal);
	console.log(descVal);
	console.log(srcVal);

	$.post("/savemovie", { titleVal, descVal, scoreVal, srcVal }, function(response) {

		console.log(response);

	}); //ends post savemovie

}); //ends .saveMovie click event


