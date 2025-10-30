#!/bin/bash
cd /home/kavia/workspace/code-generation/note-organizer-36766-36775/notebook_pro_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

