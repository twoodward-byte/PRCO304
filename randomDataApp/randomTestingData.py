import Tkinter as tk
from Tkinter import *
import os
from pymongo import MongoClient
from pprint import pprint
from datetime import datetime
import random
import time


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


def btnStopClick():
	#exit program
	exit()


def btnStartClick():
	#random number between 1 and 10 for amount
	x = random.randint(1, 10)
	#random part picked
	
	#get parts from database in dictionary
	#use random number to pick one as an index
	#make a variable equal to this
	
	
	#insert this into database with pi as origin
	datetime_now = datetime.now() # pass this to a MongoDB doc
	mydict = {"amount":x, "name":"Bracket #423", "date":datetime_now, "origin": "Pi"}
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
