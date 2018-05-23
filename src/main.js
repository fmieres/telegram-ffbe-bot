const 
  Repository = require('./repository'),
  UnitPrinter = require('./printers/unit'),
  ENV = require('../env'),
  TeleBot = require('telebot'),
  { log } = require('./lib/utils')
;

const TOKEN = ENV.TOKEN
const repo = new Repository()
const bot = new TeleBot( TOKEN )

// bot.on('tick', event => log(event, 'tick')) // esto quizás sirva para scheduled messages
// 
bot.on(/^\/help.*$/i, message => {
  return replier(message)('I am a ffbe info bot, available commands: unit');
})

bot.on(/^\/unit\s+(\+)?(.+)$/i, (message, props) => {
  const mode = props.match[1] === '+' ? true : false
  const identifier = props.match[2]
  const getter = identifier => 
    repo.check_if_nickname(identifier).then( ({value}) => repo.find_unit_by_name(value) )
  
  return process_unit(getter, UnitPrinter, replier(message), mode, identifier)

})


bot.on('callbackQuery', msg => {

    let query = msg.query;
    log(msg)


});

function process_unit(getter, printer, replier, mode, identifier){

  const markup = buttons => !!buttons 
    ? bot.inlineKeyboard( [ ...buttons.map( ({title, content}) => [ bot.inlineButton(title, content)] ) ] )
    : undefined

  return getter(identifier)
    .then( ({ value, suggestions }) => {
      if (!!value){
        var { message, replyMarkup } = printer.found(value, mode, markup)
      } else if (suggestions.length > 0) {
        var { message, replyMarkup } = printer.suggestions(identifier, suggestions, markup)
      } else {
        var { message, replyMarkup } = printer.not_found(identifier, markup)
      }
      return replier(message, { replyMarkup })
    })
}

function replier(message) {
  return (text, extra_options = {}) => 
    bot.sendMessage(message.chat.id, text, { parseMode : 'HTML', ...extra_options })
} 


bot.start()