const 
  Repository = require('./repository'),
  UnitPrinter = require('./printers/unit'),
  ENV = require('../env'),
  { log } = require('./lib/utils')
;

const TOKEN = ENV.TOKEN
const repo = new Repository()

const TeleBot = require('telebot');

const bot = new TeleBot( TOKEN )

bot.on('tick', event => log(event, 'tick'))

bot.on('/help', message => {
  const help_message = 'I am a ffbe info bot, available commands: unit_names, unit'
  return bot.sendMessage( message.from.id, help_message );
})

const replier = message => (text, extra_options = {}) => 
  bot.sendMessage(message.chat.id, text, { parseMode : 'HTML', ...extra_options })

bot.on(/^\/unit\s+(f_sum|f_full)?(.+)$/i, (message, props) => {
  log('im here')
  log(message)
  const mode = props.match[1] || 'f_full'
  const identifier = props.match[2]
  const getter = name => repo.find_unit_by_name(name)
  return print(getter, UnitPrinter, replier(message), mode, identifier)
})

function print(getter, printer, replier, mode, identifier){
  return getter(identifier)
    .then( ({ value, suggestions }) => {
      log(value)
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

bot.start()