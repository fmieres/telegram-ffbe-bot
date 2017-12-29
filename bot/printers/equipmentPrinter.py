from json import dumps
from collections import OrderedDict

class EquipmentPrinter:

  @classmethod
  def printResponse(cls, caller, equipment, message, pType = 'HTML'):
    reponse = ''
    for section in ['info']:
      reponse += getattr(cls, section.lower() + pType)(equipment)
    return caller(message, reponse, parse_mode = pType)

  @classmethod
  def infoHTML(cls, equipment):
    return (
      "<b>Name:</b> " + equipment['name'] + "\n"
      "<b>Description:</b> <pre> " + cls.formatDescription(equipment) + "</pre>\n"
      '<a href="https://exvius.gamepedia.com/' + equipment['name'] + '">Wiki</a>'
    )

  @classmethod
  def formatDescription(cls, equipment):
    stats = equipment['stats']
    stats['effects'] = equipment['effects']
    stats['type'] = equipment['type']

    priority = { "type" : 1,"HP" : 2,"MP" : 3,"ATK" : 4,"DEF" : 5,"MAG" : 6,"SPR" : 7,"element_resist" : 8,"element_inflict" : 9,"status_resist" : 10,"status_inflict" : 11,"effects" : 12 }

    intermediate = {k : v for k, v in stats.iteritems() if not v in  (None, 0) }
    ordered = OrderedDict(sorted(intermediate.items(), key=lambda (k,_): priority.get(k) or 99 ))
    
    return dumps(ordered, indent=2)


