const serverless = require('serverless-http');
const app = require('./app')
const handler = serverless(app)
const mongoose = require('mongoose');
const isInLambda = !!process.env.LAMBDA_TASK_ROOT;

const { dbConnection, db, options } = require('./utils/database-utils');

mongoose.connect(db, options, (err) => dbConnection(err));

const PORT = process.env.PORT || 5000;


if (isInLambda) {
    module.exports.server = async (event, context) => {
    return await handler(event, context);
}  
} else {
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}