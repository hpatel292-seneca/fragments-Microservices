# tests/integration/post-fragments-json.hurl
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

file,file.png;

HTTP/1.1 201
[Asserts]
header "Location" matches /^http:\/\/localhost:8080\/v1\/fragments\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
jsonpath "$.fragment.ownerId" matches /^[0-9a-fA-F]+$/
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "image/png"

# Capture the location header 
[Captures]
uri: header "Location"

# 2. Try to the get the above posted fragment by using uri.
GET {{uri}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/png

[Asserts]
file,file.png;
