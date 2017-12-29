from pymongo import MongoClient
import re

class Repository :

  REPO = 'mongodb://localhost:27017/'

  def find_equipment_by_name(self, name, client = None):
    client = MongoClient(self.REPO)
    
    equipment = client.ffbe.equipment.find_one({"name" : re.compile(name, re.IGNORECASE)})
    if equipment:
      del equipment['_id']

    return equipment

  def find_materia_by_name(self, name, client = None):
    client = MongoClient(self.REPO)

    materia = client.ffbe.materia.find_one({"name" : re.compile(name, re.IGNORECASE)})
    if materia:
      del materia['_id']

    return materia

  def find_tmr_by_name(self, name):
    client = MongoClient(self.REPO)

    tmr = client.ffbe.tmr.find_one({"name" : re.compile(name, re.IGNORECASE)})
    if tmr:
      del tmr['_id']

    return tmr

  def find_unit_by_name(self, name):
    client = MongoClient(self.REPO)
    
    unit_name = name.lower()
    if unit_name.startswith("zarg"): unit_name = 'Zargabaath'

    units = client.ffbe.units.aggregate([

      {'$match': {"name": re.compile(unit_name, re.IGNORECASE)}},
      
      {'$unwind':"$skills"},
      
      {
        '$lookup': {
          'from': 'skills', 
          'localField': 'skills.id', 
          'foreignField': 'id', 
          'as': 'skill_info'
        }
      },
      
      {'$unwind':"$skill_info"},
      
      {'$group':{
          '_id': '$_id',
          'id': {'$first':'$id'},
          'name': {'$first':'$name'},
          'names': {'$first':'$names'},
          'skills': {
              '$push': '$skill_info.name'
          }
      }},

    ])

    unit = list(units)[0]
    del unit['_id']

    client.close
    return unit
