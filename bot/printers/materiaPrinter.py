#from json import dumps

class MateriaPrinter:

	@classmethod
	def printResponse(cls, caller, materia, message, pType = 'HTML'):
		reponse = ''
		for section in ['info']:
			reponse += getattr(cls, section.lower() + pType)(materia)
		return caller(message, reponse, parse_mode = pType)

	@classmethod
	def infoHTML(cls, materia):
		return (
			"<b>Name:</b> " + materia['name'] + "\n"
			"<b>Description:</b> " + cls.formatDescription(materia) + "\n"
			'<a href="https://exvius.gamepedia.com/' + materia['name'] + '">Wiki</a>'
		)

	@classmethod
	def formatDescription(cls, materia):
		return '.\n'.join(materia['effects']) + '.'
