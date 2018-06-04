/**
 * @file easeScroll.js
 * @author tanglei(tanglei02@baidu.com)
 * @description 让页面某个元素在滚动时有过渡效果
 */

export function scrollTop(height, {duration = 500, scroller = window} = {}) {
    let top = height;
    let scrollTop;

    if (scroller && scroller !== window) {
        scrollTop = scroller.scrollTop;
    }
    else {
        // scrollTop = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop)
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    }

    alert(`${top}, ${document.body.scrollTop}, ${document.documentElement.scrollTop}`)

    if (top === scrollTop) {
        return Promise.resolve();
    }

    let rest = top - scrollTop;
    let sign = rest > 0;
    // let duration = Math.abs(rest) / speed * 1000;

    return new Promise(resolve => {
        transition(
            duration,
            t => {
                let delta = Math.ceil(t * rest);
                let toScroll = delta + scrollTop;

                if ((sign && toScroll >= top)
                    || (!sign && toScroll <= top)
                ) {
                    scroll(top, scroller);
                    return false;
                }

                scroll(toScroll, scroller);
                return true;
            },
            () => {
                // 防止滚动过程没滚到位
                scroll(top, scroller);
                resolve();
            }
        );
    });
}

function transition(duration, step, callback) {
    let start = Date.now();

    let rAF = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || function (cb) {
            window.setTimeout(cb, 1000 / 60);
        };

    rAF(loop);

    function loop() {
        let now = Date.now() - start;

        if (step(bezier(now, 0, 1, duration))) {
            rAF(loop);
        }
        else {
            callback();
        }
    }
}

function bezier(t, b, c, d) {
    return 1.0042954579734844 * Math.exp(
            -6.4041738958415664 * Math.exp(-7.2908241330981340 * t / d)
        ) * c + b;
}

function scroll(top, scroller = window) {
    if (scroller === window) {
        window.scrollTo(0, top);
    }
    else {
        scroller.scrollTop = top;
    }
}
