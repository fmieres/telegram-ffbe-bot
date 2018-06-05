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
  REGEX_COMMAND_HELP = /^\/help.*$/i,
  REGEX_COMMAND_SUB = /^\/sub\s+(.+)$/i,
  REGEX_COMMAND_UNSUB = /^\/unsub\s+(.+)$/i
;

const BROADCAST_TIME_START = '18:00:00';
const BROADCAST_RESETS_OFFSET = 5;
let ALREADY_BROADCASTED = false;
const ALREADY_BROADCASTED_RESET_TIME = '23:59:59';
bot.on('tick', event => try_to_broadcast());

bot.on(REGEX_COMMAND_HELP, message => replier(message)('I am a ffbe info bot, available commands: unit') );
bot.on(REGEX_COMMAND_TMR, tmr);
bot.on(REGEX_COMMAND_UNIT, unit);
bot.on(REGEX_COMMAND_SUB, sub);
bot.on(REGEX_COMMAND_UNSUB, unsub);

bot.on('callbackQuery', callbackQuery);

bot.start();

function callbackQuery(msg){
  const { data } = msg
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

function sub(message, props){
  const identifier = props.match[1];
  repo.create_subscription(message.chat.id, identifier, -3).then(
    result => bot.sendMessage(message.chat.id, result, { parseMode : 'HTML' })
  );
}

function unsub(message, props){
  const identifier = props.match[1];
  repo.remove_subscription(message.chat.id, identifier).then(
    result => bot.sendMessage(message.chat.id, result, { parseMode : 'HTML' })
  );
}

function unit(message, props) {
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
    .then(log).then( ({ value, suggestions }) => {
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

function broadcast_events() {
  console.log("Broadcasting...");
}

function try_to_broadcast() {
  const now = new Date();

  if (!ALREADY_BROADCASTED) {
    let broadcast_time_start = new Date();
    broadcast_time_start.setUTCHours( ...BROADCAST_TIME_START.split(':'));

    let broadcast_time_end = new Date(broadcast_time_start);
    broadcast_time_end.setMinutes(broadcast_time_end.getMinutes() + BROADCAST_RESETS_OFFSET);

    console.log("Current date: ", now);
    console.log("Broadcast time START: ", broadcast_time_start);
    console.log("Broadcast time END: ", broadcast_time_end);
    
    if (now > broadcast_time_start && now < broadcast_time_end) {
      ALREADY_BROADCASTED = true;
      log("ALREADY_BROADCASTED set to TRUE");
      broadcast_events();
    }
  } else {
    let broadcast_reset_start = new Date();
    broadcast_reset_start.setUTCHours( ...ALREADY_BROADCASTED_RESET_TIME.split(':'));

    let broadcast_reset_end = new Date(broadcast_reset_start);
    broadcast_reset_end.setMinutes(broadcast_reset_end.getMinutes() + BROADCAST_RESETS_OFFSET);

    console.log("Broadcast reset time START: ", broadcast_reset_start);
    console.log("Broadcast reset time END: ", broadcast_reset_end);

    if (now > broadcast_reset_start && now < broadcast_reset_end) {
      log("ALREADY_BROADCASTED set to FALSE");
      ALREADY_BROADCASTED = false;
    }
  }

  //bot.sendMessage(396486740, "TEST", { parseMode : 'HTML'})
}

