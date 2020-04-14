import Tkinter as tk
from Tkinter import *
import os
from pymongo import MongoClient
from pprint import pprint
from datetime import datetime
import random
import time
import pymongo


#Set mongo db cloud URI
client = MongoClient("mongodb+srv://test:test@cluster0-bcfvz.mongodb.net/test?retryWrites=true&w=majority")
db = client["FinalProject"]
mycol = db["partsProduced"]

root = tk.Tk()
root.title("Random Testing Data")

#Create label widget
myLabel = Label(root, text="Generate Random Testing Data", font=("Arial Bold", 30))
#Attach label to screen
myLabel.pack()


#Get all parts as array of strings
asd = db["parts"]
post = asd.find()
print(post)
x = asd.find({},{ "_id": 0, "name": 1})
partsList = x.distinct('name')
print(x[0]) 

def btnStopClick():
	exit()	#exit program



def btnStartClick():
	while(1):
		#random number between 1 and 10 for amount
		x = random.randint(1, 10)
		#random part picked
		#get parts from database in dictionary
		partsArray = partsList
			#use random number to pick one as an index
		length = len(partsArray)
		randNum = random.randint(0,length -1)
		#make a variable equal to this
		randomPart = partsArray[randNum]
		print(randomPart)
		#insert this into database with pi as origin
		datetime_now = datetime.now() # pass this to a MongoDB doc
		mydict = {"amount":x, "name":randomPart, "date":datetime_now, "origin": "Pi"}
		x = mycol.insert_one(mydict)
		#pick random number between 1 and 10 for seconds to sleep
		x = random.randint(1, 10)
		#wait this long before executing again.
		time.sleep(x)
	
#create canvas
canvas = tk.Canvas(root, height=700, width=700, bg="#263D42") 
canvas.pack()

frame = tk.Frame(root, bg="white")
frame.place(relwidth=0.8, relheight=0.8, relx=0.1, rely=0.1)

#Create start button
simBtn = tk.Button(frame, text="Start Generating Data", command=btnStartClick)
simBtn.pack()

#Create stop button
stopBtn = tk.Button(frame, text="Stop Generating Data", command=btnStopClick)
stopBtn.pack()


#Loop to keep UI present
root.mainloop()
