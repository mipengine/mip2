/**
 * @file deps.js
 * @author huanghuiquan (huanghuiquan@baidu.com)
 */

// Record watcher id, avoid add repeatly
let uid = 0;

class Deps {
    constructor() {
        this.subs = [];
        this.id = uid++;
    }

    addWatcher() {
        Deps.target.addWatcher(this);
    }

    notify() {
        this.subs.forEach(function (sub) {
            sub.update();
        });
    }

    update(watcher) {
        watcher && watcher.update && watcher.update();
    }
}

export default Deps;
