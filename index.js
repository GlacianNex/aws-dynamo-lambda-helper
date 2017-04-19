'use strict';

const AWS = require('aws-sdk');
const Q = require('q');

class Dynamo {
  constructor(awsRegion, profile) {
    const region = awsRegion || process.env.AWS_DEFAULT_REGION;
    const params = {
      region,
    };

    if (profile) {
      const SharedIniFileCredentials = AWS.SharedIniFileCredentials;
      params.credentials = new SharedIniFileCredentials({
        profile,
      });
    }

    this.docClient = new AWS.DynamoDB.DocumentClient(params);
  }

  get(tableName, hashAndRange) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      Key: hashAndRange,
    };

    this.docClient.get(params, (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data.Item);
      }
    });

    return deferred.promise;
  }

  query(tableName, keyExp, filterExp, nameMap, valueMap) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyExp,
      FilterExpression: filterExp,
      ExpressionAttributeValues: valueMap,
      ExpressionAttributeNames: nameMap,
      ScanIndexForward: false,
    };

    this.docClient.query(params, (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data.Items);
      }
    });

    return deferred.promise;
  }

  update(tableName, hashAndRange, updateExp, expNames, expValues) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      Key: hashAndRange,
      UpdateExpression: updateExp,
      ExpressionAttributeValues: expValues,
      ExpressionAttributeNames: expNames,
    };

    this.docClient.update(params, (err) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  }

  delete(tableName, hashAndRange, conditionExp, expNames, expValues) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      ConditionExpression: conditionExp,
      ExpressionAttributeNames: expNames,
      ExpressionAttributeValues: expValues,
      Key: hashAndRange,
    };

    this.docClient.delete(params, (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data.Items);
      }
    });

    return deferred.promise;
  }

  store(tableName, record) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      Item: record,
    };

    this.docClient.put(params, (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data);
      }
    });

    return deferred.promise;
  }
}

module.exports = Dynamo;
