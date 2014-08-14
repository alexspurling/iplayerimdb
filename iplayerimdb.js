var ratingCache = {}

function getRatingFromCache(title) {
    return ratingCache[title];
}

function cacheRating(title, rating, imdburl) {
    ratingCache[title] = {'rating': rating, 'imdburl': imdburl};
}

function appendRating(rating, imdburl, filmElement, marginTop) {
    var imageurl = chrome.extension.getURL('imdb-small.png')
    var html = ['<a class="change-loc-link" style="color:#fff" display:inline" target="_blank" href="',imdburl,'">',
                '<img style="visibility:visible; width:31px; margin-top:',marginTop,'; margin-right:5px; margin-bottom:0px" src="',imageurl,'">',
                '<span class="title" style="display:inline; font-size:12px">',rating,'</span><span class="title" style="display:inline; font-size:11px">/10</span></a>'].join('')
    $(filmElement).append(html);
}

function getAndAppendRating(filmElement, title, marginTop) {
    var cachedRating = getRatingFromCache(title)
    if (cachedRating) {
        appendRating(cachedRating.rating, cachedRating.imdburl, filmElement, marginTop);
    }else{
        $.getJSON('http://www.omdbapi.com/', {'t':title}).done(function (data) {
            var ratingNum = new Number(data.imdbRating)
            var rating = ratingNum.toPrecision(2)
            var imdburl = 'http://www.imdb.com/title/' + data.imdbID + '/'
            cacheRating(title, rating, imdburl)
            appendRating(rating, imdburl, filmElement, marginTop)
        });
    }
}

function getAndAppendRatingForElements(filmElements, marginTop) {
    filmElements.each(function (index, filmElement) {
        var title = filmElement.innerText
        console.log("Loading film data for " + title)
        getAndAppendRating(filmElement, title, marginTop)
    });
}

function rateFilms() {
    //Films in the A-Z view
    var filmTitleElements = $('div.title').not('.top-title')
    console.log("Film elements: ", filmTitleElements)
    getAndAppendRatingForElements(filmTitleElements, '0px')

    //Films in the featured view
    var featuredFilmElements = $('div.iplayer-stream').find('span.title')
    console.log("Featured film elements: ", featuredFilmElements)
    getAndAppendRatingForElements(featuredFilmElements, '0px')
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