const assert = require('chai').assert;
const DynamoDB = require('./../index.js');

describe('Constructor', () => {
  it('local', () => {
    const region = 'test-region';
    const profile = 'test-profile';
    const db = new DynamoDB(region, profile);
    assert.equal(db.docClient.service.config.region, region);
    assert.equal(db.docClient.service.config.credentials.profile, profile);
  });

  it('remote', () => {
    process.env.AWS_DEFAULT_REGION = 'test-region';
    const db = new DynamoDB();
    assert.equal(db.docClient.service.config.region, process.env.AWS_DEFAULT_REGION);
  });
});
