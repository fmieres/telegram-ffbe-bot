import telebot
import json
import sys
from pymongo import MongoClient

token =  sys.argv[1]


def find_by_name(name):
  client = MongoClient('mongodb://localhost:27017/')
  unit = client.ffbe.units.find_one({"name" : name })
  client.close
  return unit

bot = telebot.TeleBot(token)

# @bot.message_handler(commands=['start', 'help'])
# def send_welcome(message):
#   bot.reply_to(message, "Howdy, how are you doing?")

@bot.message_handler(func=lambda m: True)
def echo_all(message):
  unit = find_by_name(message.text)
  bot.reply_to(message, json.dumps(unit["names"]))

bot.polling()

