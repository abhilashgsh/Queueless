import sys
import os
import traceback
sys.path.append(os.path.join(os.path.abspath('.'), 'backend'))

try:
    from app.main import app
    print("Success! App loaded.")
except Exception as e:
    print("App Loading Error:")
    traceback.print_exc()
