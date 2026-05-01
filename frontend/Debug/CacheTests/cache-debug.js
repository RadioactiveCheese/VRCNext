(function () {
    'use strict';

    // ── Colors ───────────────────────────────────────────────────────────────
    const COLOR = {
        disk:    'rgba(0,200,80,0.5)',    // Green  = from Caches/ImageCache/
        browser: 'rgba(255,140,0,0.5)',   // Orange = WebView2 browser cache
        network: 'rgba(220,40,40,0.5)',   // Red    = fresh from network / API
        pending: 'rgba(150,150,150,0.5)', // Gray   = still loading
    };

    // Duration threshold (ms) for cross-origin browser-cache heuristic.
    // Cross-origin resources block transferSize/decodedBodySize via CORS,
    // so we use duration: near-zero = served from browser cache.
    const CACHE_DURATION_MS = 8;

    // ── Fixed overlay layer (covers the entire viewport, pointer-events: none)
    const layer = document.createElement('div');
    layer.id = 'dbg-cache-layer';
    Object.assign(layer.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        zIndex: '2147483647',
        overflow: 'hidden',
    });

    // ── Legend ────────────────────────────────────────────────────────────────
    const legend = document.createElement('div');
    legend.id = 'dbg-cache-legend';

    function updateLegend() {
        let disk = 0, browser = 0, network = 0, pending = 0;
        for (const [, d] of registry) {
            if      (d.source === 'disk')    disk++;
            else if (d.source === 'browser') browser++;
            else if (d.source === 'network') network++;
            else                             pending++;
        }
        legend.innerHTML =
            `<div class="dbg-title">Image Cache Debug</div>` +
            `<div class="dbg-row"><span class="dbg-dot" style="background:#00c850"></span>Disk Cache<span class="dbg-count">${disk}</span></div>` +
            `<div class="dbg-row"><span class="dbg-dot" style="background:#ff8c00"></span>Browser Cache<span class="dbg-count">${browser}</span></div>` +
            `<div class="dbg-row"><span class="dbg-dot" style="background:#dc2828"></span>Network / API<span class="dbg-count">${network}</span></div>` +
            (pending ? `<div class="dbg-row"><span class="dbg-dot" style="background:#969696"></span>Loading…<span class="dbg-count">${pending}</span></div>` : '');
    }

    // ── State ─────────────────────────────────────────────────────────────────
    // el → { overlay: HTMLElement, source: string, url: string }
    const registry = new Map();
    // Elements already registered (WeakSet so removed elements are GC'd)
    const seen = new WeakSet();

    // ── URL helpers ───────────────────────────────────────────────────────────
    function resolveUrl(raw) {
        try { return new URL(raw, location.href).href; } catch { return raw; }
    }

    function getUrl(el) {
        if (el.tagName === 'IMG') {
            return el.src || null;
        }
        // Inline style: background-image: url('...')
        const style = el.getAttribute('style') || '';
        const m = style.match(/background-image\s*:\s*url\((['"]?)([^'")\s]+)\1\)/i);
        return m ? resolveUrl(m[2]) : null;
    }

    // ── Classification ────────────────────────────────────────────────────────

    // Immediate check based purely on URL pattern (100% truth from C# backend).
    // ImageCacheHelper.ToLocalUrl() appends ?src=disk when DebugMode is true.
    // Even without the marker, localhost/imgcache/ is always a disk-cache URL.
    function classifyByUrl(url) {
        if (url.includes('/imgcache/')) return 'disk';
        return null; // Needs timing data
    }

    // Check PerformanceResourceTiming for browser-cache vs network.
    // For same-origin resources: transferSize + decodedBodySize are reliable.
    // For cross-origin CDN (no Timing-Allow-Origin): both are blocked at 0,
    // so we fall back to duration as a heuristic (near-zero = from cache).
    function classifyByTiming(url) {
        const entries = performance.getEntriesByName(url, 'resource');
        if (!entries.length) return null; // Not in timing buffer yet

        const e = entries[entries.length - 1];

        // Same-origin or server sends Timing-Allow-Origin
        if (e.decodedBodySize > 0 && e.transferSize === 0) return 'browser';
        if (e.transferSize > 0)                             return 'network';

        // Cross-origin without timing headers: duration heuristic
        if (e.duration <= CACHE_DURATION_MS) return 'browser';
        return 'network';
    }

    // ── Overlay creation ──────────────────────────────────────────────────────
    function makeOverlay() {
        const d = document.createElement('div');
        Object.assign(d.style, {
            position: 'absolute',
            pointerEvents: 'none',
            background: COLOR.pending,
            transition: 'background 0.25s',
        });
        layer.appendChild(d);
        return d;
    }

    function applySource(el, source) {
        const d = registry.get(el);
        if (!d || d.source === source) return;
        d.source = source;
        d.overlay.style.background = COLOR[source] ?? COLOR.pending;
        updateLegend();
    }

    // ── Retry timing with backoff ─────────────────────────────────────────────
    // Called when the image loads but the timing entry isn't in the buffer yet.
    function retryTiming(el, url, attempts) {
        if (attempts <= 0) { applySource(el, 'network'); return; }
        setTimeout(() => {
            const src = classifyByTiming(url);
            if (src) applySource(el, src);
            else     retryTiming(el, url, attempts - 1);
        }, 200);
    }

    // ── Register a single element ─────────────────────────────────────────────
    function register(el) {
        if (seen.has(el)) return;

        const url = getUrl(el);
        if (!url || url === '' || url.startsWith('data:') || url.startsWith('blob:')) return;

        seen.add(el);

        const overlay = makeOverlay();
        registry.set(el, { overlay, source: 'pending', url });
        updateLegend();

        // 1. URL is enough for disk-cache truth
        const byUrl = classifyByUrl(url);
        if (byUrl) { applySource(el, byUrl); return; }

        // 2. Timing already in buffer (image loaded before we registered it)
        const byTiming = classifyByTiming(url);
        if (byTiming) { applySource(el, byTiming); return; }

        // 3. Image not loaded yet — wait for load/error events
        if (el.tagName === 'IMG') {
            if (el.complete) {
                // complete but no timing entry yet → retry shortly
                retryTiming(el, url, 10);
            } else {
                el.addEventListener('load', () => {
                    const t = classifyByTiming(url);
                    if (t) applySource(el, t);
                    else   retryTiming(el, url, 8);
                }, { once: true });
                el.addEventListener('error', () => applySource(el, 'network'), { once: true });
            }
        } else {
            // CSS background — no load event, retry with more patience
            retryTiming(el, url, 15);
        }
    }

    // ── RAF: keep overlay rects in sync with element positions ───────────────
    function frame() {
        for (const [el, { overlay }] of registry) {
            if (!document.contains(el)) {
                overlay.remove();
                registry.delete(el);
                // WeakSet handles GC automatically
                continue;
            }
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) {
                overlay.style.display = 'none';
            } else {
                overlay.style.display = '';
                overlay.style.left   = r.left   + 'px';
                overlay.style.top    = r.top    + 'px';
                overlay.style.width  = r.width  + 'px';
                overlay.style.height = r.height + 'px';
            }
        }
        requestAnimationFrame(frame);
    }

    // ── DOM scan ──────────────────────────────────────────────────────────────
    function scan(root) {
        if (!root || root.nodeType !== 1) return;
        // Root itself
        if (root.tagName === 'IMG' && root.src) register(root);
        const s = root.getAttribute?.('style') || '';
        if (s.includes('background-image')) register(root);
        // Descendants
        root.querySelectorAll('img[src], [style*="background-image"]').forEach(register);
    }

    // ── MutationObserver: watch for new images and src/style changes ──────────
    const mo = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === 'childList') {
                m.addedNodes.forEach(n => scan(n));
            } else if (m.type === 'attributes') {
                // src or style changed — remove old entry and re-classify
                const old = registry.get(m.target);
                if (old) { old.overlay.remove(); registry.delete(m.target); }
                seen.delete(m.target);
                register(m.target);
            }
        }
    });

    // ── PerformanceObserver: catch timing entries as resources finish loading ─
    try {
        const po = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
                if (entry.entryType !== 'resource') continue;
                for (const [el, d] of registry) {
                    if (d.source !== 'pending' || d.url !== entry.name) continue;
                    let src;
                    if (entry.decodedBodySize > 0 && entry.transferSize === 0) src = 'browser';
                    else if (entry.transferSize > 0)                            src = 'network';
                    else if (entry.duration <= CACHE_DURATION_MS)               src = 'browser';
                    else                                                         src = 'network';
                    applySource(el, src);
                }
            }
        });
        po.observe({ entryTypes: ['resource'] });
    } catch (_) {}

    // ── Ctrl+Shift+D: toggle overlay visibility ───────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            const hidden = layer.style.display === 'none';
            layer.style.display  = hidden ? '' : 'none';
            legend.style.display = hidden ? '' : 'none';
        }
    });

    // ── Init ──────────────────────────────────────────────────────────────────
    function init() {
        document.body.appendChild(layer);
        document.body.appendChild(legend);
        updateLegend();
        scan(document.body);
        mo.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'style'],
        });
        requestAnimationFrame(frame);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
