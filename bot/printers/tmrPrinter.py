from equipmentPrinter import EquipmentPrinter
from skillPrinter import SkillPrinter

# Mover a un archivo aparte
class Printer:
	pass

class TmrPrinter(Printer):

	@classmethod
	def printResponse(cls, caller, tmr, message, pType = 'HTML'):
		if tmr['print_type'] == 'equipment':
			return EquipmentPrinter.printResponse(caller, tmr, message, pType)
		else:
			return SkillPrinter.printResponse(caller, tmr, message, pType)