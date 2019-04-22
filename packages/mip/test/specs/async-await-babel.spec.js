import regeneratorRuntime from 'regenerator-runtime'

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function main() {
  var arr = [];

  function fn() {
    return _fn.apply(this, arguments);
  }

  function _fn() {
    _fn = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return new Promise(function (resolve, reject) {
                arr.push(function () {
                  console.log('a');
                  reject();
                });
              });

            case 3:
              _context.next = 8;
              break;

            case 5:
              _context.prev = 5;
              _context.t0 = _context["catch"](0);
              console.log('c');

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 5]]);
    }));
    return _fn.apply(this, arguments);
  }

  fn();
  return new Promise(function (resolve) {
    arr.push(function () {
      console.log('b');
      resolve();
    });
    arr.forEach(function (item) {
      return item();
    });
  }).then(function () {
    console.log('d');
  });
}

describe('Async Await Babel', function () {
  it('should has no error', main)
})