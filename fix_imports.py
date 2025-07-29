#!/usr/bin/env python3
import os
import re

def fix_imports_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace relative imports with absolute imports
    content = re.sub(r'from \.\.database', 'from server.database', content)
    content = re.sub(r'from \.\. import', 'from server import', content)
    content = re.sub(r'from \.\.database\.database', 'from server.database.database', content)
    content = re.sub(r'from serverdatabase', 'from server.database', content)
    content = re.sub(r'from serverdatabase\.database', 'from server.database.database', content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed imports in {filepath}")

# Find all Python files in server/routes
routes_dir = "server/routes"
for filename in os.listdir(routes_dir):
    if filename.endswith('.py'):
        filepath = os.path.join(routes_dir, filename)
        fix_imports_in_file(filepath)

print("All imports fixed!")
