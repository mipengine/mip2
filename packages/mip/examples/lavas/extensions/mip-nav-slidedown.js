/**
 * @file 菜单 mip-nav-slidedown
 * @author liangjiaying
 * @time 2016.09
 */

/* global define */

define('mip-nav-slidedown', function (require) {
  var customElement = require('customElement').create()
  var $ = require('zepto')

  function build () {
    var element = this.element
    render(element)
    bindEvents(element)
    showNavBar(element)
  }

  /**
   * 渲染dom
   *
   * @param  {obj} me this
   */
  function render (me) {
    var $this = $(me)
    var id = $this.data('id')
    var showBrand = !($this.data('showbrand') === 0)
    var brandName = $this.data('brandname') || ''
    var brandHref = $this.data('brandhref') || '#'
    var $ulNav = $this.find('#' + id)
    var $container = $('<div></div>')
    var $btnWrap = '<div class="navbar-header">' +
      '<button class="navbar-toggle collapsed" type="button" data-target="#' +
      id + '" aria-controls="' + id + '" aria-expanded="false">' +
      '<span class="sr-only">导航</span>' +
      '<span class="icon-bar"></span>' +
      '<span class="icon-bar"></span>' +
      '<span class="icon-bar"></span>' +
      '</button>' +
      (showBrand ? '<a href=' + brandHref + ' class="navbar-brand">' + brandName + '</a>' : '') +
      '</div>'
    $container.append($btnWrap).append($ulNav).appendTo($this)
    $('.mip-nav-wrapper').addClass('show')
  }

  /**
   * 绑定事件
   *
   * @param  {obj} me this
   */
  function bindEvents (me) {
    var bodyClass = $('body').attr('class')
    $('#bs-navbar').find('.' + bodyClass).addClass('active')

    // $(document).on('click', '.navbar-header .navbar-toggle', navClickHandler);
    $('.navbar-header .navbar-toggle').on('click', navClickHandler)

    // 主菜单关闭按钮 touchstart touchend mousedown mouseup变色
    addHoverClass($('#navbar-wise-close-btn'))
    $('#navbar-wise-close-btn').on('touchend', function (e) {
      $('.navbar-header .navbar-toggle').trigger('click')
      e.preventDefault()
      e.stopPropagation()
    }).on('click', function () {
      $('.navbar-header .navbar-toggle').trigger('click')
    })
  }

  /**
   * 展开关闭菜单效果
   *
   * @param  {event} e click event
   */
  function navClickHandler (e) {
    if (window.innerWidth > 767) {
      return
    }

    var $wiseNav = $('#bs-navbar')

    if ($wiseNav.hasClass('in')) {
      // 关闭菜单
      $wiseNav.height('0px')
      $('body').css('overflow', 'scroll')
      $('.navbar-wise-close').css('margin-top', '20px')
      $(window).off('orientationchange')
      $('html').add($('body')).removeClass('noscroll')
      setTimeout(function () {
        $wiseNav.removeClass('in')
      }, 500)
    } else {
      // 打开菜单
      var closeBtnTop = 20
      $wiseNav = $('#bs-navbar')

      $('html').add($('body')).addClass('noscroll')
      setNavHeight('open')

      $(window).on('orientationchange', function () {
        window.setTimeout(function () { // hack: orientationchange 取window高度不及时
          setNavHeight('resize')
        }, 100)
      }).on('resize', function () {
        setNavHeight('resize')
      })
    }

    /**
     * 计算窗口高度
     *
     * @param {string} mode 用于区分模式
     */
    function setNavHeight (mode) {
      if (mode === 'open') {
        $wiseNav.addClass('in')
      }

      if (mode === 'resize' && ($wiseNav.hasClass('in') || mode === 'open')) {
        var listNum = $('#bs-navbar li').length
        var offsetTop = $('mip-nav-slidedown')[0] ? $('mip-nav-slidedown')[0].getBoundingClientRect().top : 0
        var navHeight = window.innerHeight - $('.navbar-header').height() - offsetTop
        $wiseNav.height(navHeight)
        // 关闭按钮距离底部固定为90px
        closeBtnTop = navHeight - ($('.navbar-right li').height()) * listNum - 90
        if (closeBtnTop > 20) {
          $('.navbar-wise-close').css('margin-top', closeBtnTop + 'px')
        } else {
          $('.navbar-wise-close').css('margin-top', '20px')
        }
      }
    }
  }

  /**
   * 增加按钮按下class对应颜色
   *
   * @param {obj} $dom dom object
   */
  function addHoverClass ($dom) {
    $dom.on('touchstart', function () {
      // 按钮按下时，改变颜色
      $(this).addClass('down')
    }).on('mousedown', function () {
      // 鼠标按下时，改变颜色
      $(this).addClass('down')
    }).on('touchend', function () {
      // 按钮抬起时，改变颜色*2，收起菜单
      $(this).removeClass('down')
    }).on('mouseup', function () {
      // 鼠标抬起时，改变颜色*2，收起菜单
      $(this).removeClass('down')
    })
  }

  function showNavBar (me) {
    var $this = $(me)
    $this.removeAttr('style')
  }

  // build 方法，元素插入到文档时执行，仅会执行一次
  customElement.prototype.build = build
  return customElement
});

