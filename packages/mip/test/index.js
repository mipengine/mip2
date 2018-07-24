// require all test files
const testsContext = require.context('./', true, /specs\/.+\.spec$/)
testsContext.keys().forEach(testsContext)
