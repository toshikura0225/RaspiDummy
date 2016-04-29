#! /usr/bin/python
# -*- coding: utf-8 -*- 

import sys

from serial import Serial
#import webiopi
import time
#import numpy as np

#print "load"


def forDebug( *sendData ):
	#print ','.join(str(n) for n in sendData)
	print [90, 91, 92]
	
def serialWrite( *sendData ):

	#ttyACM0
	com = Serial(
		port="/dev/ttyACM0",
		baudrate=9600,
		bytesize=8,
		parity='N',
		stopbits=1,
		timeout=1,
		xonxoff=0,
		rtscts=0,
		writeTimeout=1000,
		dsrdtr=None)
		
	time.sleep(2)
	for bt in sendData:
		#com.write(str(bt).encode())
		com.write(bytes(chr(int(bt)).encode()))	
	#com.write(bytes(sendData))
	#com.write(sendData)
	#com.write(b"\x04")
	#com.write("asdfghj")
	#com.write(b"\x05")
	
	
	
	readData = com.read(1000)
	#print(len(readData))
	
	com.close()
	
	#f = open("data.txt", "w")
	#for var in readData:
	#	print("%s" % str(var))
	#	f.write("var=" + str(var))
	#f.close()
	#return [10, 20, 30, 40, 50]
	#return readData
	#return ','.join(str(n) for n in readData)
	
	
	print ','.join(str(n) for n in readData)
	
	#return np.array(readData)
	#return 123

if __name__ == "__main__":
	#print "main method argument is..."
	argvs = sys.argv
	#print argvs
	forDebug(argvs)
# header comment
