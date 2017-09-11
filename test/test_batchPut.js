const assert = require('chai').assert;
const sinon = require('sinon');
const DynamoDB = require('./../index.js');

describe('BatchPut', () => {
  const tableName = 'testTable';
  const testItem1 = {
    test: 'abc',
    number: 123456789
  };
  const testItem2 = {
    test: 'abc-1',
    number: 123456789,
    list: ['a', 'b', 'c']
  };

  const expPayload = { RequestItems: {} };
  expPayload.RequestItems[tableName] = [{ PutRequest: { Item: testItem1 } }, { PutRequest: { Item: testItem2 } }];

  it('success', () => {
    const db = new DynamoDB();
    const getStub = sinon.stub(db.docClient, 'batchWrite');
    getStub.callsArgWith(1, null);

    return db.batchPut(tableName, [testItem1, testItem2]).then(() => {
      getStub.calledWith(expPayload);
      assert(getStub.calledOnce);
    });
  });

  it('error', () => {
    const db = new DynamoDB();
    const awsError = new Error('AWS Error');
    const getStub = sinon.stub(db.docClient, 'batchWrite');
    getStub.callsArgWith(1, awsError, null);

    return db
      .batchPut(tableName, [testItem1, testItem2])
      .then(() => {
        throw new Error('Expected error to be  thrown');
      })
      .catch(err => {
        assert(getStub.calledOnce);
        getStub.calledWith(expPayload);
        assert.equal(err, awsError);
      });
  });
});
