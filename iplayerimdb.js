var ratingCache = {}

function getRatingFromCache(title) {
    return ratingCache[title];
}

function cacheRating(title, rating, imdburl) {
    ratingCache[title] = {'rating': rating, 'imdburl': imdburl};
}

function appendRating(rating, imdburl, filmElement, marginTop) {
    var imageurl = chrome.extension.getURL('imdb-small.png')
    var html = ['<a style="display:inline" target="_blank" href="',imdburl,'"><img style="margin-top:',marginTop,'; margin-right:5px; margin-bottom:0px" src="',imageurl,'">',
                '<span class="title" style="display:inline; font-size:12px">',rating,'</span><span class="title" style="display:inline; font-size:11px">/10</span></a>'].join('')
    $(filmElement).append(html);
}

function getAndAppendRating(filmElement, title, marginTop) {
    var cachedRating = getRatingFromCache(title)
    if (cachedRating) {
        appendRating(cachedRating.rating, cachedRating.imdburl, filmElement, marginTop);
    }else{
        $.getJSON('http://imdbapi.org/', {'q':title}).done(function (data) {
            var ratingNum = new Number(data[0].rating)
            var rating = ratingNum.toPrecision(2)
            var imdburl = data[0].imdb_url
            cacheRating(title, rating, imdburl)
            appendRating(rating, imdburl, filmElement, marginTop)
        });
    }
}

function getAndAppendRatingForElements(filmElements, marginTop) {
    filmElements.each(function (index, filmElement) {
        var title = $(filmElement).find('a').attr('title')
        console.log("Loading film data for " + title)
        getAndAppendRating(filmElement, title, marginTop)
    });
}

function getAndAppendRatingForPopularFilms(filmElements, marginTop) {
    filmElements.each(function (index, filmElement) {
        var iplayerLink = $(filmElement).find('a').attr('href')
        //Get the title from the link to the page for this Film as there is no
        //title attribute set on these links for some reason
        var title = iplayerLink.replace(/.*\/([^\/]*)\/$/,'$1').replace(/_/g,' ')
        console.log("Loading film data for popular film: " + title)
        getAndAppendRating(filmElement, title, marginTop)
    });
}

function rateFilms() {
    //Film elements with a FILM flag next to them
    var flaggedFilmElements = $('.flag:contains("Film")').parent()
    getAndAppendRatingForElements(flaggedFilmElements, '0px')
    //Films displayed in all categories view
    var allCategoriesFilmElements = $('a.episode-category:contains(Films)').parent().find('h3')
    getAndAppendRatingForElements(allCategoriesFilmElements, '0px')

    var mostPopularInFilmsElements = $('h2:contains("Most popular in Films")').parent().find('h3')
    getAndAppendRatingForPopularFilms(mostPopularInFilmsElements, '0px')
};

function rateFilmCategory(categoryBody) {
    var categoryFilmElements = categoryBody.find('h3')
    getAndAppendRatingForElements(categoryFilmElements, '0px')
};

$("div.category-list-body").bind(
    "DOMNodeInserted",
    function(objEvent){
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
                var filmElement = $(objEvent.target).find('h1')
                filmElement.find('a').css('display', 'block')
                getAndAppendRatingForElements(filmElement, '4px');
            }
        }
    }
);

rateFilms();