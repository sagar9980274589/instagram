import requests

url = "http://localhost:8000/api/deep-aging/transform"
headers = {"Content-Type": "application/json"}
data = {"embeddings": [float(i) for i in range(1, 129)]}

response = requests.post(url, json=data, headers=headers)

print(response.status_code)
print(response.json())
