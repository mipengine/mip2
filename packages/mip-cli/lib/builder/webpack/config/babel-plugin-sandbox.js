/**
 * @file babel-plugin-sandbox.js
 * @author clark-t (clarktanglei@163.com)
 */

const sandboxItems = ['window', 'document'];
const sandboxWindowSubItems = [
    'alert',
    'close',
    'confirm',
    'prompt',
    'eval',
    'setTimeout',
    'setInterval',
    'self',
    'top',
    'opener',
    'parent',
    'customElement',
    'customElements'
];

const specials = [
    'eval'
];

let sandbox = Object.assign(
    sandboxItems.reduce((obj, key) => {
        obj[key] = `MIP.sandbox.${key}`;
        return obj;
    }, {}),
    sandboxWindowSubItems.reduce((obj, key) => {
        obj[key] = `MIP.sandbox.window.${key}`;
        return obj;
    }, {})
);

let sandboxKeys = [
    ...sandboxItems,
    ...sandboxWindowSubItems
    // ...sandboxDocumentSubItems
];

module.exports = function ({types: t}) {
    return {
        visitor: {
            Identifier(path, state) {
                let nodeName = path.node.name;

                if (sandboxKeys.indexOf(nodeName) === -1) {
                    return;
                }

                if (t.isMemberExpression(path.parent)) {
                    if (path.parent.property === path.node) {
                        return;
                    }
                }

                if (!path.scope.hasBinding(nodeName)
                    || specials.indexOf(nodeName) > -1
                ) {
                    path.replaceWithSourceString(sandbox[nodeName]);
                }
            }
        }
    };
};
