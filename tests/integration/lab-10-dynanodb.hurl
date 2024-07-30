# tests.integration.lab-9-s3.hurl
# 1. Post a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
{ "service": "DynamoDB" }

HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# GET fragment info
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
jsonpath "$.fragment.ownerId" matches /^[0-9a-fA-F]+$/
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
# 19 is the length of our fragment data: 'This is a fragment!'
jsonpath "$.fragment.size" == 25

# POST 2nd fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
`DynamoDB is **great**.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"


# GET fragment2 info
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
jsonpath "$.fragment.ownerId" matches /^[0-9a-fA-F]+$/
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"

# GET Fragments
# Make a GET request to get all the fragmenta
GET http://localhost:8080/v1/fragments
# Include authorization header
[BasicAuth]
user1@email.com:password1

# Make sure it returns the expected values
# Status code 200
HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" isCollection
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

# DELETE Fragments

# Make a DELETE request
DELETE {{fragment1_url}}
# Include authorization header
[BasicAuth]
user1@email.com:password1

# Make sure it returns the expected values
# Status code 200
HTTP/1.1 200

# GET Fragments

# Make a GET request to get all the fragmenta
GET {{fragment1_url}}
# Include authorization header
[BasicAuth]
user1@email.com:password1

# Make sure it returns the expected values
# Status code 404
HTTP/1.1 404

# GET Fragments

# Make a GET request to get all the fragmenta
GET http://localhost:8080/v1/fragments
# Include authorization header
[BasicAuth]
user1@email.com:password1

# Make sure it returns the expected values
# Status code 200
HTTP 200

[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}
