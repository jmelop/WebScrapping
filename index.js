const axios = require('axios');
const cheerio = require('cheerio');

const url = "https://www.coingecko.com/es";

// Functions
function getCoin(){

    return axios.get(url)
    .then( rest => rest.data )
    .then( body => {

        // Create an Api from data of Web
        var $ = cheerio.load(body);

    } );


}