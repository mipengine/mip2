/**
 * @file mip-image
 * @author sfe
 */

/* global mip */

mip.registerVueCustomElement('mip-ad', {
    template: `
        <div>
            <slot></slot>
        </div>
    `,
    props: {
        name: String
    }
});
