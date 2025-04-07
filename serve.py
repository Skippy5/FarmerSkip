#!/usr/bin/env python
"""
Simple HTTP Server for Farmer Skip's Eggcellent Adventure

This script serves the game files using Python's built-in HTTP server.
It works with both Python 2 and Python 3.
"""

import sys
import os

try:
    # Python 3
    from http.server import HTTPServer, SimpleHTTPRequestHandler
    python_version = 3
except ImportError:
    # Python 2
    from SimpleHTTPServer import SimpleHTTPRequestHandler
    from SocketServer import TCPServer as HTTPServer
    python_version = 2

# Define port
PORT = 8000

# Change to the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

# Create and run server
httpd = HTTPServer(("", PORT), SimpleHTTPRequestHandler)

print(f"Python {python_version} HTTP Server running at http://localhost:{PORT}")
print("Open your browser and navigate to http://localhost:8000 to play Farmer Skip's Eggcellent Adventure!")
print("Press Ctrl+C to stop the server")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
    httpd.server_close()
    sys.exit(0) 