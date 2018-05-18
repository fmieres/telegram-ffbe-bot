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
  return replier(message)('I am a ffbe info bot, available commands: unit_names, unit');
})

bot.on(/^\/unit\s+(\+)?(.+)$/i, (message, props) => {
  const mode = props.match[1] === '+' ? true : false
  const identifier = props.match[2]
  const getter = name => repo.find_unit_by_name(name)
  return print(getter, UnitPrinter, replier(message), mode, identifier)
})

// se propagan multiples matches; un mensaje conocido es uno desconocido también
// bot.on(/\/.*/, message => {
//   return replier(message)('Unrecognized command, try /help');
// })

function print(getter, printer, replier, mode, identifier){
  return getter(identifier)
    .then( ({ value, suggestions }) => {
      // log(value)
      let message = ''
      if (!!value){
        message = printer.found(value, mode)
      } else if (suggestions.length > 0) {
        message = printer.suggestions(identifier, suggestions)
      } else {
        message = printer.not_found(identifier)
      }
      return replier(message)
    })
}

function replier(message) {
  return (text, extra_options = {}) => 
    bot.sendMessage(message.chat.id, text, { parseMode : 'HTML', ...extra_options })
} 


bot.start()