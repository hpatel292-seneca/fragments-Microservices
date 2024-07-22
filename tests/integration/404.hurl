GET http://localhost:8080/no-such-route

HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
jsonpath "#.error.code" == "404"
jsonpath "#.error.message" == "Not found"


#{"status":"error","error":{"code":404,"message":"Not Found"}}
