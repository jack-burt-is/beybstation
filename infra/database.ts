export const table = new sst.aws.Dynamo("BeybstationTable", {
  fields: {
    pk: "string",
    sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
});
