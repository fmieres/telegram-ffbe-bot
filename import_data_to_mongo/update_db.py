import json
from os import environ
from pymongo import MongoClient
from pprint import pprint


################################
# Globals
###################################################################

DB_CLIENT = None


################################
# Decorators
###################################################################

def catch_exceptions(func):
    def exceptions_inner(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception:
            close_connection()
            raise
    return exceptions_inner


################################
# DB Operations
###################################################################

def create_connection():
    global DB_CLIENT
    DB_CLIENT = MongoClient(environ['DB_URL'])
    print "Mongo DB - Connection Created"

def close_connection():
    print "Mongo DB - Connection Closed"
    DB_CLIENT.close()

def update_collection(DB, collection_name, relatedTask = lambda *args: None):
    print "Mongo DB - Updating '%s' Collection..." % collection_name
    db_collection = getattr(DB, collection_name)
    db_collection.remove()

    json_collection = get_collection_data(collection_name)
    #for row in json_collection:
    #    if 'name' in row: row['name'] = row['name'].title()
        
    return db_collection.insert_many(json_collection)

def update_tmr_collection(DB):
    print "Mongo DB - Updating TMR Collection..."

    DB.tmr.remove()

    units_collection = DB.units
    units = units_collection.find();

    tmrs_collection = []

    for u in units:
        if ('TMR' in u) and u['TMR']:
            tmr_type = u['TMR'][0]
            tmr_id = u['TMR'][1]
            if tmr_type == 'EQUIP':
                tmr = DB.equipment.find_one( {"id": tmr_id} )
            else:
                tmr = DB.materia.find_one( {"id": tmr_id} )
            tmr['tmr_type'] = tmr_type
            tmr['unit_name'] = u['name']
            tmrs_collection.append(tmr)
    
    DB.tmr.insert_many(tmrs_collection)

def update_units_nicknames(DB):
    print "Mongo DB - Updating Units Nicknames Collection..."

    DB.units_nicknames.remove()

    nicknames = {
        'wol'         : 'Warrior of Light',
        'vod'         : 'Veritas of the Dark',
        'dv'          : 'Veritas of the Dark',
        'vof'         : 'Veritas of the Flame',
        'fv'          : 'Veritas of the Flame',
        'voe'         : 'Veritas of the Earth',
        'ev'          : 'Veritas of the Earth',
        'vow'         : 'Veritas of the Waters',
        'wv'          : 'Veritas of the Waters',
        'vol'         : 'Veritas of the Light',
        'lv'          : 'Veritas of the Light',
        'voh'         : 'Veritas of the Heavens',
        'hv'          : 'Veritas of the Heavens',
        'wkn'         : 'White Knight Noel',
        'tt'          : 'Trance Terra',
        'cod'         : 'Cloud of Darkness',
        'dkc'         : 'Dark Knight Cecil',
        'ok'          : 'Onion Knight',
        'lassworm'    : 'Lasswell',
        'lassfool'    : 'Lasswell',
        'cg lasswell' : 'Pyro Glacial Lasswell',
        'cg lassworm' : 'Pyro Glacial Lasswell',
        'cg lassfool' : 'Pyro Glacial Lasswell',
        'cg sakura'   : 'Blossom Sage Sakura',
        'cg fina'     : 'Lotus Mage Fina',
        'cg jake'     : 'Nameless Gunner Jake',
        'cg nichol'   : 'Maritime Strategist Nichol',
    }

    nicknames_list = [{'nickname': nickname, 'name': name} for (nickname, name) in nicknames.items()]

    DB.units_nicknames.insert_many(nicknames_list)

def update_events(DB):
    print "Mongo DB - Updating Events Collection..."

    DB.events.remove()

    events = {
        'maintenance': 'wednesday'
    };

    events_list = [{'name': name, 'day': day} for (name, day) in events.items()]

    DB.events.insert_many(events_list)

def update_collections():
    DB_NAME = environ['DB_NAME']
    DB = getattr(DB_CLIENT, DB_NAME)
    update_collection(DB, 'units')
    update_collection(DB, 'skills')
    update_collection(DB, 'materia')
    update_collection(DB, 'equipment')
    update_collection(DB, 'items')
    update_tmr_collection(DB)
    update_units_nicknames(DB)
    update_events(DB)


################################
# Data Processing
###################################################################

def format_data(data):
    def with_id(properties, item_id):
        properties['id'] = int(item_id)
        return properties

    return [with_id(properties, item_id) for item_id, properties in data.items()]

@catch_exceptions
def get_collection_data(collection_name):
    with open('./node_modules/data/%s.json' % collection_name) as collection_json:
        return format_data(json.load(collection_json))


################################
# Main
###################################################################

if __name__ == "__main__":
    create_connection()
    update_collections()
    close_connection()
    