#!/bin/bash
cd /home/kavia/workspace/code-generation/healthsync-ai-107640-4d32b7fd/healthsync_ai_platform
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

