const url = "https://coinmarketcap.com/";
const urlCoin = "https://www.coingecko.com/es";
const urlNews = 'https://es.cointelegraph.com/category/market-analysis';
const urlSlack = "https://hooks.slack.com/services/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"

const puppeteer = require('puppeteer');
var nodemailer = require('nodemailer');
const axios = require('axios');
const cheerio = require('cheerio');


require('dotenv').config();


// News
const news = [];

function start() {

    var info = process.argv[2];

    if (info == 'Coingecko') {
        return axios.get(urlCoin)
            .then(response => response.data)
            .then(body => {
                // Initialize names, prices and change arrays
                const namesArray = [];
                const pricesArray = [];
                const changeArray = [];
                const marketcapArray = [];

                // Initialize coins array
                var coins = [];
                // Set buy and sell margin in %
                var buyMargin = -0.05;
                var sellMargin = 0.05;
                // Coins to analyze
                var numCoins = 5;

                // Get html body
                var $ = cheerio.load(body);

                // Find html elements
                const names = $('td.coin-name div div.center a.tw-hidden');
                const prices = $('td.td-price span');
                const change7D = $('td.td-change7d span');
                const marketcap = $('td.td-market_cap span')

                // For each element push name in array
                for (i = 0; i < numCoins; i++) {
                    let text = $(names[i]).text();
                    //console.log(text);
                    namesArray.push(text.replace(/\n/g, ''));
                }

                // For each element push price in array
                for (i = 0; i < numCoins; i++) {
                    let text = $(prices[i]).text();
                    //console.log(text);
                    pricesArray.push(text.replace(/\n/g, ''));
                }

                // For each element push change7D in array
                for (i = 0; i < numCoins; i++) {
                    let text = $(change7D[i]).text();
                    //console.log(text);
                    changeArray.push(text.replace(/\n/g, ''));
                }

                // For each element push marketcap in array
                for (i = 0; i < numCoins; i++) {
                    let text = $(marketcap[i]).text();
                    //console.log(text);
                    marketcapArray.push(text.replace(/\n/g, ''));
                }

                // Merge names, prices and changes arrays in a coins array as objects
                for (i = 0; i < namesArray.length; i++) {
                    // If %7D >= sell margin, we recommend Sell
                    if ((parseFloat(changeArray[i]) / 100) >= sellMargin) {
                        coins.push({ name: namesArray[i], price: pricesArray[i], change7D: changeArray[i], marketcap: marketcapArray[i], prediction: "Sell" });
                    }
                    // If %7D <= buy margin, we recommend Buy
                    else if ((parseFloat(changeArray[i]) / 100) <= buyMargin) {
                        coins.push({ name: namesArray[i], price: pricesArray[i], change7D: changeArray[i], marketcap: marketcapArray[i], prediction: "Buy" });
                    }
                    // If %7D not <= buy margin and >= sell margin, we recommend Wait
                    else {
                        coins.push({ name: namesArray[i], price: pricesArray[i], change7D: changeArray[i], marketcap: marketcapArray[i], prediction: "Wait" });
                    }
                }

                getInfoCoins();

                for (i = 0; i <= 4; i++) {
                    slackAlert(JSON.stringify(coins[i]));
                }

                console.log(coins);
                return coins;
            });

    } else if (info == 'Coinmarketcap') {


        (async () => {

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);

            //var $ = cheerio.load(response.data);

            const cryptoName = [];
            const prices = [];
            const weekPriceChange = [];
            const marketCap = [];

            const cryptos = [];


            await scrollDown(page);


            // Obtener nombres

            this.cryptoName = await page.evaluate(() => {
                const data = Array.from(document.querySelectorAll('.cmc-table tr td .sc-1eb5slv-0.iJjGCS'))
                return data.map(td => td.innerText)
            });

            // Obtener precios

            this.prices = await page.evaluate(() => {
                const data = Array.from(document.querySelectorAll('.cmc-table tr td .price___3rj7O '))
                return data.map(td => td.innerText)
            });

            // Obtener porcentajes semanales

            this.weekPriceChange = await page.evaluate(() => {
                const data = Array.from(document.querySelectorAll('.cmc-table tr td .sc-1v2ivon-0.jvNdfB'))
                return data.map(td => td.innerText)
            })

            // Obtener Cap. Mercado

            this.marketCap = await page.evaluate(() => {
                const data = Array.from(document.querySelectorAll('.cmc-table tr td .sc-1eb5slv-0.kDEzev'))
                return data.map(td => td.innerText)
            })

            // Push all data

            for (i = 0; i <= this.cryptoName.length - 1; i++) {
                cryptos.push({ name: this.cryptoName[i], price: this.prices[i], priceChanged: this.weekPriceChange[i], marketCap: this.marketCap[i] });
            }

            // Send Slack notification

            for (i = 0; i <= 4; i++) {
                await slackAlert(JSON.stringify(cryptos[i]));
            }

            //Send Email

            //await sendEmail(cryptos[0]);

            console.log(cryptos);

            getInfoCoins();


            await browser.close();

        })();


    } 

}

function getInfoCoins() {

    return axios.get(urlNews).then(rest => rest.data)
        .then(infoCoins => {

            console.log('Cargando noticias...');

            setTimeout(() => {

                console.log(news);

                console.log('Acceso a las noticias: ' + urlNews);

            }, 2000);


            const $ = cheerio.load(infoCoins);

            // --- General var
            var newsTitle = [];
            var newsDate = [];
            var newsAuthor = [];
            // var newsText = [];
            var newsViews = [];

            // --- Get info section
            var title = $('li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__header a span').text().split('  ');
            var date = $('li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__meta time[datetime]').text().split('  ');
            var author = $('li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__meta p.post-card-inline__author a').text().split('  ');
            // var text = $( 'li.posts-listing__item article.post-card-inline div.post-card-inline__content p.post-card-inline__text').text().split();
            var views = $('li.posts-listing__item article.post-card-inline div.post-card-inline__content div.post-card-inline__stats span span:last-of-type').text().split('  ');


            for (let indice = 0; indice < 11; indice++) {

                newsTitle.push(title[indice]);
                newsDate.push(date[indice]);
                newsAuthor.push(author[indice]);
                // newsText.push( text[indice] );
                newsViews.push(views[indice]);

                news.push({ Tittle: title[indice], Date: date[indice], Author: author[indice], Views: views[indice] });

            }


        });


}




async function scrollDown(page) {


    const distance = 100;
    var totalHeight = 0;
    const delay = 100;



    while (totalHeight <= await page.evaluate(() => document.scrollingElement.scrollTop)) {

        await page.evaluate((delay) => { document.scrollingElement.scrollBy(0, delay); }, distance);
        totalHeight += distance;
        await page.waitForTimeout(delay);
    }

}


async function slackAlert(data) {

    try {
        await axios.post(
            urlSlack,
            {
                text: data
            }
        )
    } catch (error) {
        console.log(error.response)
    }
}

start();