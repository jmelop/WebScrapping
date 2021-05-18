const Promise = require('bluebird');
Promise.config({
  cancellation: true
});


// Importamos la librería node-telegram-bot-api 
const TelegramBot = require('node-telegram-bot-api');
const { get } = require('cheerio/lib/api/traversing');
const token = 'XXXXXX -- XXXXXX';
//const Agent = require('socks5-https-client/lib/Agent');
const bot = new TelegramBot(token, {polling:true});


bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "¡Bienvenid@!");
});


bot.onText(/^\hola/, (msg) => {
    bot.sendMessage(msg.chat.id, "Hola  " + msg.from.first_name);
});

bot.onText(/^\help/, (msg) => {
    bot.sendMessage(msg.chat.id, "Los comandos que puedes usar son:\n start \n  hola \n help \n monedas");
});


// Información de las monedas
    //Para poner botones y el extra de parse HTML
bot.onText(/^\monedas/, (msg) => {
    bot.sendMessage(msg.chat.id,'<i>¿De que <b>moneda</b> quieres saber la información?</i>',
        {reply_markup:{
                inline_keyboard:[
                   //fila 1
                 [{text:"Bitcoin", callback_data: 'Bitcoin'},
                 {text:"Ethereum", callback_data: 'Ethereum'},],
                    //fila 2
                 [{text:"Binance Coin",callback_data: 'Binance Coin'},
                 {text:"Cardano", callback_data: 'Cardano'},],
                    //fila 3
                 [{text:"XRP", callback_data: 'XRP'},
                 {text:"Dogecoin", callback_data: 'Dogecoin'},],
                 //fila 4
                 [{text:"Tether", callback_data: 'Tether'},
                 {text:"Polkadot", callback_data: 'Polkadot'},],
                    //fila 5
                 [{text:"Bitcoin Cash", callback_data: 'Bitcoin Cash'},
                 {text:"Litecoin", callback_data: 'Litecoin'}]
                ]
            },
            parse_mode:"HTML",
        })

    bot.on('callback_query', function onCallbackQuery(accionboton){
        const data = accionboton.data;
        getCoins().then(res =>{
        
        for ( i = 0; i < coins.length; ++i){
            if(data == coins[i].name){
                bot.sendMessage(msg.chat.id, "Esta es la información de "+coins[i].name + "\n"+"precio: "+coins[i].price +"\n"+"7D % change: "+coins[i].change7D + "\n"+ "Prediction: "+coins[i].prediction);
            }
        }
        console.log(coins.length)
       });
    
    });
});

