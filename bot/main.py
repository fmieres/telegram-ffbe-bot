import telebot
import json
import sys
from pymongo import MongoClient

token =  sys.argv[1]


def find_by_name(name):
  client = MongoClient('mongodb://localhost:27017/')
  unit = client.ffbe.units.find_one({"name" : name })
  print unit
  print client.ffbe.units.find_one()
  client.close
  return unit

bot = telebot.TeleBot(token)

@bot.message_handler(commands=['help'])
def help(message):
  bot.send_message(message.chat.id, 'I am a ffbe info bot, available commands: unit_names')

@bot.message_handler(commands=['unit_names'])
def unit_names(message):
  try :
    name = message.text.split(' ',1)[1]
    print name
    unit = find_by_name(name)
    bot.reply_to(message, json.dumps(unit["names"]))
  except Exception as e :
    bot.reply_to(message, 'unit name ' + name + ' not found')


@bot.message_handler(func=lambda m: True)
def default_messgae_unknown(message):
  bot.reply_to(message, 'unknown command: ' + message.text)


bot.polling()

