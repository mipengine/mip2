/**
 * @file mip-app-banner 组件
 *
 * @author wangpei07@baidu.com
 */

(function () {

    var util = MIP.util;
    var viewer = util.viewer;

    var platform = util.platform;

    var openButton = {
        setup: function (openButton, openInAppUrl, installAppUrl) {
            var self = this;
            openButton.addEventListener('click', function () {
                self.onClick(openInAppUrl, installAppUrl);
            });
        },
        onClick: function (openInAppUrl, installAppUrl) {
            var timer = setTimeout(function () {
                window.top.location.href = installAppUrl;
                clearTimeout(timer);
            }, 1500);

            window.open(openInAppUrl, '_top');

            var visibilitychange = function () {
                var tag = document.hidden || document.webkitHidden;
                tag && clearTimeout(timer);
            };

            document.addEventListener('visibilitychange', visibilitychange, false);
            document.addEventListener('webkitvisibilitychange', visibilitychange, false);
            window.addEventListener('pagehide', function () {
                clearTimeout(timer);
            }, false);
        }
    };

    var ls = {
        getSotrageKey: function (id) {
            return 'mip-app-banner:' + id;
        },
        hasItem: function (id) {
            return !!localStorage.getItem(ls.getSotrageKey(id));
        },
        setSotrage: function (id) {
            localStorage.setItem(this.getSotrageKey(id), true);
        }
    };

    var dismissButton = {
        element: null,
        add: function (element) {
            this.element = element;
            var dismissBtn = document.createElement('span');
            dismissBtn.classList.add('mip-app-banner-dismiss-button');
            dismissBtn.addEventListener('click', this.onClick.bind(this));
            element.appendChild(dismissBtn);
        },
        onClick: function () {
            ls.setSotrage(this.element.id);
            this.element.remove();
        }
    };

    var preProcess = {
        isDismissed: function (id) {
            return ls.hasItem(id);
        },
        init: function (element) {
            if (this.isDismissed(element.id)) {
                element.remove();
                return;
            }
            util.css(element, {
                visibility: 'visible'
            });
            dismissButton.add(element);
        }
    };


    function canShowBanner() {
        this.isSysBanner = platform.isSafari() || platform.isBaidu(); // || platform.isQQ();
        this.showSysBanner = !viewer.isIframed && this.isSysBanner;
        if (this.showSysBanner) {
            return false;
        }

        this.isEmbeddedSafari = viewer.isIframed && this.isSysBanner;
        if (this.isEmbeddedSafari) {
            return false;
        }

        this.metaTag = document.head.querySelector('meta[name=apple-itunes-app]');
        if (!this.metaTag) {
            return false;
        }

        return true;
    }

    function iosAppBanner() {
        var self = this;

        if (!canShowBanner.call(self)) {
            this.element.remove();
            return;
        }
        this.openButton = this.element.querySelector('button[open-button]');
        preProcess.init(this.element);

        var content = this.metaTag.getAttribute('content');
        var parts = content.replace(/\s/, '').split(',');
        var config = {};
        parts.forEach(function (part) {
            var params = part.split('=');
            config[params[0]] = params[1];
        });

        var appId = config['app-id'];
        var openUrl = config['app-argument'];
        var installAppUrl = 'https://itunes.apple.com/us/app/id' + appId;
        var openInAppUrl = openUrl || installAppUrl;

        openButton.setup(this.openButton, openInAppUrl, installAppUrl);
    }

    function andriodAppBanner() {
        var self = this;

        if (!canShowBanner.call(self)) {
            this.element.remove();
            return;
        }
        this.openButton = this.element.querySelector('button[open-button]');
        preProcess.init(this.element);

        this.manifestLink = null;
        this.manifestHref = '';
        this.missingDataSources = false;

        this.manifestLink = document.head.querySelector('link[rel=manifest],link[rel=origin-manifest]');

        var isChromeAndroid = platform.isAndroid() && platform.isChrome();
        var showSysBanner = !viewer.isIframed && isChromeAndroid;
        if (showSysBanner) {

            this.element.remove();
            return;
        }

        this.missingDataSources = platform.isAndroid() && !this.manifestLink;
        if (this.missingDataSources) {
            this.element.remove();
            return;
        }

        this.manifestHref = this.manifestLink.getAttribute('href');
        if (/http:\/\//.test(this.manifestHref)) {
            console.error('必须是https的连接');
        }

        fetch(this.manifestHref).then(function (res) {
            return res.json();
        }).then(function (data) {
            var apps = data.related_applications;
            if (!apps) {
                self.element.remove();
            }
            for (var i = 0; i < apps.length; i++) {
                var app = apps[i];
                if (app.platform === 'play') {
                    var installAppUrl = app.install;
                    var openInAppUrl = app.open;
                    openButton.setup(self.openButton, openInAppUrl, installAppUrl);
                }
            }
        });

    }

    MIP.registerVueCustomElement('mip-app-banner', {
        props: {
            id: String,
            layout: String
        },
        methods: {
            firstInviewCallback() {
                var self = this;
                var element = self.element;
                preProcess.isDismissed(element.id);

                util.css(this.element, {
                    display: '',
                    visibility: 'hidden'
                });

                self.openButton = null;
                self.canShowBanner = null;
                self.dismissButton = null;

                if (platform.isIos()) {
                    iosAppBanner.call(this);
                } else {
                    andriodAppBanner.call(this);
                }
            }
        }
    });
})();

