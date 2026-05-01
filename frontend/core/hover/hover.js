(function () {
    const tip = document.createElement('div');
    tip.id = 'vnTip';
    tip.className = 'vn-tooltip';
    document.body.appendChild(tip);

    let _active = false;

    function show(text, rect) {
        tip.textContent = text;
        tip.classList.add('vn-tooltip-visible');
        _active = true;
        position(rect);
    }

    function hide() {
        tip.classList.remove('vn-tooltip-visible');
        _active = false;
    }

    function position(rect) {
        tip.style.left = '-9999px';
        tip.style.top  = '-9999px';
        requestAnimationFrame(() => {
            const scale = getBodyScale();
            const tw = tip.offsetWidth * scale;
            const th = tip.offsetHeight * scale;
            let left = rect.left + rect.width / 2 - tw / 2;
            let top  = rect.bottom + 7;
            if (top + th > window.innerHeight - 8) top = rect.top - th - 7;
            left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
            tip.style.left = (left / scale) + 'px';
            tip.style.top  = (top / scale) + 'px';
        });
    }

    function getBodyScale() {
        const transform = getComputedStyle(document.body).transform;
        if (!transform || transform === 'none') return 1;
        const matrix = transform.match(/^matrix\(([^,]+)/);
        const scale = matrix ? parseFloat(matrix[1]) : 1;
        return Number.isFinite(scale) && scale > 0 ? scale : 1;
    }

    document.addEventListener('mouseover', e => {
        const el = e.target.closest('[data-tooltip], [title]');
        if (!el) { if (_active) hide(); return; }

        let text = el.dataset.tooltip;

        if (!text) {
            text = el.getAttribute('title');
            if (!text) return;
            // Remove title so the native browser tooltip never appears.
            // Store it for restoration on mouseleave.
            el._vnTitle = text;
            el.removeAttribute('title');
            el.dataset.tooltip = text;
        }

        show(text, el.getBoundingClientRect());
    });

    document.addEventListener('mouseleave', e => {
        const el = e.target;
        if (el._vnTitle) {
            el.setAttribute('title', el._vnTitle);
            delete el.dataset.tooltip;
            delete el._vnTitle;
        }
        hide();
    }, true);
})();
