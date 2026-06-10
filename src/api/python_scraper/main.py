import sys
import json
import re
from curl_cffi import requests
from bs4 import BeautifulSoup

def scrape_taiwan():
    url = "https://eaip.caa.gov.tw/eaip/history/2026-05-14/html/eAIP/RC-GEN-3.3-en-TW.html"
    try:
        response = requests.get(url, impersonate="chrome110", timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        contacts = []
        contacts.append({
            "id": "tw_python_RC_POC",
            "regionCode": "TW",
            "firName": "Taipei FIR (Python)",
            "facilityName": "Python curl_cffi PoC",
            "facilityType": "ACC",
            "aftn": "RCPYTHON",
            "emails": [],
            "sourceUrl": url,
            "verifiedAt": "2026-06-10T00:00:00Z"
        })
        return contacts

    except Exception as e:
        # Return empty list on failure (honest absence)
        return []

def main():
    if len(sys.argv) < 2:
        print(json.dumps([]))
        return

    country = sys.argv[1].upper()
    results = []

    if country == "TAIWAN":
        results = scrape_taiwan()
    
    print(json.dumps(results))

if __name__ == "__main__":
    main()
