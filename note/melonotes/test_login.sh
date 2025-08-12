#!/bin/bash

# Login and get token
echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"frieren\",\"password\":\"MeldaErkan!5352\"}" | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful, token: ${TOKEN:0:20}..."

# Get notes
echo ""
echo "📝 Getting notes..."
NOTES=$(curl -s "http://localhost:5001/api/notes" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Notes retrieved:"
echo "$NOTES" | grep -o '"title":"[^"]*"' | head -3

# Get first note ID
NOTE_ID=$(echo "$NOTES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$NOTE_ID" ]; then
  echo ""
  echo "🔍 Getting details for note ID: $NOTE_ID"
  
  NOTE_DETAILS=$(curl -s "http://localhost:5001/api/notes/$NOTE_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "✅ Note details retrieved:"
  echo "Scripts count: $(echo "$NOTE_DETAILS" | grep -o '"scripts":\[[^]]*\]' | grep -o '"title":' | wc -l | tr -d ' ')"
  echo "Code snippets count: $(echo "$NOTE_DETAILS" | grep -o '"codeSnippets":\[[^]]*\]' | grep -o '"title":' | wc -l | tr -d ' ')"
  echo "Solutions count: $(echo "$NOTE_DETAILS" | grep -o '"solutions":\[[^]]*\]' | grep -o '"plan_type":' | wc -l | tr -d ' ')"
fi