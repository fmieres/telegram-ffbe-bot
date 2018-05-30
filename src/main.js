const 
  Repository = require('./repository'),
  UnitPrinter = require('./printers/unit'),
  TMRPrinter = require('./printers/tmr'),
  ENV = require('../env'),
  TeleBot = require('telebot'),
  { log } = require('./lib/utils')
;

const
  TOKEN = ENV.TOKEN
  repo = new Repository(),
  bot = new TeleBot( TOKEN )
;

const
  REGEX_COMMAND_UNIT = /^\/unit\s+(\+)?(.+)$/i,
  REGEX_COMMAND_TMR = /^\/tmr\s+(.+)$/i,
  REGEX_COMMAND_HELP = /^\/help.*$/i
;

// bot.on('tick', event => log(event, 'tick')) // esto quizás sirva para scheduled messages

bot.on(REGEX_COMMAND_HELP, message => replier(message)('I am a ffbe info bot, available commands: unit') )
bot.on(REGEX_COMMAND_TMR, tmr)
bot.on(REGEX_COMMAND_UNIT, unit)

bot.on('callbackQuery', callbackQuery);

bot.start()

function callbackQuery(msg){
  const { data } = msg
  log(msg)
  let callback = x => x
  let match = {}
  if (match = data.match(REGEX_COMMAND_UNIT)){
    callback = _ => unit(msg.message, { type: 'command', match })
  } else if (match = data.match(REGEX_COMMAND_TMR)){
    callback = _ => tmr(msg.message, { type: 'command', match })
  }

  callback()
}

function tmr(message, props){
  const identifier = props.match[1]
  const getter = identifier => repo.find_tmr_by_name(identifier)
  return process_unit(getter, TMRPrinter, replier(message), false, identifier)
}

function unit (message, props) {
  log(message)
  log(props)
  const mode = props.match[1] === '+' ? true : false
  const identifier = props.match[2]
  const getter = identifier => 
    repo.check_if_nickname(identifier).then(
      ({value}) => repo.find_unit_by_name(value)
    )
  
  return process_unit(getter, UnitPrinter, replier(message), mode, identifier)
}

function process_unit(getter, printer, replier, mode, identifier){
  const markup = buttons => !!buttons 
    ? bot.inlineKeyboard( [ ...buttons.map( ({title, content}) => [ bot.inlineButton(title, content)] ) ] )
    : undefined

  return getter(identifier)
    /*.then(log)*/.then( ({ value, suggestions }) => {
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

