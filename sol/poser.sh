#!/bin/sh
cd "$( dirname "${BASH_SOURCE[0]}" )"
if [ ! -d "../build" ]; then
	mkdir ../build
fi
g++ -std=c++0x -o ../build/p p.cpp
../build/p