(window.MIP = window.MIP || []).push({
  name: 'mip-nav-slidedown',
  func: function () {
    function e (e, t) {
      e.registerMipElement('mip-nav-slidedown', t, ".mip-nav-wrapper{height:72px}.mip-nav-wrapper.show{opacity:1 !important}.mip-nav-wrapper .hr-xs{display:none}mip-nav-slidedown #bs-navbar{margin-bottom:0;margin-right:0;float:right}mip-nav-slidedown #bs-navbar .navbar-nav{display:-ms-flexbox;display:-webkit-box;display:-webkit-flex;display:flex;margin-top:10px;margin-right:-25px}mip-nav-slidedown #bs-navbar .navbar-nav li{list-style:none;line-height:50px}mip-nav-slidedown #bs-navbar .navbar-nav li.active a,mip-nav-slidedown #bs-navbar .navbar-nav li.active mip-link mip-nav-slidedown #bs-navbar .navbar-nav li.active span{color:black;font-weight:bold}mip-nav-slidedown #bs-navbar .navbar-nav mip-link,mip-nav-slidedown #bs-navbar .navbar-nav a,mip-nav-slidedown #bs-navbar .navbar-nav span{white-space:nowrap;margin:15px;padding:10px;color:#666}mip-nav-slidedown #bs-navbar .navbar-nav mip-link:hover,mip-nav-slidedown #bs-navbar .navbar-nav a:hover,mip-nav-slidedown #bs-navbar .navbar-nav span:hover,mip-nav-slidedown #bs-navbar .navbar-nav mip-link:focus,mip-nav-slidedown #bs-navbar .navbar-nav a:focus,mip-nav-slidedown #bs-navbar .navbar-nav span:focus{text-decoration:none;background:transparent;color:black}mip-nav-slidedown .navbar-wise-close{display:none}mip-nav-slidedown .navbar-brand{float:none;display:inline-block;margin:15px 0 10px;height:41px;background-size:100% auto;position:absolute;font-size:26px}mip-nav-slidedown .navbar-brand:hover,mip-nav-slidedown .navbar-brand:active{color:rgba(255,255,255,0.85)}mip-nav-slidedown .navbar-header{float:left}mip-nav-slidedown .navbar-toggle{display:none}@media screen and (max-width:767px){.mip-nav-wrapper{height:44px}.mip-nav-wrapper #bs-navbar{height:0;transition:height .3s;width:100%;left:0;overflow-y:scroll;-webkit-overflow-scrolling:touch;overflow-scrolling:touch;z-index:1000;border:0;float:none;position:absolute;background-color:white}.mip-nav-wrapper #bs-navbar .navbar-nav{margin:0;min-height:283px;height:100%;display:block}.mip-nav-wrapper #bs-navbar .navbar-nav li{padding:5px 0}.mip-nav-wrapper #bs-navbar .navbar-nav a,.mip-nav-wrapper #bs-navbar .navbar-nav mip-link,.mip-nav-wrapper #bs-navbar .navbar-nav span{text-align:center;color:#333;font-size:18px;padding:0;margin:0 auto;display:block}.mip-nav-wrapper .navbar-header{float:none;overflow:hidden}.mip-nav-wrapper .container>.navbar-collapse{padding:0;background-color:white}.mip-nav-wrapper .navbar-static-top .navbar-brand{left:50%;margin-left:-30px}.mip-nav-wrapper .navbar-static-top a{margin:0}.mip-nav-wrapper .navbar-brand{margin:5px 0 0;height:33px;font-size:23px}.mip-nav-wrapper .navbar-toggle{display:block;margin:8px 0;padding:5px;border:0;background:transparent;float:right}.mip-nav-wrapper .navbar-toggle .icon-bar{background-color:white;height:2px;width:23px;background:#999;display:block}.mip-nav-wrapper .navbar-toggle .icon-bar+.icon-bar{margin-top:6px}.mip-nav-wrapper .hr-xs{display:block !important;border-color:#eee;margin:0 10px;border-top:0}.mip-nav-wrapper .navbar-wise-close{display:block;text-align:center;margin:20px 0}.mip-nav-wrapper #navbar-wise-close-btn{width:40px;height:40px;border-radius:50%;border:1px solid #d4d4d4;display:inline-block;position:relative}.mip-nav-wrapper #navbar-wise-close-btn:before{content:'';width:1px;height:25px;display:inline-block;position:absolute;background:#d4d4d4;transform:rotate(45deg);-webkit-transform:rotate(45deg);top:7px}.mip-nav-wrapper #navbar-wise-close-btn:after{content:'';width:1px;height:25px;display:inline-block;position:absolute;background:#d4d4d4;transform:rotate(-45deg);-webkit-transform:rotate(-45deg);top:7px}.mip-nav-wrapper #navbar-wise-close-btn.down{background:#f3f3f3}.mip-nav-wrapper .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);border:0}}@media screen and (min-width:768px){mip-nav-slidedown #bs-navbar li .navbar-more:after{content:'';position:relative;display:inline-block;border:4px solid;top:1px;border-color:#666 transparent transparent;left:3px}mip-nav-slidedown #bs-navbar li:hover .navbar-more:after{border-color:transparent transparent #666;top:-3px}mip-nav-slidedown #bs-navbar li>ul{display:none;list-style:none;position:absolute;background:white}mip-nav-slidedown #bs-navbar li:hover>ul{display:inherit;z-index:10}}")
    }
    if (window.MIP) {
      require(['mip-nav-slidedown'], function (t) {
        e(window.MIP, t)
      })
    } else require(['mip', 'mip-nav-slidedown'], e)
  }
})
