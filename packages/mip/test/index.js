// require all test files
const testsContext = require.context('./', true, /specs\/(?!page).+\.spec$/)
testsContext.keys().forEach(testsContext)
