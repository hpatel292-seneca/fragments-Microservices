# tests/integration/post-fragments-unsupported-type.hurl
POST http://localhost:8080/v1/fragments
Content-Type: abc/def
[BasicAuth]
user1@email.com:password1
#Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
`This is a fragment!`

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
#jsonpath "$.error.message" == "Unsupported Content-Type"
