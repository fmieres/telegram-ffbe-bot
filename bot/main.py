import logging
import telebot
import json
import sys
#from pprint import pprint
from repository import Repository
from loggingInterface import Log, STOUTHandler
from printers.unitPrinter import UnitPrinter
from printers.materiaPrinter import MateriaPrinter
#from utils import catch_exceptions

token =  sys.argv[1]
bot = telebot.TeleBot(token)
repo = Repository()
log = Log(STOUTHandler())
log.info("Setting up bot")


#####################
# BOT COMMANDS
###########################

@bot.message_handler(commands=['help'])
# @log.error_handler()
def help(message):
  bot.send_message(message.chat.id, 'I am a ffbe info bot, available commands: unit_names, unit')

'''
@bot.message_handler(commands=['unit_names'])
def unit_names(message):
  try :
    name = message.text.split(' ',1)[1]
    unit = repo.find_unit_by_name(name)
    bot.reply_to(message, json.dumps(unit["names"]))
  except Exception:
    log.error("Exception:", exc_info=True)
    bot.reply_to(message, "unit name '" + name + "' not found")
'''

@bot.message_handler(commands=['unit'])
def unit(message):
  params = message.text.split(' ')
  name = params[1].title()
  try :
    printUnit(message, name, params[2:])
  except Exception:
    log.error("Exception:", exc_info=True)
    bot.reply_to(message, "unit name '" + name + "' not found")


@bot.message_handler(commands=['materia'])
def materia(message):
  params = message.text.split(' ', 1)
  name = params[1].title()
  try :
    printMateria(message, name)
  except Exception:
    log.error("Exception:", exc_info=True)
    bot.reply_to(message, "Materia name '" + name + "' not found")


@bot.message_handler(func=lambda m: True)
def default_message_unknown(message):
  bot.reply_to(message, 'unknown command: ' + message.text)


#####################
# SUB-TASKS
###########################

def printUnit(message, name, sections):
  unit_name = checkAbreviations(name)
  unit = repo.find_unit_by_name(unit_name)
  #log.info(unit, json=True)
  UnitPrinter.printResponse(bot.reply_to, unit, sections, message)

def printMateria(message, materia_name):
  materia = repo.find_materia_by_name(materia_name)
  log.info(materia, json=True)
  MateriaPrinter.printResponse(bot.reply_to, materia, message)

def checkAbreviations(name):
  abreviations = {
    'Wol': 'Warrior of Light',
    'Vod': 'Veritas of the Dark',
    'Dv' : 'Veritas of the Dark',
    'Vof': 'Veritas of the Flame',
    'Fv' : 'Veritas of the Flame',
    'Voe': 'Veritas of the Earth',
    'Ev' : 'Veritas of the Earth',
    'Vow': 'Veritas of the Waters',
    'Wv' : 'Veritas of the Waters',
    'Vol': 'Veritas of the Light',
    'Lv' : 'Veritas of the Light',
    'Voh': 'Veritas of the Heavens',
    'Hv' : 'Veritas of the Heavens',
    'Wkn': 'White Knight Noel',
    'Tt' : 'Trance Terra',
    'Cod': 'Cloud of Darkness',
    'Dkc': 'Dark Knight Cecil',
  }

  return abreviations[name] if name in abreviations else name

#####################
# MAIN
###########################

if __name__ == '__main__':
  log.info("Bot ready, polling")
  bot.polling()
