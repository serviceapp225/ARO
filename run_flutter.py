#!/usr/bin/env python3
import subprocess
import os
import sys

def run_flutter_app():
    os.chdir('autoauction_flutter')
    
    # Enable web support
    subprocess.run(['flutter', 'config', '--enable-web'], check=True)
    
    # Clean and get dependencies
    subprocess.run(['flutter', 'clean'], check=True)
    subprocess.run(['flutter', 'pub', 'get'], check=True)
    
    # Build and run for web
    try:
        subprocess.run(['flutter', 'run', '-d', 'web', '--web-port=5002', '--web-hostname=0.0.0.0'], check=True)
    except subprocess.CalledProcessError:
        # Fallback to desktop if web is not available
        print("Web not available, running on desktop...")
        subprocess.run(['flutter', 'run', '-d', 'linux', '--release'], check=True)

if __name__ == "__main__":
    run_flutter_app()