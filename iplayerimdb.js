var ratingCache = {}

function getRatingFromCache(title) {
    return ratingCache[title];
}

function cacheRating(title, rating, imdburl) {
    ratingCache[title] = {'rating': rating, 'imdburl': imdburl};
}

function appendRating(rating, imdburl, filmElement) {
    $(filmElement).find('a').css('display', 'block')
    var imageurl = chrome.extension.getURL('imdb-small.png')
    var html = ['<a style="display:inline" href="',imdburl,'"><img src="',imageurl,'"></a> ',
                '<a style="display:inline" href="',imdburl,'"><span style="display:inline" class="title">',rating,'</span></a>'].join('')
    $(filmElement).append(html);
}

function getAndAppendRating(filmElements) {
    filmElements.each(function (index, filmElement) {
        var title = $(filmElement).find('a').attr('title')
        console.log("Loading film data for " + title)

        var cachedRating = getRatingFromCache(title)
        if (cachedRating) {
            appendRating(cachedRating.rating, cachedRating.imdburl, filmElement);
        }else{
            $.getJSON('http://imdbapi.org/', {'q':title}).done(function (data) {
                var ratingNum = new Number(data[0].rating)
                var rating = ratingNum.toPrecision(2)
                var imdburl = data[0].imdb_url
                cacheRating(title, rating, imdburl)
                appendRating(rating, imdburl, filmElement)
            });
        }
    });
}

function rateFilms() {
    //Film elements with a FILM flag next to them
    var flaggedFilmElements = $('.flag:contains("Film")').parent()
    getAndAppendRating(flaggedFilmElements)
    //Films displayed in all categories view
    var allCategoriesFilmElements = $('a.episode-category:contains(Films)').parent().find('h3')
    getAndAppendRating(allCategoriesFilmElements)
};

function rateFilmCategory(categoryBody) {
    var categoryFilmElements = categoryBody.find('h3')
    getAndAppendRating(categoryFilmElements)
};

function getEpisodeData() {
    console.log("iPlayer IMDB: Getting episode registry")
    var scripts = $('script:contains("episodeRegistry")')
    if (scripts) {
        var script = scripts[0].innerHTML
        var addDataCall = script.match(/episodeRegistry.addData\([\s\S]*?\);/)
        if (addDataCall) {
            var episodeData = addDataCall[0].match(/({[\s\S]*})/)
            if (episodeData && episodeData.length == 2) {
                try {
                    var episodeJson = $.parseJSON(episodeData[1])
                    console.log("iPlayer IMDB: Loaded episode registry")
                    return episodeJson
                }catch (err) {
                    console.log("iPlayer IMDB: Error parsing episode registry: " + err)
                }
            }
        }
    }
    console.log("iPlayer IMDB: Could not find episode registry")
    return null;
}

function isFilm(episode) {
    if (episode.categories) {
        var filmCategories = episode.categories.filter(function (category) {
            return category.title == 'Films'
        });
        return filmCategories.length > 0;
    }
    return false;
}

function getFilmsFromEpisodeData(episodeData) {
    var filmTitles = []
    episodeData.
    $.each(episodeData, function (episodeKey, episode) {
        if (isFilm(episode)) {
            filmTitles.push(episode.complete_title)
        }
    });
    console.log("Found films: ", filmTitles)
    return filmTitles;
}

function loadFilmRegistry() {
    var episodeData = getEpisodeData();
    if (episodeData) {
        var films = getFilmsFromEpisodeData(episodeData);
    }
}

$("div.category-list-body").bind(
    "DOMNodeInserted",
    function(objEvent){
        console.log("Node inserted: ", objEvent.target)
        var filmLink = $(objEvent.target).find('.show-all[href$="films"]')
        if (filmLink.length > 0) {
            rateFilmCategory(filmLink.parent())
        }
    }
);

$('body').on(
    'DOMNodeInserted',
    'div.cta-overlay',
    function(objEvent) {
        var title = $(objEvent.target).find('a[title]').attr('title')
        if (title) {
            if (getRatingFromCache(title)) {
                console.log("Yeah this title is cached: " + title)
                getAndAppendRating($(objEvent.target).find('h1'));
            }
        }
    }
);

rateFilms();

loadFilmRegistry()
