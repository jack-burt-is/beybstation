import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let _client: DynamoDBDocumentClient | null = null;

export function getDb(): DynamoDBDocumentClient {
  if (_client) return _client;

  const ddbClient = new DynamoDBClient({});
  _client = DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: { removeUndefinedValues: true },
  });
  return _client;
}

export function tableName(): string {
  const name = process.env["TABLE_NAME"];
  if (!name) throw new Error("TABLE_NAME is not set");
  return name;
}
