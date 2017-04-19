const assert = require('chai').assert;
const sinon = require('sinon');
const DynamoDB = require('./../index.js');

describe('Query', () => {
  const tableName = 'testTable';
  const keyExpression = '#name = :nameVal';
  const filterExp = '#yr = :yrVal';
  const nameMap = {
    '#name': 'name',
    '#yr': 'yr',
  };
  const valueMap = {
    ':nameVal': 'john',
    ':yr': 1990,
  };

  it('success', (done) => {
    const db = new DynamoDB();
    const itemVal = [{ name: 'john', yr: 1990 }];
    const queryStub = sinon.stub(db.docClient, 'query');
    queryStub.callsArgWith(1, null, { Items: itemVal });

    db.query(tableName, keyExpression, filterExp, nameMap, valueMap)
    .then((data) => {
      assert.equal(data, itemVal);
      const expectedParams = {
        TableName: tableName,
        KeyConditionExpression: keyExpression,
        FilterExpression: filterExp,
        ExpressionAttributeValues: valueMap,
        ExpressionAttributeNames: nameMap,
        ScanIndexForward: false,
      };

      queryStub.calledWith(expectedParams);
      assert(queryStub.calledOnce);
      done();
    });
  });

  it('error', (done) => {
    const db = new DynamoDB();
    const awsError = new Error('AWS Error');
    const queryStub = sinon.stub(db.docClient, 'query');
    queryStub.callsArgWith(1, awsError, null);

    db.query(tableName, keyExpression, filterExp, nameMap, valueMap)
    .then(() => {
      done('Expected error to be  thrown');
    })
    .catch((err) => {
      const expectedParams = {
        TableName: tableName,
        KeyConditionExpression: keyExpression,
        FilterExpression: filterExp,
        ExpressionAttributeValues: valueMap,
        ExpressionAttributeNames: nameMap,
        ScanIndexForward: false,
      };

      queryStub.calledWith(expectedParams);
      assert(queryStub.calledOnce);
      assert.equal(err, awsError);
      done();
    });
  });
});
