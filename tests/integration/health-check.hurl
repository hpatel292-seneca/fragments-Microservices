GET http://localhost:8080

HTTP/1.1 200
Cache-Control: no-cache
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.author" isString
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/

#HTTP/1.1 200 OK
#Cache-Control: no-cache
#Content-Type: application/json; charset=utf-8
#{"status":"ok","author":"David Humphrey","githubUrl":"https://github.com/humphd/fragments","version":"0.5.3"}
