# tests/integration/lab-9-s3.hurl
# 1. Post a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
`Hello S3!`

HTTP/1.1 201
# Capture the location header 
[Captures]
uri: header "Location"

# 2. Try to get the above posted fragment
GET {{uri}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 9
[Asserts]
body == "Hello S3!"

# 3. Delete the above posted fragment
DELETE {{uri}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 4. Try to get the above deleted fragment
GET {{uri}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
