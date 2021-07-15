# Lambda Authorizer (JWT) demo

Basic demonstration of authorizing a JWT with a Lambda Authorizer. The authorizer function (`AuthController`) "guards" the actual business function (`DemoController`). They are deployed into an API Gateway.

This project uses the Client Credentials flow for machine-to-machine communication.

Deploys with Serverless Framework.

## Prerequisites

- Authentication/Authorization service like [Auth0](https://auth0.com) (if using it, create both a machine-to-machine "application" and an "API" that accepts the MTM app)
- You have set the environment variables (`JWKS_URI` is required; `AUDIENCE` and `ISSUER` are optional) in `serverless.yml`
- An AWS account
- Logged into AWS in your environment

## Instructions

- Clone the repo
- `npm install` to install dependencies
- `npm run deploy` to deploy to AWS

## Endpoint

### Request

Headers:

- `Content-Type`: `application/json`
- `Authorization`: `Bearer {{ACCESS_TOKEN}}`

In the case of Auth0, you'd pass the token you get from calling your application (URL like https://{{ID}}-{{RANDOM_ID}}.{{REGION}}.auth0.com/oauth/token)

```
POST {url}/{stage}/demo
{}
```

### Response

`"This is the secured demo function responding"`

## References

- [Auth0: Client Credentials Exchange](https://auth0.com/docs/hooks/extensibility-points/client-credentials-exchange)
- [Auth0: Client Credentials Flow](https://auth0.com/docs/flows/client-credentials-flow)
