const isInLambda = !!process.env.LAMBDA_TASK_ROOT;

if (isInLambda) {
    module.exports = require('./prod')
} else {
    module.exports = require('./dev')
}