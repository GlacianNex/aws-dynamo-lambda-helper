const assert = require('chai').assert;
const sinon = require('sinon');
const DynamoDB = require('./../index.js');

describe('Store', () => {
  const tableName = 'testTable';
  const storedObject = {
    name: 'john',
    yr: 1990,
  };

  it('success', (done) => {
    const db = new DynamoDB();
    const putStub = sinon.stub(db.docClient, 'put');
    putStub.callsArgWith(1, null, null);
    db.store(tableName, storedObject)
    .then((data) => {
      assert.equal(data, null);
      putStub.calledWith({
        TableName: tableName,
        Item: storedObject,
      });
      assert(putStub.calledOnce);
      done();
    })
    .catch(err => done(err));
  });

  it('error', (done) => {
    const db = new DynamoDB();
    const awsError = new Error('AWS Error');
    const putStub = sinon.stub(db.docClient, 'put');
    putStub.callsArgWith(1, awsError, null);

    db.store(tableName, storedObject)
    .then(() => {
      done('Expected error to be  thrown');
    })
    .catch((err) => {
      assert(putStub.calledOnce);
      putStub.calledWith({
        TableName: tableName,
        Item: storedObject,
      });
      assert.equal(err, awsError);
      done();
    });
  });
});
