#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-web-tic-tac-toe-318599-318608/tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

