const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://coinmarketcap.com/";

axios.get(url).then(response => {

        var $ = cheerio.load(response.data);

        const cryptoName = [];
        const prices = [];
        const weekPriceChange = [];
        const marketCap = [];

        const cryptos = [];


        // Obtener nombres
        $('.cmc-table tr td .sc-1eb5slv-0.iJjGCS').each(function () {
            cryptoName.push($(this).html());
        })

        // Obtener precios
        $('.cmc-table tr td .price___3rj7O ').each(function () {
            prices.push($(this).text());
        })


        // Obtener precios
        $('.cmc-table tr td .sc-1v2ivon-0.fJLBDK').each(function () {
            weekPriceChange.push($(this).text());
        })


        // Obtener Cap. Mercado
        $('.cmc-table tr td .sc-1eb5slv-0.kDEzev').each(function () {
            marketCap.push($(this).text());
        })


        for (i = 0; i <= cryptoName.length; i++) {
            cryptos.push({ name: cryptoName[i], price: prices[i], priceChanged: weekPriceChange[i], marketCap: marketCap[i] });
        }

        console.log(cryptos);

    });