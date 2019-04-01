// require all test files
// const testsContext = require.context('./', true, /specs\/.+\.spec$/)
const testsContext = require.context('./', true, /specs\/.+\.test\.js$/)
testsContext.keys().forEach(testsContext)
