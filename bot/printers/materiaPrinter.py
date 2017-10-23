from json import dumps

# Mover a un archivo aparte
class Printer:
	pass

class MateriaPrinter(Printer):

	@classmethod
	def printResponse(cls, caller, materia, message, pType = 'HTML'):
		reponse = ''
		for section in ['info']:
			reponse += getattr(cls, section.lower() + pType)(materia)
		return caller(message, reponse, parse_mode = pType)

	@classmethod
	def infoHTML(cls, materia):
		return (
			"<b>Name: " + materia['name'] + "</b>\n"
			"<b>Description: " + materia['strings']['desc_long'][0] + "</b>\n"
			'<a href="https://exvius.gamepedia.com/' + materia['name'] + '">Wiki</a>'
		)

