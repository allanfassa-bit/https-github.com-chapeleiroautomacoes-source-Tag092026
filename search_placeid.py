import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://www.google.com/search?q=Sui%C3%A7a+Panificadora+Marilia+Rua+dos+Bancarios"
req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        html = response.read().decode('utf-8', errors='ignore')
        # Search for ChIJ followed by 23 alphanumeric or hyphen/underscore chars
        matches = re.findall(r'ChIJ[a-zA-Z0-9_\-]{23}', html)
        if matches:
            print("Found Place IDs:", set(matches))
        else:
            print("No Place ID found in search HTML.")
except Exception as e:
    print("Error:", e)
