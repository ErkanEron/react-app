#!/bin/bash

# Login and get token
echo "🔐 Getting detailed note data..."
TOKEN=$(curl -s -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"frieren\",\"password\":\"MeldaErkan!5352\"}" | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Token obtained"

# Get detailed info for note ID 1 (MELO İÇİN ÖZEL note)
echo ""
echo "🔍 Getting details for MELO note (ID: 1)..."

NOTE_DETAILS=$(curl -s "http://localhost:5001/api/notes/1" \
  -H "Authorization: Bearer $TOKEN")

echo "Raw response (first 500 chars):"
echo "$NOTE_DETAILS" | cut -c1-500

echo ""
echo "Checking specific fields:"
echo "Has scripts: $(echo "$NOTE_DETAILS" | grep -c '"scripts"')"
echo "Has codeSnippets: $(echo "$NOTE_DETAILS" | grep -c '"codeSnippets"')"
echo "Has solutions: $(echo "$NOTE_DETAILS" | grep -c '"solutions"')"

# Check if the response is complete
echo ""
echo "Response size: $(echo "$NOTE_DETAILS" | wc -c) characters"