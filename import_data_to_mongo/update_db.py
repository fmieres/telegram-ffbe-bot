import json
from pymongo import MongoClient


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
	print "Mongo DB - Connection Created"
	return MongoClient('localhost', 27017)
	

def close_connection(db_client):
	print "Mongo DB - Connection Closed"
	db_client.close()

def update_units(db_client):
	print "Mongo DB - Updating Units Collection..."
	db = db_client.ffbe
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
	db_client = create_connection()

	update_units(db_client)

	close_connection(db_client)
	