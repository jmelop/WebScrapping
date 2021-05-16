//const cheerio = require('cheerio');
const Axios = require("axios");
const puppeteer = require('puppeteer');
const url = "https://coinmarketcap.com/";
const urlSlack = ""
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'example1@gmail.com',
        pass: '1234'
    }
});


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


    await page.screenshot({
        path: 'yoursite.png',
        fullPage: true
    });



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

    await sendEmail(cryptos[0]);



    await browser.close();

})();

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
        await Axios.post(
            urlSlack,
            {
                text: data
            }
        )
    } catch (error) {
        console.log(error.response)
    }
}

async function sendEmail(data) {

    var mailOptions = {
        from: 'example@gmail.com',
        to: 'example2@gmail.com',
        subject: 'Alerta Cryptomonedas',
        text: JSON.stringify(data)
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

