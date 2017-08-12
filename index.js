const AWS = require('aws-sdk');
const Q = require('q');
const merge = require('deepmerge');
const unmarshalJson = require('dynamodb-marshaler/unmarshalJson');

class Dynamo {
  constructor(awsRegion, profile) {
    const region = awsRegion || process.env.AWS_DEFAULT_REGION;
    const params = { region };

    if (profile) {
      const SharedIniFileCredentials = AWS.SharedIniFileCredentials;
      params.credentials = new SharedIniFileCredentials({ profile });
    }

    this.eventsFn = {
      INSERT: () => Q(),
      MODIFY: () => Q(),
      REMOVE: () => Q()
    };

    this.docClient = new AWS.DynamoDB.DocumentClient(params);
  }

  process(event) {
    const fullRecord = Dynamo._createFullRecord(event);
    const fn = this.eventsFn[event.eventName];
    let chain = Q.defer();
    chain.reject(new Error(`Unexpected event: ${this.eventType}`));
    chain = chain.promise;
    if (fn) {
      chain = fn(fullRecord).catch(err => {
        throw err;
      });
    }
    return chain;
  }

  onInsert(method) {
    this.eventsFn.INSERT = method;
  }

  onUpdate(method) {
    this.eventsFn.MODIFY = method;
  }

  onRemove(method) {
    this.eventsFn.REMOVE = method;
  }

  get(tableName, hashAndRange) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      Key: hashAndRange
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

  query(tableName, keyExp, filterExp, nameMap, valueMap, scanForward, limit) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyExp,
      FilterExpression: filterExp,
      ExpressionAttributeValues: valueMap,
      ExpressionAttributeNames: nameMap,
      ScanIndexForward: scanForward || false,
      Limit: limit
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
      ExpressionAttributeNames: expNames
    };

    this.docClient.update(params, err => {
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
      Key: hashAndRange
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
      Item: record
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

  batchPut(tableName, records) {
    const params = { RequestItems: {} };

    params.RequestItems[tableName] = [];
    records.forEach(record => {
      const request = { PutRequest: { Item: record } };
      params.RequestItems[tableName].push(request);
    });

    return this._batchWrite(params);
  }

  static _createFullRecord(event) {
    let fullRecord;
    if (event.dynamodb.OldImage) {
      fullRecord = JSON.parse(unmarshalJson(event.dynamodb.OldImage));
      if (event.dynamodb.NewImage) {
        const updatedFields = JSON.parse(unmarshalJson(event.dynamodb.NewImage));
        fullRecord = merge(fullRecord, updatedFields);
      }
    } else {
      fullRecord = JSON.parse(unmarshalJson(event.dynamodb.NewImage));
    }

    return fullRecord;
  }

  scan(tableName, filterExp, nameMap, valueMap, limit) {
    const deferred = Q.defer();
    const params = {
      TableName: tableName,
      FilterExpression: filterExp,
      ExpressionAttributeValues: valueMap,
      ExpressionAttributeNames: nameMap,
      Limit: limit
    };

    this.docClient.scan(params, (err, data) => {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(data.Items);
      }
    });

    return deferred.promise;
  }

  eraseAll(tableName, keyName, rangeName) {
    return this.scan(tableName)
      .then(items => {
        const deleteRequests = items.map(item => {
          const keyItem = {};
          keyItem[keyName] = item[keyName];
          keyItem[rangeName] = item[rangeName];
          return { DeleteRequest: { Key: keyItem } };
        });

        const params = { RequestItems: {} };
        params.RequestItems[tableName] = deleteRequests;
        params.ReturnConsumedCapacity = 'TOTAL';
        return params;
      })
      .then(params => {
        const deferred = Q.defer();
        const response = {
          deleted: 0,
          unprocessed: 0
        };
        if (params.RequestItems[tableName].length > 0) {
          this.docClient.batchWrite(params, (err, data) => {
            if (err) {
              deferred.reject(err);
            } else {
              response.deleted = data.ConsumedCapacity[0].CapacityUnits;
              response.unprocessed = Object.keys(data.UnprocessedItems).length;
              deferred.resolve(response);
            }
          });
        } else {
          deferred.resolve(response);
        }
        return deferred.promise;
      });
  }

  _batchWrite(params) {
    const deferred = Q.defer();
    this.docClient.batchWrite(params, (err, data) => {
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
