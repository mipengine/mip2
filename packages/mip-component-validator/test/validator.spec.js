const validator = require('../src/validator');

validator.validate('../test/mip-demo').then((results) =>{
    console.log(results);
})
