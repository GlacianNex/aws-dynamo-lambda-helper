const assert = require('chai').assert;
const sinon = require('sinon');
const DynamoDB = require('./../index.js');

describe('Update', () => {
  const tableName = 'testTable';
  const hashAndRange = {
    name: 'john',
  };
  const updateExp = 'set #yr = :yyyy';
  const expNames = {
    '#yr': 'yr',
  };
  const expValues = {
    ':yyyy': 1991,
  };

  it('success', (done) => {
    const db = new DynamoDB();
    const updateStub = sinon.stub(db.docClient, 'update');
    updateStub.callsArgWith(1, null, null);

    db.update(tableName, hashAndRange, updateExp, expNames, expValues)
    .then((data) => {
      assert.equal(data, null);
      const expectedParams = {
        TableName: tableName,
        Key: hashAndRange,
        UpdateExpression: updateExp,
        ExpressionAttributeValues: expValues,
        ExpressionAttributeNames: expNames,
      };

      updateStub.calledWith(expectedParams);
      assert(updateStub.calledOnce);
      done();
    });
  });

  it('error', (done) => {
    const db = new DynamoDB();
    const awsError = new Error('AWS Error');
    const updateStub = sinon.stub(db.docClient, 'update');
    updateStub.callsArgWith(1, awsError, null);

    db.update(tableName, hashAndRange, updateExp, expNames, expValues)
    .then(() => {
      done('Expected error to be  thrown');
    })
    .catch((err) => {
      const expectedParams = {
        TableName: tableName,
        Key: hashAndRange,
        UpdateExpression: updateExp,
        ExpressionAttributeValues: expValues,
        ExpressionAttributeNames: expNames,
      };

      updateStub.calledWith(expectedParams);
      assert(updateStub.calledOnce);
      assert.equal(err, awsError);
      done();
    });
  });
});
