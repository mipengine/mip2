import event from '../../util/dom/event';
import {MESSAGE_ROUTER_PUSH, MESSAGE_ROUTER_REPLACE, MESSAGE_ROUTER_FORCE} from '../const';

function guardEvent(e, $a) {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
        return;
    }
    // don't redirect when preventDefault called
    // if (e.defaultPrevented) {
    //     return;
    // }
    // don't redirect if `target="_blank"`
    if ($a.getAttribute) {
        const target = $a.getAttribute('target');
        if (/\b_blank\b/i.test(target)) {
            return;
        }
    }
    e.preventDefault();
    return true;
}

export function installMipLink(router, {isRootPage, notifyRootPage}) {
    event.delegate(document, 'a', 'click', function (e) {
        let $a = this;
        let to = $a.getAttribute('href');
        if ($a.hasAttribute('mip-link') || $a.getAttribute('data-type') === 'mip') {
            const location = router.resolve(to, router.currentRoute, false).location;
            if (guardEvent(e, $a)) {
                if ($a.hasAttribute('replace')) {
                    if (isRootPage) {
                        router.replace(location);
                    }
                    else {
                        notifyRootPage({
                            type: MESSAGE_ROUTER_REPLACE,
                            data: {location}
                        });
                    }
                }
                else {
                    if (isRootPage) {
                        router.push(location);
                    }
                    else {
                        notifyRootPage({
                            type: MESSAGE_ROUTER_PUSH,
                            data: {location}
                        });
                    }
                }
            }
        }
        else {
            top.location.href = this.href;
        }
    });
}
