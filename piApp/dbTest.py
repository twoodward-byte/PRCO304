from pymongo import MongoClient
from pprint import pprint
from datetime import datetime
datetime_now = datetime.now() # pass this to a MongoDB doc

client = MongoClient("mongodb+srv://test:test@cluster0-bcfvz.mongodb.net/test?retryWrites=true&w=majority")
db = client["FinalProject"]
mycol = db["partsProduced"]
mydict = {"amount":"123", "name":"piTest", "date":datetime_now}
x = mycol.insert_one(mydict)
#print ("datetime_now:", datetime_now)

print(client.list_database_names())
