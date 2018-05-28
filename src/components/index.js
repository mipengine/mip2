/**
 * @file index.js Builtins register
 * @author zhangzhiqiang(zhiqiangzhang37@163.com)
 */

import MipImg from './mip-img';
import MipVideo from './mip-video';
import MipCarousel from './mip-carousel';
import MipIframe from './mip-iframe';
import MipPix from './mip-pix';
import MipBind from './mip-bind/bind';
import registerElement from '../register-element';

export default {

    /**
     * Register the builtin components.
     */
    register() {
        registerElement('mip-pix', MipPix);
        registerElement('mip-img', MipImg);
        registerElement('mip-carousel', MipCarousel);
        registerElement('mip-iframe', MipIframe);
        registerElement('mip-video', MipVideo);
        // registerElement('mip-bind', MipBind);
        new MipBind();
    }
};
