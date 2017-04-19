const assert = require('chai').assert;
const sinon = require('sinon');
const DynamoDB = require('./../index.js');

describe('Get', () => {
  const tableName = 'testTable';
  const keyRange = {
    hashName: 'name',
    rangeName: 'range',
  };

  it('success', (done) => {
    const db = new DynamoDB();
    const itemVal = 'success';
    const getStub = sinon.stub(db.docClient, 'get');
    getStub.callsArgWith(1, null, { Item: itemVal });

    db.get(tableName, keyRange)
    .then((data) => {
      assert.equal(data, itemVal);
      getStub.calledWith({
        TableName: tableName,
        Key: keyRange,
      });
      assert(getStub.calledOnce);
      done();
    });
  });

  it('error', (done) => {
    const db = new DynamoDB();
    const awsError = new Error('AWS Error');
    const getStub = sinon.stub(db.docClient, 'get');
    getStub.callsArgWith(1, awsError, null);

    db.get(tableName, keyRange)
    .then(() => {
      done('Expected error to be  thrown');
    })
    .catch((err) => {
      assert(getStub.calledOnce);
      getStub.calledWith({
        TableName: tableName,
        Key: keyRange,
      });
      assert.equal(err, awsError);
      done();
    });
  });
});
