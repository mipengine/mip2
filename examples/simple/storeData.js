(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.storeData = factory();
    }
}(this, function () {
    return {
        modules: {
            test: {
                namespaced: true,
                state() {
                    return {
                        count: 47
                    };
                },
                mutations: {
                    addCount(state) {
                        state.count += 1;
                    }
                }
            }
        }
    };
}));
