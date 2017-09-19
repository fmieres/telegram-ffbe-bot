from json import dumps

# Mover a un archivo aparte
class Printer:
	pass

class UnitPrinter(Printer):
	@classmethod
	def printResponse(cls, caller, unit, sections, message, pType = 'HTML'):
		reponse = ''
		for section in ['info'] + sections:
			reponse += getattr(cls, section.lower() + pType)(unit)
		return caller(message, reponse, parse_mode = pType)

	@classmethod
	def infoHTML(cls, unit):
		return (
			"<b>Name: " + unit['name'] + "</b>\n"
			'<a href="https://exviusdb.com/static/img/assets/unit/unit_ills_' + str(unit['id']) + '.png">Image </a>'
			'<a href="https://exvius.gamepedia.com/' + unit['name'] + '">Wiki</a>'
		)

	@classmethod
	def skillsHTML(cls, unit):
		return "<pre>" + dumps(unit['skills']) + "</pre>"






