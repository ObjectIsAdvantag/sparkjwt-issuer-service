# Web API Resource that generate JWT tokens for Cisco Spark App Id

Note: You'll need a developer organization and secret to use this API


```
POST https://sparkjwt.herokuapp.com/jwt/issuer
{
    "appid" : "",
    "secret": "",
    "userid" : "",
    "username" : ""
}
```

returns a 'plain/txt' string containing the JWT issuer token

```
(435353)
``` 

This JWT issuer token can be used to fetch Cisco Spark API access tokens.
These access tokens last 6 hours, and act under the identity of the specified Guest user (userid/username) specified above.

```
POST http://api.ciscospark.com/v1/jwt/login
Authorization: <jwt-issuer-token>
```

returns an access token (with a JWT format)

See the [sparkjwt](https://github.com/ObjectIsAdvantag/sparkjwt) command line utility for more details