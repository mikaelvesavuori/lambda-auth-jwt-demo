import { APIGatewayProxyResult } from 'aws-lambda';

import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const JWKS_URI = process.env.JWKS_URI || '';
const AUDIENCE = process.env.AUDIENCE || '';
const ISSUER = process.env.ISSUER || '';
if (!JWKS_URI) throw new Error('Missing required environment values!');

const ALLOWED_ORIGIN = '*';

/**
 * @description The controller.
 */
export async function handler(event: any): Promise<APIGatewayProxyResult> {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        Vary: 'Origin'
      },
      body: JSON.stringify('OK')
    } as APIGatewayProxyResult;
  }

  const token = getToken(event) || '';
  const isTokenValid = await validateToken(token);

  const policy = isTokenValid ? 'Allow' : 'Deny';
  console.log(`Is user token valid? ${isTokenValid}`);

  const response = {
    statusCode: isTokenValid ? 200 : 401,
    body: ''
  };

  return generatePolicy('user', policy, event.methodArn, response);
}

/**
 * @description Creates the IAM policy for the response.
 */
const generatePolicy = (principalId: any, effect: string, resource: string, data: any) => {
  // @see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html
  const authResponse: any = {
    principalId
  };

  if (effect && resource) {
    const policyDocument: any = {
      Version: '2012-10-17',
      Statement: []
    };

    const statement = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: resource
    };

    policyDocument.Statement[0] = statement;
    authResponse.policyDocument = policyDocument;
  }

  authResponse.context = {
    stringKey: JSON.stringify(data)
    //role: user.role --> "principalId" could be an object that also has role
  };

  return authResponse;
};

/*********************/
/* JWT functionality */
/*********************/

const keyClient: any = jwksClient({
  cache: true,
  cacheMaxAge: 86400000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: JWKS_URI
});

const verificationOptions: any = {
  algorithms: 'RS256',
  audience: AUDIENCE, // Verify claims
  issuer: ISSUER
};

/**
 * @description Get token from header and clean it.
 */
function getToken(event: any): string | null {
  const clientToken = event.authorizationToken || event.headers.Authorization;
  if (!clientToken) {
    console.error('Missing client token!');
    return null;
  }
  if (clientToken && clientToken.split(' ')[0] === 'Bearer') return clientToken.split(' ')[1];
  else return clientToken;
}

/**
 * @description Validate and verify JWT token.
 */
async function validateToken(token: string): Promise<boolean> {
  const decodedToken: any = jwt.decode(token, { complete: true });
  const kid = decodedToken.header.kid;

  const result: boolean = await new Promise((resolve, reject) => {
    keyClient.getSigningKey(kid, (err: any, key: any) => {
      const signingKey = key.publicKey || key.rsaPublicKey;

      try {
        jwt.verify(token, signingKey, verificationOptions, (error) => {
          if (error) resolve(false);
          else resolve(true);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  });

  return result;
}
