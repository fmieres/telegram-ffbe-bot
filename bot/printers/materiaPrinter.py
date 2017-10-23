from equipmentPrinter import EquipmentPrinter
from skillPrinter import SkillPrinter

# Mover a un archivo aparte
class Printer:
	pass

class MateriaPrinter(Printer):

	@classmethod
	def printResponse(cls, caller, materia, message, pType = 'HTML'):
		if materia['print_type'] == 'equipment':
			return EquipmentPrinter.printResponse(caller, materia, message, pType)
		else:
			return SkillPrinter.printResponse(caller, materia, message, pType)