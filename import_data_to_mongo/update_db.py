import json
from os import environ
from pymongo import MongoClient


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

def update_collection(collection_name, relatedTask = lambda *args: None):
    print "Mongo DB - Updating '%s' Collection..." % collection_name
    db = DB_CLIENT.ffbe
    db_collection = getattr(db, collection_name)
    db_collection.remove()

    json_collection = get_collection_data(collection_name)
    #for row in json_collection:
    #    if 'name' in row: row['name'] = row['name'].title()
        
    return db_collection.insert_many(json_collection)

def create_tmr_collection():
    print "Mongo DB - Creating TMR Collection..."
    DB = DB_CLIENT.ffbe
    units_collection = DB.units
    units = units_collection.find();

    tmrs_collection = []

    for u in units:
        if u['TMR']:
            tmr_type = u['TMR'][0]
            tmr_id = u['TMR'][1]
            if tmr_type == 'EQUIP':
                tmr = DB_CLIENT.ffbe.equipment.find_one( {"id": tmr_id} )
            else:
                tmr = DB_CLIENT.ffbe.materia.find_one( {"id": tmr_id} )
            tmr['tmr_type'] = tmr_type
            tmrs_collection.append(tmr)
    
    DB.tmr.insert_many(tmrs_collection)


def update_collections():
    update_collection('units')
    update_collection('skills')
    update_collection('materia')
    update_collection('equipment')
    update_collection('items')
    create_tmr_collection()


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
    