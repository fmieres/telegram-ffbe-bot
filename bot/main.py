import logging
import telebot
import json
import sys
from pprint import pprint
from repository import Repository
from loggingInterface import Log, STOUTHandler

token =  sys.argv[1]
bot = telebot.TeleBot(token)
repo = Repository()
log = Log(STOUTHandler())
log.info("Setting up bot")

@bot.message_handler(commands=['help'])
def help(message):
  bot.send_message(message.chat.id, 'I am a ffbe info bot, available commands: unit_names, unit')

@bot.message_handler(commands=['unit_names'])
def unit_names(message):
  try :
    name = message.text.split(' ',1)[1]
    unit = repo.find_unit_by_name(name)
    bot.reply_to(message, json.dumps(unit["names"]))
  except Exception as e:
    log.error("Exception:", exc_info=True)
    bot.reply_to(message, "unit name '" + name + "' not found")

@bot.message_handler(commands=['unit'])
def unit(message):
  try :
    name = message.text.split(' ',1)[1]
    if name.startswith("Zarg"): name = 'Zargabaath'
    unit = repo.find_unit_by_name(name)
    bot.reply_to(message, json.dumps(unit))
  except Exception:
    log.error("Exception:", exc_info=True)
    bot.reply_to(message, "unit name '" + name + "' not found")

@bot.message_handler(func=lambda m: True)
def default_message_unknown(message):
  bot.reply_to(message, 'unknown command: ' + message.text)

log.info("Bot ready, polling")
bot.polling()
