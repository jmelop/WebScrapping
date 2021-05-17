const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://es.cointelegraph.com/category/market-analysis';

const news = [];

// Function to get the last 15 news
async function getInfoCoins(){

    return axios.get( url ).then( rest => rest.data )
                .then( infoCoins => {
            
                    const $ = cheerio.load(infoCoins);
                    
                    // --- General var
                    var newsTitle = [];
                    var newsDate = [];
                    var newsAuthor = [];
                    // var newsText = [];
                    var newsViews = [];

                    // --- Get info section
                    var title = $( 'li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__header a span' ).text().split( '  ' );
                    var date = $( 'li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__meta time[datetime]' ).text().split( '  ' );
                    var author = $( 'li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__meta p.post-card-inline__author a' ).text().split( '  ' );
                    // var text = $( 'li.posts-listing__item article.post-card-inline div.post-card-inline__content p.post-card-inline__text').text().split();
                    var views = $( 'li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__stats span span:last-of-type' ).text().split( '  ' );


                    for( let indice = 0 ; indice < 11 ; indice ++ ){

                        newsTitle.push( title[indice] );
                        newsDate.push( date[indice] );
                        newsAuthor.push( author[indice] );
                        // newsText.push( text[indice] );
                        newsViews.push( views[indice] );

                        news.push({ Tittle : title[indice], Date : date[indice], Author : author[indice], Views : views[indice]});

                    }
                    

                });


}

console.log( 'Cargando noticias...' );

setTimeout( () => {

    console.log(news);

    console.log( 'Acceso a las noticias: ' + url );

}, 2000 );



getInfoCoins();