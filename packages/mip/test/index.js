// require all test files
const testsContext = require.context('./', true, /specs\/.+\.spec$/)
// const testsContext = require.context('./', true, /specs\/components\/mip-shell\.spec$/)
testsContext.keys().forEach(testsContext)
