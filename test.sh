#!/bin/bash
curl -X POST https://forgeforward.app/api/dns-query \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "google.com",
    "nameserver": "8.8.8.8",
    "record_type": "A"
  }'
