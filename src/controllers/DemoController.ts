import { APIGatewayProxyResult } from 'aws-lambda';

const ALLOWED_ORIGIN = '*';

/**
 * @description This is the controller, or entrypoint for your function.
 */
export async function handler(event: any, context: any): Promise<APIGatewayProxyResult> {
  // If you want data from your authorizer
  // const data = event.requestContext.authorizer.stringKey;

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      Vary: 'Origin'
    },
    body: JSON.stringify('This is the secured demo function responding')
  };
}
