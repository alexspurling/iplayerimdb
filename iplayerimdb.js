

function rateFilms() {
    console.log("Looking for films");
    var filmIdentifiers = $('.flag:contains("Film")')
    var filmElements = filmIdentifiers.parent()
    console.dir(filmElements)
    filmElements.each(function (index, filmElement) {
        var jqueryFilmElem = $(filmElement)
        var title = $(filmElement).find('a').attr('title')
        console.log("Loading film data for " + title)
        $.getJSON('http://imdbapi.org/', {'q':title}).done(function (data) {
            var imdburl = data[0].imdb_url
            var rating = data[0].rating
            console.log(title + ", " + rating + " " + imdburl)
            var imageurl = chrome.extension.getURL('imdb-small.png')
            var html = ['<a href="',imdburl,'"><img src="',imageurl,'"></a> ',
                        '<a href="',imdburl,'"><span class="title">',rating,'</span></a>'].join('')
            jqueryFilmElem.append(html);
        });
    });
};

rateFilms();
