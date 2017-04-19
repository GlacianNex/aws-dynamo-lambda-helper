# aws-dynamo-helper

Helper library designed to reduce amount of code needed to work with DynamoDB.

## Motivation

Working with DynamoDB has always been a pain. Even with new docClient from Amazon you still need quite a bit of code to perform simple operations. Lack of support for promises is another issue. I wanted to have a simple to use library that abstracted away a lot of boiler plate code.

## Usage

### DynamoDB Expressions

This library expects that you know how to write DynamoDB expressions. If you don't you can get familiar with them [here](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html#Expressions.OperatorsAndFunctions.Syntax). Many methods will expect to get expression name and value maps, if you are not familiar why here are some references: [name maps](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html) and [value maps](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeValues.html).

All both attrbiutes will follow the same format in both cases.

#### Expression Example

`const expression = ':name = #value1 AND :year = #value2';`

#### Name Map - Example

` const nameMap = {
    ':name' : 'firstName',
    ':year' : 'makeYear'
};`

#### Value Map - Example

` const valueMap = {
    '#value1' : 'john',
    '#value2' : 1990
};`

### Constructor

``` js
const Dynamo = require('aws-dynamo-helper');
const db = new Dynamo(region, profile);
```

* awsRegion - region in which your DynamoDB is located, default: `process.env.AWS_DEFAULT_REGION`. *(optional)*
* profile - profile that will be used to get your AWS credentials. If none provided aws-sdk will follow its default chain to get credentials from your environment. *(optional)*

### Methods

Library supports following operations.

#### get

`db.get(tableName, hashAndRange)`

Fetches record from DynamoDB.

* tableName - name of the table *(required)*
* hashAndRange - is an object that follows format: `{ hashName: 'hashValue', rangeName : 'rangeValue'}`. If your table does not have range, ommit it. *(required)*

Example:

``` js
db.get('sampleTable', {
    patientId: '1',
    timestamp: 123456789
})
```

#### query

`db.query(tableName, keyExpression, filterExpression, nameMap, valueMap)`

Queries DynamoDB for a set of records that match specified pattern.

* tableName - name of the table *(required)*
* keyExpression - expression that will be used to filter your Key (hash and range) attributes.  **Query operation requires descrimination on key attributes** *(required)*
* filterExpression - expression that will be used to filter your non-Keys attributes *(optional)*
* nameMap - attribute name map that will map attributes used in key and filter expressions to proper names *(required)*
* valueMap - value map that will map values used in key and filter expressions to proper values *(required)*

Example:

``` js
db.query('sampleTable', ':name = #name', ':yr = #yr', { ':name' : 'firstName', ':yr' : 'makeYear'}, {'#yr' : 1990, '#name': 'john'}).
then((items) => {
    items.forEach((item) => console.log(item));
)}
```

#### update

`db.update(tableName, hashAndRange, updateExp, expNames, expValues)`

Updates a specific record in a table using update expression.

* tableName - name of the table *(required)*
* hashAndRange - is an object that follows format: `{ hashName: 'hashValue', rangeName : 'rangeValue'}`. If your table does not have range, ommit it. *(required)*
* updateExp - expression that will be used to update the record*(required)*
* expNames - attribute name map that will map attributes used in update expression to proper names *(required)*
* expValues - value map that will map values used in update expression to proper values *(required)*

Example:

``` js
db.update('sampleTable', { name: 'john' }, ':yr = #yr', { ':yr' : 'makeYear'}, {'#yr' : 1995}).
then(() => {
    console.log('success');
)}
```

#### delete

`db.delete(tableName, hashAndRange, conditionExp, expNames, expValues)`

Deletes a specific record or multiple records **(that share same hash)** in a table that match a conditional expression.

* tableName - name of the table *(required)*
* hashAndRange - is an object that follows format: `{ hashName: 'hashValue', rangeName : 'rangeValue'}`. If your table does not have range or you want to delete multiple items that share the same hash, ommit it. *(required)*
* conditionExp - expression that will be used to verify that record qualifies for deletion*(optional)*
* expNames - attribute name map that will map attributes used in condition expression to proper names *(optional)*
* expValues - value map that will map values used in condition expression to proper values *(optional)*

Example:

``` js
db.delete('sampleTable', { name: 'john' }, ':yr > #yr', { ':yr' : 'makeYear'}, {'#yr' : 1995}).
then((items) => {
    items.forEach((item) => console.log(`item deleted: ${item}`));
)}
```

#### store

`db.get(tableName, recordObj)`

Stores a single item into a table.

* tableName - name of the table *(required)*
* recordObject - object that you want to store, it must have proper hash and range keys set. *(required)*

Example:

``` js
db.store('sampleTable', {
    name: 'john',
    makeYear: 1989,
    taste: 'crappy'
})
```

## Conlusion

I hope this library is helpful! For any questions or comments feel free to reach out to me via GitHub [@glaciannex](https://github.com/GlacianNex).