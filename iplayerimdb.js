
function appendRating(filmElements) {
    filmElements.each(function (index, filmElement) {
        var jqueryFilmElem = $(filmElement)
        var title = $(filmElement).find('a').attr('title')
        console.log("Loading film data for " + title)
        $.getJSON('http://imdbapi.org/', {'q':title}).done(function (data) {
            var imdburl = data[0].imdb_url
            var rating = data[0].rating
            console.log(title + ", " + rating + " " + imdburl)
            var imageurl = chrome.extension.getURL('imdb-small.png')
            $(filmElements).css('display', 'inline')
            var html = ['<a style="display:inline" href="',imdburl,'"><img src="',imageurl,'"></a> ',
                        '<a style="display:inline" href="',imdburl,'"><span style="display:inline" class="title">',rating,'</span></a>'].join('')
            jqueryFilmElem.append(html);
        });
    });
}

function rateFilms() {
    //Film elements with a FILM flag next to them
    var flaggedFilmElements = $('.flag:contains("Film")').parent()
    appendRating(flaggedFilmElements)
    //Films displayed in all categories view
    var allCategoriesFilmElements = $('a.episode-category:contains(Films)').parent().find('h3')
    appendRating(allCategoriesFilmElements)
};

rateFilms();

$( "div.category-list-body" ).bind(
    "DOMNodeRemoved",
    function( objEvent ){
        console.log("Node removed: ", objEvent.target)
    }
);

$( "div.category-list-body" ).bind(
    "DOMNodeInserted",
    function( objEvent ){
        console.log("Node inserted: ", objEvent.target)
    }
);