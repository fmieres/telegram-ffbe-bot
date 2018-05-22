const 
  { log } = require('./lib/utils')
  ENV = require('../env')
  MongoClient = require('mongodb')
;

const 
  COLLECTION_EQUIPMENT        = 'equipment',
  COLLECTION_MATERIA          = 'materia',
  COLLECTION_TMR              = 'tmr',
  COLLECTION_UNIT             = 'units',
  COLLECTION_UNITS_NICKNAMES  = 'units_nicknames',
  DB_NAME = ENV.DB_NAME,
  DB_URL  = ENV.DB_URL
;

class Repository {
  constructor() {
    this._url = DB_URL
  }

  _set_up_connection( collection_callback ){
    return MongoClient.connect(this._url,  { useNewUrlParser: true })
  }

  _inner_query(callback, collection_name, post_process = x => x){
    return this._set_up_connection()
      .then( db => {
        const entity = !!collection_name
          ? db.db(DB_NAME).collection(collection_name)
          : db.db(DB_NAME)
        
        return callback(entity)
          .then( post_process )
          .then(this._remove_id )
          .then(this._find_suggestions(entity))
          .then(this._end_connection(db))
      })
  }
  
  /*
    TODO : algoritmo de suggestions
  */
  _find_suggestions(collection){
    return value =>
      ({ value, suggestions : [] })
  }

  _simple_query_regex(name){
    return collection =>  {
      return collection.findOne(this._regex_query(name))
    }
  }

  _regex_query(name){
    const widerTerm = ['', ...name.trim().split(/\s+/), ''].join('.*')
    return { name : {$regex: `${widerTerm}`, $options : 'i' }}
  }

  _end_connection(db){
    return res => {
      db.close()
      return res
    }
  }

  _remove_id(obj){
    if (!!obj) delete obj._id
    return obj
  }

  check_if_nickname(identifier) {
    const lower_identifier = identifier.toLowerCase()
    const query = collection => {
      return collection.findOne({nickname: lower_identifier}).then( 
        result => result ? result.name : identifier
      ) 
    }
    return this._inner_query(query, COLLECTION_UNITS_NICKNAMES)
  }
  
  find_equipment_by_name(name) {
    return this._inner_query(this._simple_query_regex(name), COLLECTION_EQUIPMENT)
  }
  
  find_materia_by_name(name) {
    return this._inner_query(this._simple_query_regex(name), COLLECTION_MATERIA)
  }

  find_tmr_by_name(name){
    return this._inner_query(this._simple_query_regex(name), COLLECTION_TMR, )
  }

  find_unit_by_name(name){
    const query = collection => {
      return collection.aggregate([
        { $match : this._regex_query(name)},
        
        { $unwind : "$skills" },
        
        {
          $lookup: {
            from         : 'skills', 
            localField   : 'skills.id', 
            foreignField : 'id', 
            as           : 'skill_info'
          }
        },
        
        { $unwind : "$skill_info" },

        {
          $group  :{
            _id        : '$_id',
            tmr_type   : { $first : { $arrayElemAt: [ '$TMR' , 0] } },
            tmr_id     : { $first : { $arrayElemAt: [ '$TMR' , 1] } },
            id         : { $first : '$id'},
            name       : { $first : '$name'},
            names      : { $first : '$names'},
            entries    : { $first : '$entries' },
            job        : { $first : '$job' },
            game       : { $first : '$game' },
            rarity_min : { $first : '$rarity_min' },
            rarity_max : { $first : '$rarity_max' },
            sex        : { $first : '$sex' },
            skills     : { $push  : { $mergeObjects : ['$skill_info', { unit_rarity : '$skills.rarity', unit_level : '$skills.level' }]} }
          }
        },

        {
          $lookup : {
            from         : 'tmr',
            localField   : 'tmr_id',
            foreignField : 'id',
            as           : 'tmr',
          }
        },

        {
          $project : {
            id          : true,
            _id         : false,
            name        : true,
            names       : true,
            tmr_type: true,
            // tmr : true,
            skills      : true,
            job         : true,
            game        : true,
            sex         : true,
            rarity_min  : true,
            rarity_max  : true,
            stats : { 
              $let : {
                vars : {
                  entry : {
                    $arrayElemAt: [ { $objectToArray : '$entries' } , 0]
                  }
                },
                in : "$$entry.v.stats"
              }  
            } 
          }
        }

      ])
      .toArray()
      .then( documents => 
        // por la forma de _regex_query , tenemos más opciones cuando se busca algo 
        // especifico, por eso ordeno los items por el que tienen el nombre más corto
        // y me quedo con el primero
        // TODO : no es la mejor estrategia
        documents.sort( ({name},{name : name2}) => name.length - name2.length )[0]
      )
    }
    return this._inner_query(query, COLLECTION_UNIT)
  }

}

// module.exports = Repository 

(new Repository()).find_unit_by_name('seph').then(log)