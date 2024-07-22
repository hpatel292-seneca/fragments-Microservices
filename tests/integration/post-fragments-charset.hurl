# tests/integration/post-fragments-charset.hurl
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
`This is a fragment!`

HTTP/1.1 201
[Captures]
uri: header "Location"

# 2 get the fragment based on the uri
GET {{uri}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
