function toggleRsidebar() {
    rsidebarCollapsed = !rsidebarCollapsed;
    localStorage.setItem('vrcnext_rsidebar', rsidebarCollapsed ? '1' : '0');
    const rs = document.getElementById('rsidebar');
    document.getElementById('rsIcon').textContent = rsidebarCollapsed ? 'chevron_left' : 'chevron_right';
    rs.classList.toggle('collapsed', rsidebarCollapsed);
    if (typeof renderVrcFriends === 'function' && vrcFriendsData?.length) renderVrcFriends(vrcFriendsData);
}

function renderVrcProfile(u) {
    const a = document.getElementById('vrcProfileArea');
    if (!u) { a.innerHTML = ''; currentVrcUser = null; return; }
    currentVrcUser = u;
    // If My Profile modal is open, refresh it immediately
    const _myp = document.getElementById('modalMyProfile');
    if (_myp && _myp.style.display !== 'none') renderMyProfileContent();
    const img = u.image || '';
    const imgTag = img
        ? `<img class="vrc-avatar" src="${img}" onerror="this.style.display='none'">`
        : `<div class="vrc-avatar" style="display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:var(--tx3)">${esc((u.displayName || '?')[0])}</div>`;
    const ownStatusCls = statusDotClass(u.status);
    const ownAvatarWrap = `<div class="vrc-profile-avatar-wrap">${imgTag}<span class="vrc-friend-status-badge vrc-status-dot ${ownStatusCls}"></span></div>`;
    a.innerHTML = `<div class="vrc-profile" data-status="${ownStatusCls}" onclick="openMyProfileModal()">${ownAvatarWrap}<div class="vrc-profile-info"><div class="vrc-profile-name">${esc(u.displayName)}</div><div class="vrc-profile-status">${getStatusText(u.status, u.statusDescription)}</div></div><span class="msi" style="font-size:16px;color:var(--tx3);flex-shrink:0;">manage_accounts</span></div>`;
}

