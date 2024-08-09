# 1. Post a image/png fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png

[BasicAuth]
user1@email.com:password1

file,file.png;

HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/png"

[Captures]
url: header "Location"

# 2. Try to convert the png fragment to jpeg.
GET {{url}}.jpg

[BasicAuth]
user1@email.com:password1

HTTP 200

[Asserts]
header "Content-Type" == "image/jpeg"
