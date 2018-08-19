#!/bin/bash
cd ~/projects/bots
./node_modules/webpack/bin/webpack.js -p --config=webpack.prod.js --progress --colors
