from pymongo import MongoClient

class Repository :

  REPO = 'mongodb://localhost:27017/'

  def find_materia_by_name(self, name):
    client = MongoClient(self.REPO)
    materia = client.ffbe.materia.find_one({"name" : name})
    del materia['_id']
    return materia

  def find_unit_by_name(self, name):
    client = MongoClient(self.REPO)

    #unit = client.ffbe.units.find_one({"name" : name })
    units = client.ffbe.units.aggregate([

      {'$match': {"name": name}},
      
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
