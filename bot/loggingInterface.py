import sys
import logging

class Log :

  def __init__(self, aHandler):
    self.__handler = aHandler
    self.__logger = self.__setUpLogger__()
    self.__handler.applyToLogger(self)

  def getLogger(self):
    return self.__logger

  def __setUpLogger__(self):
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    return logger

  def info(self,message) :
    return self.__logger.info(message)

  def error(self, message, exc_info=False):
    return self.__logger.error(message, exc_info=exc_info)
    # return self.__logger.error(message)


class STOUTHandler :
  def __init__(self):
    self.__messageFormat = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    self.__handler = logging.StreamHandler(sys.stdout)
    self.__handler.setLevel(logging.INFO)
    self.__handler.setFormatter(logging.Formatter(self.__messageFormat))

  def applyToLogger(self, aLog):
    aLog.getLogger().addHandler(self.__handler)