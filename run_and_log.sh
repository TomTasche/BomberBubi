#! /bin/bash
sudo nice --adjustment=-10 node game.js > log.js 2>&1 &
