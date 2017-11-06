#!/bin/sh
cd "$( dirname "${BASH_SOURCE[0]}" )"
npm install
if [ ! -d "build" ]; then
	mkdir build
fi
g++ -std=c++0x -o build/checker checker.cpp