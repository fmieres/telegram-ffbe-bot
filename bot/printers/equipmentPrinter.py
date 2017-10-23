from json import dumps

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
			"<b>Description:</b> " + cls.formatDescription(equipment) + "\n"
			'<a href="https://exvius.gamepedia.com/' + equipment['name'] + '">Wiki</a>'
		)

	@classmethod
	def formatDescription(cls, equipment):
		stats = equipment['stats']
		stats['type'] = equipment['type']
		return dumps(equipment['stats'], indent=2)


