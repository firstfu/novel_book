
import requests


url = 'https://angelibrary.com/fictions/yuan_zhen_xia/map.html'
response = requests.get(url)
response.encoding = 'big5'

print(response.text)