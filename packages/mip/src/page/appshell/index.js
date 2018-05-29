import Header from './header.js';
import Loading from './loading.js';
import {DEFAULT_SHELL_CONFIG} from '../const';
import {getIFrame} from '../util/dom';

export default class AppShell {
    constructor(options, page) {
        this.page = page;
        this.data = options.data;
        this.$wrapper = null;
        this.header = null;
        this.loading = null;

        this._init();
    }

    _init() {
        this.$wrapper = document.createElement('div');
        this.$wrapper.classList.add('mip-appshell-header-wrapper');
        if (this.data.header.show) {
            this.$wrapper.classList.add('show');
        }
        else {
            this.$wrapper.classList.add('with-iframe');
        }

        this.header = new Header({
            wrapper: this.$wrapper,
            data: {
                ...this.data.header,
                showBackIcon: !this.data.view.isIndex
            },
            clickButtonCallback: this.handleClickHeaderButton.bind(this)
        });
        this.header.init();

        // this.loading = new Loading({
        //     wrapper: this.$wrapper
        // });
        this.loading = new Loading();
        this.loading.init();

        document.body.prepend(this.$wrapper);
    }

    refresh(data, targetPageId) {
        let {header, view} = data;

        // set document title
        if (header.title) {
            document.title = header.title;
        }

        // toggle iframe
        let targetIFrame = getIFrame(targetPageId);
        if (header.show) {
            this.$wrapper.classList.add('show');
            targetIFrame && targetIFrame.classList.add('with-header');
            this.loading.addClass('header-loaded');
        }
        else {
            targetIFrame && targetIFrame.classList.remove('with-header');
            this.$wrapper.classList.remove('show');
        }

        // redraw entire header
        if (this.header) {
            this.header.update({
                ...header,
                showBackIcon: !view.isIndex
            });
            this.header.isDropdownShow = false;
        }
    }

    handleClickHeaderButton(buttonName) {
        if (buttonName === 'back') {
            window.MIP_ROUTER.go(-1);
        }
        else if (buttonName === 'dropdown') {
            if (this.header) {
                this.header.toggleDropdown();
            }
        }
        this.page.emitEventInCurrentPage({
            name: `appheader:click-${buttonName}`
        });
    }

    showLoading() {
        this.loading.show();
    }

    hideLoading() {
        this.loading.hide();
    }
}
