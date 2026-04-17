#!/bin/bash
echo "🌱 Seeding database..."
cd backend && node db/seed.js
echo ""
echo "🚀 Starting gateway..."
node index.js
