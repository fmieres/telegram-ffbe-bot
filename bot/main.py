import telebot
import json
import sys
from pymongo import MongoClient
from pprint import pprint

token =  sys.argv[1]


def find_by_name(name):
  client = MongoClient('mongodb://localhost:27017/')

  #unit = client.ffbe.units.find_one({"name" : name })
  units = client.ffbe.units.aggregate([

    {'$match': {"name": name}},
    
    {'$unwind':"$skills"},
    
    {
      '$lookup': {
        'from': 'skills', 
        'localField': 'skills.id', 
        'foreignField': 'id', 
        'as': 'skill_info'
      }
    },
    
    {'$unwind':"$skill_info"},
    
    {'$group':{
        '_id': '$_id',
        'id': {'$first':'$id'},
        'name': {'$first':'$name'},
        'names': {'$first':'$names'},
        'skills': {
            '$push': '$skill_info.name'
        }
    }},

  ])

  unit = list(units)[0]
  del unit['_id']

  client.close
  return unit

bot = telebot.TeleBot(token)

@bot.message_handler(commands=['help'])
def help(message):
  bot.send_message(message.chat.id, 'I am a ffbe info bot, available commands: unit_names, unit')

@bot.message_handler(commands=['unit_names'])
def unit_names(message):
  try :
    name = message.text.split(' ',1)[1]
    unit = find_by_name(name)
    bot.reply_to(message, json.dumps(unit["names"]))
  except Exception:
    bot.reply_to(message, "unit name '" + name + "' not found")

@bot.message_handler(commands=['unit'])
def unit(message):
  try :
    name = message.text.split(' ',1)[1]
    if name.startswith("Zarg"): name = 'Zargabaath'
    unit = find_by_name(name)
    bot.reply_to(message, json.dumps(unit))
  except Exception:
    bot.reply_to(message, "unit name '" + name + "' not found")

@bot.message_handler(func=lambda m: True)
def default_message_unknown(message):
  bot.reply_to(message, 'unknown command: ' + message.text)


bot.polling()

