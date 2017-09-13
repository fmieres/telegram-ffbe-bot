import json
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
    DB_CLIENT = MongoClient('localhost', 27017)
    print "Mongo DB - Connection Created"

def close_connection():
    print "Mongo DB - Connection Closed"
    DB_CLIENT.close()

def update_collection(collection_name):
    print "Mongo DB - Updating '%s' Collection..." % collection_name
    db = DB_CLIENT.ffbe
    db_collection = getattr(db, collection_name)
    db_collection.remove()

    json_collection = get_collection_data(collection_name)
    return db_collection.insert_many(json_collection)

def update_collections():
    update_collection('units')
    update_collection('skills')


################################
# Data Processing
###################################################################

def format_data(data):
    def with_id(properties, item_id):
        properties['id'] = item_id
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
    