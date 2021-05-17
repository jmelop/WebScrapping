const axios = require('axios');
const cheerio = require('cheerio');
const discord = require('discord.js');
require('dotenv').config();
const url = "https://www.coingecko.com/es";
const botDiscord = new discord.Client();
const tokenDiscord = process.env.TOKEN;

// Initialize coins array
var coins = [];
// Set buy and sell margin in %
var buyMargin = -0.05;
var sellMargin = 0.05;
// Coins to analyze
var numCoins = 5;


// Get coins information
function getCoins() {
    return axios.get(url)
    .then(response => response.data)
    .then(body => {
        // Initialize names, prices and change arrays
        const namesArray = [];
        const pricesArray = [];
        const changeArray = [];
        const marketcapArray = [];

        // Get html body
        var $ = cheerio.load(body);

        // Find html elements
        const names = $('td.coin-name div div.center a.tw-hidden');
        const prices = $('td.td-price span');
        const change7D = $('td.td-change7d span');
        const marketcap = $('td.td-market_cap span')

        // For each element push name in array
        for(i = 0; i < numCoins; i++) {
            let text = $(names[i]).text();
            //console.log(text);
            namesArray.push(text.replace(/\n/g,''));
        }

        // For each element push price in array
        for(i = 0; i < numCoins; i++) {
            let text = $(prices[i]).text();
            //console.log(text);
            pricesArray.push(text.replace(/\n/g,''));
        }

        // For each element push change7D in array
        for(i = 0; i < numCoins; i++) {
            let text = $(change7D[i]).text();
            //console.log(text);
            changeArray.push(text.replace(/\n/g,''));
        }

        // For each element push marketcap in array
        for(i = 0; i < numCoins; i++) {
            let text = $(marketcap[i]).text();
            //console.log(text);
            marketcapArray.push(text.replace(/\n/g,''));
        }

        // Merge names, prices and changes arrays in a coins array as objects
        for(i = 0; i < namesArray.length; i++) {
            // If %7D >= sell margin, we recommend Sell
            if((parseFloat(changeArray[i])/100) >= sellMargin) {
                coins.push({name: namesArray[i], price: pricesArray[i], change7D: changeArray[i], marketcap: marketcapArray[i], prediction: "Sell"});
            }
            // If %7D <= buy margin, we recommend Buy
            else if((parseFloat(changeArray[i])/100) <= buyMargin) {
                coins.push({name: namesArray[i], price: pricesArray[i], change7D: changeArray[i], marketcap: marketcapArray[i], prediction: "Buy"});
            }
            // If %7D not <= buy margin and >= sell margin, we recommend Wait
            else {
                coins.push({name: namesArray[i], price: pricesArray[i], change7D: changeArray[i], marketcap: marketcapArray[i], prediction: "Wait"});
            }
        }

        //console.log(coins);
        return coins;
    });
}

// Show coins information on console
function showCoinsInfo(){
    Promise.resolve(getCoins()).then(response => {
        response.forEach(coin => {
            console.log("Name: " + coin.name);
            console.log("Price: " + coin.price);
            console.log("7D % change: " + coin.change7D);
            console.log("Marketcap: " + coin.marketcap);
            console.log("Prediction: " + coin.prediction);
            console.log("\n");
        });
    });
}

// Discord connection
// To create Disord App, create bot and set permissions, go to https://discord.com/developers/applications/
// To allow this bot on your server go to https://discord.com/api/oauth2/authorize?client_id=843626321196220456&permissions=2048&scope=bot
function sendToDiscord() {
    botDiscord.login(tokenDiscord);

    botDiscord.on("ready", function() {
        console.log("Discord Bot Ready!");
        // ID of text channel of my Discord server
        const channelGeneral = botDiscord.channels.cache.find(channel => channel.id == "843625924662788142");

        channelGeneral.send(
            "########################" + "\n" +
            "# Reporte de coingecko a demanda #" + "\n" +
            "########################"
        );
        Promise.resolve(getCoins()).then(response => {
            response.forEach(coin => {
                channelGeneral.send(
                    "Name: " + coin.name + "\n" +
                    "Price: " + coin.price + "\n" +
                    "7D % change: " + coin.change7D + "\n" +
                    "Marketcap: " + coin.marketcap + "\n" +
                    "Prediction: " + coin.prediction + "\n" +
                    "------------------------------------------"
                );
            });
            channelGeneral.send(
                "########################" + "\n" +
                "# Fin del reporte #" + "\n" +
                "########################"
            );
        });
    });
    /*
    botDiscord.channels.cache.get("843625924662788142").send("Prueba");

    botDiscord.on("message", function(message) {
        if(message.content === "!test") {
            const channelGeneral = botDiscord.channels.cache.find(channel => channel.id == "843625924662788142");
            channelGeneral.send("Prueba");
        }
    });
    */
}

sendToDiscord();