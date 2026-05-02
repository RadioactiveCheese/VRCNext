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
            const matrix = new DOMMatrixReadOnly(getComputedStyle(document.body).transform);
            const zoom = matrix.a || 1;
            const viewW = window.innerWidth / zoom;
            const viewH = window.innerHeight / zoom;
            const tipRect = {
                left: rect.left / zoom,
                top: rect.top / zoom,
                right: rect.right / zoom,
                bottom: rect.bottom / zoom,
                width: rect.width / zoom,
                height: rect.height / zoom,
            };
            const tw = tip.offsetWidth;
            const th = tip.offsetHeight;
            let left = tipRect.left + tipRect.width / 2 - tw / 2;
            let top  = tipRect.bottom + 7;
            if (top + th > viewH - 8) top = tipRect.top - th - 7;
            left = Math.max(8, Math.min(left, viewW - tw - 8));
            tip.style.left = left + 'px';
            tip.style.top  = top + 'px';
        });
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
