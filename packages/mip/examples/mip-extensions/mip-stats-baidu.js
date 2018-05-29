/**
 * @file mip-image
 * @author sfe
 */

/* global mip */

mip.registerVueCustomElement('mip-stats-baidu', {
    template: `
        <div>
            <slot></slot>
        </div>
    `,
    props: {
        src: String,
        alt: String
    }
});
