const assert = require('chai').assert;
const sinon = require('sinon');
const DynamoDB = require('./../index.js');

describe('Delete', () => {
  const tableName = 'testTable';
  const keyHash = {
    name: 'john',
  };
  const filterExp = '#yr = :yrVal';
  const nameMap = {
    '#yr': 'yr',
  };
  const valueMap = {
    ':yr': 1990,
  };

  it('success', (done) => {
    const db = new DynamoDB();
    const deletedItems = [{ name: 'john', yr: 1990 }];
    const deleteStub = sinon.stub(db.docClient, 'delete');
    deleteStub.callsArgWith(1, null, { Items: deletedItems });

    db.delete(tableName, keyHash, filterExp, nameMap, valueMap)
    .then((data) => {
      assert.equal(data, deletedItems);
      const expectedParams = {
        TableName: tableName,
        ConditionExpression: filterExp,
        ExpressionAttributeNames: nameMap,
        ExpressionAttributeValues: valueMap,
        Key: keyHash,
      };

      deleteStub.calledWith(expectedParams);
      assert(deleteStub.calledOnce);
      done();
    });
  });

  it('error', (done) => {
    const db = new DynamoDB();
    const awsError = new Error('AWS Error');
    const deleteStub = sinon.stub(db.docClient, 'delete');
    deleteStub.callsArgWith(1, awsError, null);

    db.delete(tableName, keyHash, filterExp, nameMap, valueMap)
    .then(() => {
      done('Expected error to be  thrown');
    })
    .catch((err) => {
      const expectedParams = {
        TableName: tableName,
        ConditionExpression: filterExp,
        ExpressionAttributeNames: nameMap,
        ExpressionAttributeValues: valueMap,
        Key: keyHash,
      };

      deleteStub.calledWith(expectedParams);
      assert(deleteStub.calledOnce);
      assert.equal(err, awsError);
      done();
    });
  });
});
