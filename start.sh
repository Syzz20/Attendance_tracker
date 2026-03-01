#!/bin/bash
echo "Starting Club Attendance Tracker..."
echo ""
echo "Once started, open your browser and go to:"
echo "  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""
node "$(dirname "$0")/server.js"
