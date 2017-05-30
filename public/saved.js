//fetches all the saved movies in the db and displays them on the page
$.get("/savedarticles", function(data) {

	console.log(data);

	for (var i = 0; i < data.length; i++) {
			filmDiv = $("<div>");
			filmDiv.addClass("movieDiv col-md-5");
			imgMovie = $("<img>");
			imgMovie.addClass("movieImgPic");
			imgMovie.attr("src", data[i].link);
			movieTitle = $("<p id= 'imgTitle'>" + data[i].title + "</p>");
			movieDesc = $("<p id= 'movieDesc'>" + data[i].description + "</p>");
			movieScore = $("<p id= 'movieScore'>" + data[i].score + "</p>")
			movieButton = $("<br> <button> Article Notes </button>");
			movieButton.attr("data-id", data[i]._id);
			deleteButton = $("<button> Delete From Saved </button>");
			deleteButton.addClass("deleteButton btn btn-default btn-sm");
			deleteButton.attr("data-id", data[i]._id);
			movieButton.addClass("saveMovies btn btn-default btn-sm");
			filmDiv.append(movieTitle);
			filmDiv.append(movieDesc);
			filmDiv.append(movieScore);
			filmDiv.append(imgMovie);
			filmDiv.append(movieButton);
			filmDiv.append(deleteButton);
			$("#articleDiv").append(filmDiv);

		}

});

//click event to open a modal for the comments
$(document).on("click", ".saveMovies", function() {

	var movieId = ($(this).attr("data-id"));
	console.log(movieId);
	$("#newNote").attr("data-id", movieId);
	$("#openNotes").modal('toggle');
	populateComments(movieId);

});

//click event that handles a comment to be saved with the associated film
$(document).on("click", "#newNote", function() {

	var movieId = $(this).attr("data-id");
	var newNote = {	body: $("#bodyinput").val() }
	console.log(newNote);
	console.log(movieId);

	$.post("/savenote/" + movieId, newNote, function(data) {

		console.log(data);
		$("#bodyinput").val("");
		populateComments(data._id);
	});

});

//event for removing a comment
$(document).on("click", ".movieComments", function() {

	var commentId = ($(this).attr("data-noteid"));
	var articleId = ($(this).attr("data-articleId"));
	console.log(commentId);

	$.post("/commentremove/" + commentId, function(response) {

		console.log(response);
		populateComments(articleId);
	});

});

//event to remove a article/movie
$(document).on("click", ".deleteButton", function() {

	var articleId = ($(this).attr("data-id"));
	console.log(articleId);

	$.ajax({
		url: "/articleremove/" + articleId,
		method: "DELETE"
	}).done(function(response) {

		window.location.reload();
		console.log(response);
	});

});

//function that populates the comments section
function populateComments(data) {

	console.log(data);
	$.get("/comments/" + data, function(response) {

		$(".commentSection").empty();
		for (var i = 0; i < response[0].note.length; i++) {
			commentDiv = $("<div>");
			commentDiv.attr("data-id", response[0].note[i]._id);
			commentDiv.addClass("singleComment");
			commentBody = $("<span>" + response[0].note[i].body + " </span>");
			commentButton = $("<button>X</button>");
			commentButton.addClass("movieComments");
			commentButton.attr("data-noteId", response[0].note[i]._id);
			commentButton.attr("data-articleId", response[0]._id);
			commentDiv.append(commentBody);
			commentDiv.append(commentButton);
			$(".commentSection").append(commentDiv);

		}

	});

}

