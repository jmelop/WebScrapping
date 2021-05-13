const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.coingecko.com/es";

// Functions
function getCoin(){

    return axios.get(url)
    .then( rest => {

        const $ = cheerio.load( rest.data );

        const names = $('td.coin-name div div.center a:first-of-type');
        

    });


}

console.log('hola');

getCoin();