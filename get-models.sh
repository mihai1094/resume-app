#!/bin/bash
API_KEY=$(grep "GOOGLE_AI_API_KEY=" .env.local | cut -d '=' -f2)
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$API_KEY" | python3 -m json.tool | grep -A 1 '"name"' | grep 'models/' | sed 's/.*"models\///' | sed 's/",$//'
