#! /bin/bash
nice --adjustment=-10 node server/game.js > log.js 2>&1 &
