import requests
from bs4 import BeautifulSoup
import json

url = "https://ratings.fide.com/profile/55620590"

page = requests.get(url)
soup = BeautifulSoup(page.text, "html.parser")

ratings = soup.find_all("td", class_="profile-top-rating-data")

standard = ratings[0].text.strip()
rapid = ratings[1].text.strip()
blitz = ratings[2].text.strip()

data = {
    "standard": standard,
    "rapid": rapid,
    "blitz": blitz
}

with open("fide.json", "w") as f:
    json.dump(data, f, indent=2)

print("ratings updated")
