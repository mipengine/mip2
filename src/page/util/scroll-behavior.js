const ENABLE_SCROLL_CLASS = 'mip-appshell-router-view-scroll-enabled';

/**
 * make current page container scrollable,
 * and restore its scroll position.
 */
export function restoreContainerScrollPosition(containerEl, scrollTop) {
    containerEl.classList.add(ENABLE_SCROLL_CLASS);
    containerEl.scrollTop = scrollTop;
}

/**
 * make body scrollable,
 * and restore its scroll position.
 */
export function restoreBodyScrollPosition(containerEl, scrollTop) {
    containerEl.classList.remove(ENABLE_SCROLL_CLASS);
    document.body.scrollTop = document.documentElement.scrollTop = scrollTop;
}
