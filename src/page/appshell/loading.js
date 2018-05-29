export default class Loading {
    constructor(options = {}) {
        this.$wrapper = options.wrapper || document.body;
        this.$el = null;
        this.data = options.data;

        this.value = 0;
        this.width = 4;
        this.size = 32;
        this.calculatedSize = Number(this.size);
        this.radius = 20;
        this.viewBoxSize = this.radius / (1 - this.width / this.size);
        this.circumference = 2 * Math.PI * this.radius;
        this.normalizedValue = Math.max(0, Math.min(this.value, 100));

        this.strokeDashArray = Math.round(this.circumference * 1000) / 1000;
        this.strokeDashOffset = ((100 - this.normalizedValue) / 100) * this.circumference + 'px';
        this.strokeWidth = this.width / this.size * this.viewBoxSize * 2;
    }

    init() {
        this.$el = document.createElement('div');
        this.$el.id = 'mip-appshell-loading';
        this.$el.classList.add('mip-appshell-loading');
        this.$el.innerHTML = this.render(this.data);
        this.$wrapper.appendChild(this.$el);
    }

    render(data) {
        return `
            <div class="mip-loading mip-loading--indeterminate"
                style="height:${this.size}px;width:${this.size}px">
                <svg xmlns="http://www.w3.org/2000/svg"
                    viewBox="${this.viewBoxSize} ${this.viewBoxSize} ${2 * this.viewBoxSize} ${2 * this.viewBoxSize}">
                    ${this.genCircle('overlay', this.strokeDashOffset)}
                </svg>
            </div>
        `;
    }

    genCircle (name, offset) {
        return `
            <circle class="mip-loading-${name}"
                fill="transparent"
                cx="${2 * this.viewBoxSize}"
                cy="${2 * this.viewBoxSize}"
                r="${this.radius}"
                stroke-width="${this.strokeWidth}"
                stroke-dasharray="${this.strokeDashArray}"
                stroke-dashoffset="${offset}"></circle>
        `;
    }

    show() {
        this.addClass('show');
    }

    hide() {
        this.removeClass();
    }

    addClass(className) {
        this.$el.classList.add(className);
    }

    removeClass(className) {
        if (className) {
            this.$el.classList.remove(className);
        }
        else {
            this.$el.classList = [];
        }
    }
}
