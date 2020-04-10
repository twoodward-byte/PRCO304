import Tkinter as tk
from Tkinter import *
import os
from pymongo import MongoClient
from pprint import pprint
from datetime import datetime

client = MongoClient("mongodb+srv://test:test@cluster0-bcfvz.mongodb.net/test?retryWrites=true&w=majority")
db = client["FinalProject"]
mycol = db["partsProduced"]

root = tk.Tk()
root.title("Simulate Button Press")

#Create label widget
myLabel = Label(root, text="Sensor set to: Bracket #423", font=("Arial Bold", 30))
#Attach label to screen
myLabel.pack()

#create canvas
canvas = tk.Canvas(root, height=700, width=700, bg="#263D42") 
canvas.pack()

def testFunc(): #Executes when button pressed
	datetime_now = datetime.now() # pass this to a MongoDB doc
	print("Simulate button pressed")
	mydict = {"amount":"1", "name":"Bracket #423", "date":datetime_now}
	x = mycol.insert_one(mydict)

	
frame = tk.Frame(root, bg="white")
frame.place(relwidth=0.8, relheight=0.8, relx=0.1, rely=0.1)

simBtn = tk.Button(frame, text="Simulate Button Press", command=testFunc)
simBtn.pack()
root.mainloop()
