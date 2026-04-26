(function () {
    const THEME_ID = 'Dashboard Theme';
    const content = document.querySelector('.content');
    const tab0 = document.getElementById('tab0');
    const FADE_PX = 140;

    function applyGlass() {
        if (!tab0 || !tab0.classList.contains('active')) {
            document.body.style.setProperty('--sidebar-glass-t', '1');
            return;
        }
        const t = Math.min((content?.scrollTop || 0) / FADE_PX, 1);
        document.body.style.setProperty('--sidebar-glass-t', t.toFixed(3));
    }

    function cleanup() {
        content?.removeEventListener('scroll', applyGlass);
        document.documentElement.removeEventListener('themechange', applyGlass);
        document.documentElement.removeEventListener('tabchange', applyGlass);
        document.documentElement.removeEventListener('vrcnext:theme:unload:' + THEME_ID, cleanup);
        document.body.style.removeProperty('--sidebar-glass-t');
    }

    applyGlass();
    content?.addEventListener('scroll', applyGlass, { passive: true });
    document.documentElement.addEventListener('themechange', applyGlass);
    document.documentElement.addEventListener('tabchange', applyGlass);
    document.documentElement.addEventListener('vrcnext:theme:unload:' + THEME_ID, cleanup);
}());
