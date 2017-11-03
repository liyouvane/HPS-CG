#!/bin/sh
cd "$( dirname "${BASH_SOURCE[0]}" )"
g++ -std=c++0x -o p p.cpp
./p
