from json import dumps

class SkillPrinter:

	@classmethod
	def printResponse(cls, caller, skill, message, pType = 'HTML'):
		reponse = ''
		for section in ['info']:
			reponse += getattr(cls, section.lower() + pType)(skill)
		return caller(message, reponse, parse_mode = pType)

	@classmethod
	def infoHTML(cls, skill):
		return (
			"<b>Name:</b> " + skill['name'] + "\n"
			"<b>Description:</b> " + cls.formatDescription(skill) + "\n"
			'<a href="https://exvius.gamepedia.com/' + skill['name'] + '">Wiki</a>'
		)

	@classmethod
	def formatDescription(cls, skill):
		return '.\n'.join(skill['effects']) + '.'
