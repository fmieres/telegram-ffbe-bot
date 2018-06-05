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
  COLLECTION_SUBSCRIPTIONS    = 'subscriptions',
  COLLECTION_EVENTS           = 'events',
  DB_NAME = ENV.DB_NAME,
  DB_URL  = ENV.DB_URL,
  SUBSCRIPTIONS = ['maintenance']
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

  create_subscription(chat_id, event, timezone) {
    const formatted_event = event.toLowerCase();
    if (SUBSCRIPTIONS.includes(formatted_event)) {
      const query = collection => {
        const sub = {
          chat_id: chat_id,
          event: formatted_event,
          timezone: timezone
        };

        return collection.update({chat_id: chat_id, event: event}, sub, { upsert: true }).then(
          result => formatted_event,
          error => console.log(error)
        );
      };

      return this._inner_query(query, COLLECTION_SUBSCRIPTIONS).then(
        ({value}) => "Subscribed this chat to the '" + value + "' event",
        ({value}) => 'There was a problem with your subscription. Try again later'
      );

    } else {
      return new Promise((accept, reject) => {
        accept('The specified event does not exist');
      });
    }
  }

  remove_subscription(chat_id, event) {
    const formatted_event = event.toLowerCase();
    if (SUBSCRIPTIONS.includes(formatted_event)) {
      const query = collection => {
        return collection.remove({chat_id: chat_id, event: event}).then(
          result => formatted_event,
          error => console.log(error)
        );
      };

      return this._inner_query(query, COLLECTION_SUBSCRIPTIONS).then(
        ({value}) => "Removed this chat from the '" + value + "' event",
        ({value}) => 'There was a problem with your subscription removal. Try again later'
      );

    } else {
      return new Promise((accept, reject) => {
        accept('The specified event does not exist');
      });
    }
  }

  search_event_subs_by_timezone(event) {
    /*
    TODO: Buscar todos las 'subscriptions' que tengan el 'event'.
    Hacer reduce para tener la forma:
    {
      <timezone1>: [subs],
      <timezone2>: [subs]
    }
    */

    const query = collection => {
      return new Promise((accept, reject) => {
        collection.find({event: event}).toArray(
          (err, result) => {
            if (err) reject(err);

            accept(
              result.reduce((acc, sub) => {
                const tz = sub.timezone;
                if (!(tz in acc)) acc[tz] = [];
                acc[tz].push(sub);
                return acc;
              }, {})
            );
        });
      });
    };
    return this._inner_query(query, COLLECTION_SUBSCRIPTIONS);
  }

  search_for_events(day_name) {
    const query = collection => {
      return collection.distinct('name', {day: day_name}).then(result => result);
    };
    return this._inner_query(query, COLLECTION_EVENTS);
  }
  
  find_equipment_by_name(name) {
    return this._inner_query(this._simple_query_regex(name), COLLECTION_EQUIPMENT)
  }
  
  find_materia_by_name(name) {
    return this._inner_query(this._simple_query_regex(name), COLLECTION_MATERIA)
  }

  find_tmr_by_name_simple(name){
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
            tmr : {
              $cond : { if: { $gt: [ { $size : '$tmr'}, 0 ] } , then: { $arrayElemAt : [ '$tmr', 0 ] }, else : undefined }
            },
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
      .then( get_correct_entry_from_collection )
    }
    return this._inner_query(query, COLLECTION_UNIT)
  }

  find_tmr_by_name(name){
    const query = collection => {
      return collection.aggregate([
        { $match : this._regex_query(name)},
        
        { 
          $unwind : {
            path : "$skills",
            preserveNullAndEmptyArrays: true
          } 
        },
        
        {
          $lookup: {
            from         : 'skills', 
            localField   : 'skills', 
            foreignField : 'id', 
            as           : 'skill_info'
          }
        },
        
        {
          $unwind :{
            path : "$skill_info",
            preserveNullAndEmptyArrays : true
          }
        },

        {
          $group  :{
            _id               : '$_id',
            unit_name         : { $first : '$unit_name' },
            unit_restriction  : { $first : '$unit_restriction' },
            unique            : { $first : '$unique' },
            stats             : { $first : '$stats' },
            effects           : { $first : '$effects' },
            type              : { $first : '$type'  },
            is_twohanded      : { $first : '$is_twohanded' },
            accuracy          : { $first : '$accuracy' },
            slot              : { $first : '$slot' },
            requirements      : { $first : '$requirements' },
            dmg_variance      : { $first : '$dmg_variance' },
            icon              : { $first : '$icon' },
            name              : { $first : '$name' },
            tmr_type          : { $first : '$tmr_type' },
            skills            : { $push  : '$skill_info' }
          }
        },

        {
          $project : {
            _id : false, 
          }
        }

      ])
      .toArray()
      .then( get_correct_entry_from_collection )
    }
    return this._inner_query(query, COLLECTION_TMR)
  }

}


/**
* por la forma de _regex_query , tenemos más opciones cuando se busca algo 
* especifico, por eso ordeno los items por el que tienen el nombre más corto
* y me quedo con el primero
* TODO : no es la mejor estrategia
*/
function get_correct_entry_from_collection(documents){
  return documents.sort( ({name},{name : name2}) => name.length - name2.length )[0]
}

module.exports = Repository

// (new Repository()).find_unit_by_name('Seph').then(log)
// 
// (new Repository()).find_tmr_by_name('Rikku').then(log)
// (new Repository()).find_tmr_by_name('Minerva').then(log)