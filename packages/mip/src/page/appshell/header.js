import event from '../../util/dom/event';
import {isSameRoute, normalizeLocation} from '../util/route';
import {nextFrame, whenTransitionEnds, clickedInEls} from '../util/dom';

export default class Header {
    constructor(options = {}) {
        this.$wrapper = options.wrapper || document.body;
        this.$el = null;
        this.data = options.data;
        this.clickButtonCallback = options.clickButtonCallback;
        this._clickOutside = this._clickOutside.bind(this);
    }

    init() {
        this.$el = document.createElement('div');
        this.$el.classList.add('mip-appshell-header');
        if (this.data.xiongzhang) {
            this.$el.classList.add('xiongzhang-header');
        }
        this.$el.innerHTML = this.render(this.data);
        this.$wrapper.prepend(this.$el);

        this.bindEvents();
    }

    render(data) {
        let {xiongzhang, showBackIcon, title, logo, buttonGroup} = data;
        let headerHTML = `
            ${showBackIcon ? `<span class="material-icons" mip-header-btn
                data-button-name="back">
                keyboard_arrow_left
            </span>` : ''}
        `;

        if (xiongzhang) {
            headerHTML += `
                <div class="mip-appshell-header-logo-title">
                    ${logo ? `<img class="mip-appshell-header-logo" src="${logo}">` : ''}
                    <span class="mip-appshell-header-title">${title}</span>
                </div>
                <div class="mip-appshell-header-button-group">
                    <div class="button more material-icons">more_horiz</div>
                    <div class="split"></div>
                    <div class="button close material-icons">close</div>
                </div>
            `;
        }
        else {
            headerHTML += `
                ${logo ? `<img class="mip-appshell-header-logo" src="${logo}">` : ''}
                <span class="mip-appshell-header-title">${title}</span>
                ${buttonGroup && buttonGroup.length ? 'this.renderButtonGroup(buttonGroup)' : ''}
            `;
        }

        return headerHTML;
    }

    renderButtonGroup(buttonGroup) {
        return `<div class="mip-appshell-header-button-group">
                ${buttonGroup.map(this.renderButton.bind(this)).join('')}
            </div>`;
    }

    renderButton(button) {
        if (button.type === 'icon') {
            return `
                <div
                    mip-header-btn
                    data-button-name="${button.name}"
                    class="mip-appshell-header-icon">
                    ${button.link ?
                        `<a mip-link href="${button.link}">
                            <span class="material-icons">${button.text}</span>
                        </a>` :
                        `<span class="material-icons">${button.text}</span>`
                    }
                </div>
            `;
        }
        else if (button.type === 'button') {
            return `
                <button
                    mip-header-btn
                    data-button-name="${button.name}"
                    class="mip-appshell-header-button
                        mip-appshell-header-button-${button.outline ? 'outlined' : 'filled'}">
                    ${button.link ?
                        `<a mip-link href="${button.link}">
                            ${button.text}
                        </a>` :
                        `<span>${button.text}</span>`
                    }
                </button>
            `;
        }
        else if (button.type === 'dropdown') {
            return `
                <div class="mip-appshell-header-icon"
                    mip-header-btn
                    data-button-name="dropdown">
                    <span class="material-icons">
                        menu
                    </span>
                    <div class="mip-appshell-header-dropdown">
                        ${button.items.map(this.renderDropdownItem.bind(this)).join('')}
                    </div>
                </div>
            `;
        }
        return '';
    }

    renderDropdownItem(item) {
        return `
        <div class="mip-appshell-header-dropdown-item ${this.isActive(item.link) ? 'mip-link-active' : ''}"
            mip-header-btn
            data-button-name="${item.name}">
            ${item.link ?
                `<a mip-link href="${item.link}">${item.text}</a>` :
                `<span>${item.text}</span>`
            }
        </div>
        `;
    }

    isActive(to) {
        if (!to) {
            return false;
        }
        let router = window.MIP_ROUTER;
        let currentRoute = router.history.current;
        let compareTarget = normalizeLocation(to, currentRoute);
        console.log(to, compareTarget)
        return isSameRoute(currentRoute, compareTarget);
    }

    showDropdown() {
        let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown');
        $dropdown.classList.add('show');

        $dropdown.classList.add('slide-enter');
        $dropdown.classList.add('slide-enter-active');

        // trigger layout
        $dropdown.offsetWidth;

        whenTransitionEnds($dropdown, 'transition', () => {
            $dropdown.classList.remove('slide-enter-to');
            $dropdown.classList.remove('slide-enter-active');
            this.isDropdownShow = !this.isDropdownShow;
        });

        nextFrame(() => {
            $dropdown.classList.add('slide-enter-to');
            $dropdown.classList.remove('slide-enter');
        });
    }

    hideDropdown() {
        let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown');
        $dropdown.classList.add('slide-leave');
        $dropdown.classList.add('slide-leave-active');

        // trigger layout
        $dropdown.offsetWidth;

        whenTransitionEnds($dropdown, 'transition', () => {
            $dropdown.classList.remove('slide-leave-to');
            $dropdown.classList.remove('slide-leave-active');
            this.isDropdownShow = !this.isDropdownShow;
            $dropdown.classList.remove('show');
        });

        nextFrame(() => {
            $dropdown.classList.add('slide-leave-to');
            $dropdown.classList.remove('slide-leave');
        });
    }

    toggleDropdown() {
        this.cleanTransitionClasses();
        this.isDropdownShow ? this.hideDropdown() : this.showDropdown();
    }

    cleanTransitionClasses() {
        let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown');
        $dropdown.classList.remove('slide-leave', 'slide-leave-active', 'slide-leave-to',
            'slide-enter', 'slide-enter-active', 'slide-enter-to');
    }

    _clickOutside(e) {
        let $dropdown = this.$el.querySelector('.mip-appshell-header-dropdown');
        if ($dropdown) {
            let elements = [$dropdown.parentNode];
            !clickedInEls(e, elements) && setTimeout(() => {
                this.isDropdownShow && this.hideDropdown();
            }, 0);
        }
    }

    bindEvents() {
        let clickButtonCallback = this.clickButtonCallback;
        this.eventHandler = event.delegate(this.$el, '[mip-header-btn]', 'click', function(e) {
            let buttonName = this.dataset.buttonName;
            clickButtonCallback(buttonName);
        });

        document.body.addEventListener('click', this._clickOutside, true);
    }

    unbindEvents() {
        this.eventHandler && this.eventHandler();
        document.body.removeEventListener('click', this._clickOutside, true)
    }

    update(data) {
        this.$el.innerHTML = this.render(data);
    }
}
