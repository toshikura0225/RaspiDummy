#! /usr/bin/python
# -*- coding: utf-8 -*- 

import sys

print "load"

def test():
    #print u"関数：testを呼び出しました"
    print "called python test method"

if __name__ == "__main__":
	print "main method argument is..."
	argvs = sys.argv
	print argvs
	#print "パイソンイズム"
	test()
#import sys
#print "data"
#for line in sys.stdin:
 #   print "data2"

	