from equipmentPrinter import EquipmentPrinter
from materiaPrinter import MateriaPrinter

# Mover a un archivo aparte
class Printer:
	pass

class TmrPrinter(Printer):

	@classmethod
	def printResponse(cls, caller, tmr, message, pType = 'HTML'):
		if tmr['tmr_type'] == 'EQUIP':
			return EquipmentPrinter.printResponse(caller, tmr, message, pType)
		else:
			return MateriaPrinter.printResponse(caller, tmr, message, pType)