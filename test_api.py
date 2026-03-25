import urllib.request
import urllib.error

try:
    resp = urllib.request.urlopen("http://127.0.0.1:8000/orders/user/user123")
    print(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError {e.code}:")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