function renderVrcFriends(friends, counts) {
    const el = document.getElementById('vrcFriendsList');
    const lp = document.getElementById('vrcLoginPrompt');
    if (lp) lp.style.display = 'none';
    vrcFriendsData = friends || [];

    if (currentFriendDetail && friends) {
        const lf = friends.find(f => f.id === currentFriendDetail.id);
        if (lf) {
            currentFriendDetail.status = lf.status;
            currentFriendDetail.statusDescription = lf.statusDescription;
            currentFriendDetail.location = lf.location;
            currentFriendDetail.presence = lf.presence;
            const detailStatusEl = document.getElementById('fd-live-status');
            if (detailStatusEl) {
                const isWeb = lf.presence === 'web';
                const isOff = lf.presence === 'offline';
                const dotClass = isWeb ? 'vrc-status-ring' : 'vrc-status-dot';
                detailStatusEl.innerHTML = `<span class="${dotClass} ${isOff ? 's-offline' : statusDotClass(lf.status)}" style="width:8px;height:8px;"></span>${isOff ? t('status.offline', 'Offline') : statusLabel(lf.status)}${(!isOff && isWeb) ? ' ' + t('profiles.friends.web_suffix', '(Web)') : ''}${(!isOff && lf.statusDescription) ? ' - ' + esc(lf.statusDescription) : ''}`;
            }
        }
    }

    const searchBar = document.getElementById('vrcFriendSearch');
    if (searchBar) searchBar.style.display = vrcFriendsData.length > 0 ? '' : 'none';

    if (!friends || !friends.length) {
        el.innerHTML = `<div class="vrc-section-label">${getFriendSectionLabel('onlineZero', 0)}</div><div style="padding:16px;text-align:center;font-size:12px;color:var(--tx3);">${t('dashboard.friends.empty', 'No friends online')}</div>`;
        return;
    }

    const gameFriends = friends.filter(f => f.presence === 'game');
    const webFriends = friends.filter(f => f.presence === 'web');
    const offlineFriends = friends.filter(f => f.presence === 'offline');

    const gc = counts ? counts.game : gameFriends.length;
    const wc = counts ? counts.web : webFriends.length;
    const oc = counts ? counts.offline : offlineFriends.length;

    const renderCard = (f, presenceType) => {
        const img = f.image || '';
        const imgTag = img
            ? `<img class="vrc-friend-avatar" src="${img}" onerror="this.style.display='none'">`
            : `<div class="vrc-friend-avatar" style="display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--tx3)">${esc((f.displayName || '?')[0])}</div>`;
        const statusCls = presenceType === 'offline' ? 's-offline' : statusDotClass(f.status);
        const rank = getTrustRank(f.tags || []);
        const rankBadge = rank ? `<span class="vrcn-badge" style="background:${rank.color}22;color:${rank.color};">${rank.label}</span>` : '';
        const fid = (f.id || '').replace(/'/g, "\\'");
        const statusText = f.statusDescription || statusLabel(f.status);
        const locationText = getFriendLocationLabel(presenceType, f.location);
        const badgeDotCls = presenceType === 'web' ? 'vrc-status-ring' : 'vrc-status-dot';
        const avatarWrap = `<div class="vrc-friend-avatar-wrap">${imgTag}<span class="vrc-friend-status-badge ${badgeDotCls} ${statusCls}"></span></div>`;
        return `<div class="vrc-friend-card" data-uid="${fid}" data-status="${statusCls}" onclick="openFriendDetail('${fid}')">${avatarWrap}<div class="vrc-friend-info"><div class="vrc-friend-name"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(f.displayName)}</span>${rankBadge}</div><div class="vrc-friend-loc">${esc(statusText)} &middot; ${esc(locationText)}</div></div></div>`;
    };

    const favIds = new Set(favFriendsData.map(f => f.favoriteId));
    const favFriends = favIds.size > 0 ? [...friends].filter(f => favIds.has(f.id)).sort((a, b) => {
        const order = { game: 0, web: 1, offline: 2 };
        return (order[a.presence] ?? 2) - (order[b.presence] ?? 2);
    }) : [];

    let h = '';
    const appendSection = (key, count, list, presenceResolver) => {
        if (!list.length) return;
        const chev = friendSectionCollapsed[key] ? 'expand_more' : 'expand_less';
        h += `<div class="vrc-section-label vrc-offline-toggle" onclick="toggleFriendSection('${key}')" style="cursor:pointer;"><span class="vrc-section-text">${getFriendSectionLabel(key, count)}</span><span class="vrc-section-short">${getFriendSectionShortLabel(key)}</span><span class="msi" style="font-size:14px;" id="${key}Chevron">${chev}</span></div>`;
        h += `<div id="${key}FriendsSection" style="display:${friendSectionCollapsed[key] ? 'none' : ''};">`;
        list.forEach(f => {
            const resolvedPresence = typeof presenceResolver === 'function' ? presenceResolver(f) : presenceResolver;
            h += renderCard(f, resolvedPresence);
        });
        h += `</div>`;
    };

    // Same Location — only shown when sidebar is expanded
    if (!rsidebarCollapsed) {
        const _instGroups = {};
        friends.filter(f => f.presence === 'game' && f.location && f.location.startsWith('wrld_')).forEach(f => {
            const locBase = f.location.split('~')[0];
            if (!_instGroups[locBase]) _instGroups[locBase] = [];
            _instGroups[locBase].push(f);
        });
        const _sharedInst = Object.entries(_instGroups).filter(([, list]) => list.length >= 2);
        if (_sharedInst.length) {
            const _slTotal = _sharedInst.reduce((s, [, l]) => s + l.length, 0);
            const _slChev = friendSectionCollapsed.samelocation ? 'expand_more' : 'expand_less';
            h += `<div class="vrc-section-label vrc-offline-toggle" onclick="toggleFriendSection('samelocation')" style="cursor:pointer;"><span class="vrc-section-text">${tf('profiles.friends.sections.same_location', { count: _slTotal }, 'IN INSTANCE - {count}')}</span><span class="vrc-section-short">${t('profiles.friends.sections_short.same_location', 'HERE')}</span><span class="msi" style="font-size:14px;" id="samelocationChevron">${_slChev}</span></div>`;
            h += `<div id="samelocationFriendsSection" style="display:${friendSectionCollapsed.samelocation ? 'none' : ''};">`;
            _sharedInst.forEach(([locBase, list]) => {
                const _wid = locBase.split(':')[0];
                const _iid = locBase.split(':')[1] || '';
                const _wc = (typeof dashWorldCache !== 'undefined' && dashWorldCache[_wid]) || null;
                const _wname = _wc?.name || '';
                const _wthumb = _wc?.thumbnailImageUrl || _wc?.imageUrl || '';
                const _grpLabel = _wname
                    ? `${_wname}${_iid ? ' · #' + _iid : ''}`
                    : (_iid ? '#' + _iid : _wid);
                const { instanceType: _iType } = parseFriendLocation(list[0]?.location || '');
                const { cls: _iCls, label: _iLabel } = getInstanceBadge(_iType);
                const _badgeHtml = `<span class="vrcn-badge ${_iCls}">${esc(_iLabel)}</span>`;
                h += `<div class="sloc-inst-card">`;
                if (_wthumb) h += `<div class="sloc-inst-bg" style="background-image:url('${cssUrl(_wthumb)}')"></div>`;
                h += `<div class="sloc-inst-content">`;
                h += `<div class="sloc-inst-label">${esc(_grpLabel)} <span class="sloc-inst-count">${list.length}</span>${_badgeHtml}</div>`;
                list.forEach(f => { h += renderCard(f, 'game'); });
                h += `</div></div>`;
            });
            h += `</div>`;
        }
    }

    appendSection('favorites', favFriends.length, favFriends, f => f.presence);
    appendSection('ingame', gc, gameFriends, 'game');
    appendSection('web', wc, webFriends, 'web');
    appendSection('offline', oc, offlineFriends, 'offline');

    el.innerHTML = h;
    filterFriendsList();
}

function toggleFriendSection(key) {
    friendSectionCollapsed[key] = !friendSectionCollapsed[key];
    try { localStorage.setItem('friendSectionCollapsed', JSON.stringify(friendSectionCollapsed)); } catch {}
    const ids = { samelocation: ['samelocationFriendsSection', 'samelocationChevron'], favorites: ['favoritesFriendsSection', 'favoritesChevron'], ingame: ['ingameFriendsSection', 'ingameChevron'], web: ['webFriendsSection', 'webChevron'], offline: ['offlineFriendsSection', 'offlineChevron'] };
    const [secId, chevId] = ids[key] || [];
    const sec = secId && document.getElementById(secId);
    const chev = chevId && document.getElementById(chevId);
    if (sec) sec.style.display = friendSectionCollapsed[key] ? 'none' : '';
    if (chev) chev.textContent = friendSectionCollapsed[key] ? 'expand_more' : 'expand_less';
}

function filterFriendsList() {
    const q = (document.getElementById('vrcFriendSearchInput')?.value || '').toLowerCase().trim();
    const cards = document.querySelectorAll('#vrcFriendsList .vrc-friend-card');
    const sections = document.querySelectorAll('#vrcFriendsList .vrc-section-label');

    // Hide favorites + samelocation sections during search to avoid duplicates
    const favSec    = document.getElementById('favoritesFriendsSection');
    const favLabel  = favSec?.previousElementSibling;
    const slocSec   = document.getElementById('samelocationFriendsSection');
    const slocLabel = slocSec?.previousElementSibling;

    const sectionMap = {
        ingame:  document.getElementById('ingameFriendsSection'),
        web:     document.getElementById('webFriendsSection'),
        offline: document.getElementById('offlineFriendsSection'),
    };

    if (!q) {
        // Reset: show all cards, restore all collapsed states
        cards.forEach(c => c.style.display = '');
        sections.forEach(s => s.style.display = '');
        Object.entries(sectionMap).forEach(([key, el]) => {
            if (el) el.style.display = friendSectionCollapsed[key] ? 'none' : '';
        });
        if (favSec)    favSec.style.display    = friendSectionCollapsed.favorites    ? 'none' : '';
        if (favLabel)  favLabel.style.display   = '';
        if (slocSec)   slocSec.style.display    = friendSectionCollapsed.samelocation ? 'none' : '';
        if (slocLabel) slocLabel.style.display  = '';
        return;
    }

    // Hide favorites + samelocation while searching (prevents duplicates)
    if (favSec)    favSec.style.display    = 'none';
    if (favLabel)  favLabel.style.display  = 'none';
    if (slocSec)   slocSec.style.display   = 'none';
    if (slocLabel) slocLabel.style.display = 'none';

    // Force-expand all other sections so collapsed cards are still searchable
    Object.values(sectionMap).forEach(el => { if (el) el.style.display = ''; });

    cards.forEach(c => {
        const name = (c.querySelector('.vrc-friend-name')?.textContent || '').toLowerCase();
        c.style.display = name.includes(q) ? '' : 'none';
    });

    // Hide section labels if all their cards are hidden
    sections.forEach(s => {
        if (s.style.display === 'none') return; // already hidden (e.g. favorites during search)
        let hasVisible = false;
        let sibling = s.nextElementSibling;
        while (sibling && !sibling.classList.contains('vrc-section-label')) {
            if (sibling.classList.contains('vrc-friend-card') && sibling.style.display !== 'none') hasVisible = true;
            // Check inside any section wrapper div
            if (sibling.id && sibling.id.endsWith('FriendsSection')) {
                sibling.querySelectorAll('.vrc-friend-card').forEach(c => {
                    if (c.style.display !== 'none') hasVisible = true;
                });
            }
            sibling = sibling.nextElementSibling;
        }
        s.style.display = hasVisible ? '' : 'none';
    });
}
