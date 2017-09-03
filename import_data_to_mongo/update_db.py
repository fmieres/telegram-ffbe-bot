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

def update_units():
    print "Mongo DB - Updating Units Collection..."
    db = DB_CLIENT.ffbe
    units_collection = db.units
    units_collection.remove()

    units = get_units()
    result = units_collection.insert_many(units)


################################
# Data Processing
###################################################################

def format_data(data):
    def with_id(properties, item_id):
        properties['id'] = item_id
        return properties

    return [with_id(properties, item_id) for item_id, properties in data.items()]

@catch_exceptions
def get_units():
    with open('./node_modules/data/units.json') as units_json:
        return format_data(json.load(units_json))


################################
# Main
###################################################################

if __name__ == "__main__":
    create_connection()
    update_units()
    close_connection()
    