from abc import abstractmethod
from json import dumps

class MessageDecorator :

  def __init__(self, log, parseMode) :
    self.__log = log
    self.__parseMode = parseMode

  def log(self) :
    return self.__log

  def unitWithSkills(self, unit, caller, message) :
    return caller(message, self._unitWithSkills(unit) ,parse_mode = self.__parseMode)

  @abstractmethod
  def _unitWithSkills(self, unit) : 
    pass

class HtmlDecorator(MessageDecorator) : 
  def __init__(self, log) :
    MessageDecorator.__init__(self,log, 'HTML')

  def _unitWithSkills(self, unit) : 
    return (
      "<b>" + unit['name'] + ":</b>\n"
      "<pre>" + dumps(unit['skills']) + "</pre>"
      '<a href="https://exvius.gamepedia.com/media/exvius.gamepedia.com/0/08/Unit-Elza-6.png?version=24bd2424bcccca2f48373bde0cb26d5d">wiki link</a>'
      '<a href="https://exvius.gamepedia.com/' + unit['name'] + '">wiki link</a>'
    )