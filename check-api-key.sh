#!/bin/bash
API_KEY=$(grep "GOOGLE_AI_API_KEY=" .env.local | cut -d '=' -f2)

echo "🔍 Checking API key status..."
echo ""

# Try a simple API call
response=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$API_KEY")

if echo "$response" | grep -q "\"models\""; then
  echo "✅ API key is valid and working!"
  echo ""
  echo "Available models:"
  echo "$response" | grep -o '"name":"models/[^"]*"' | head -5
else
  echo "❌ API response:"
  echo "$response" | head -20
fi
