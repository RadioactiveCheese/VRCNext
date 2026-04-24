/* === VRChat API === */
function vrcQuickLogin() {
    const u = document.getElementById('vrcQuickUser').value, p = document.getElementById('vrcQuickPass').value;
    if (!u || !p) return;
    document.getElementById('vrcQuickError').textContent = t('profiles.login.connecting', 'Connecting...');
    sendToCS({ action: 'vrcLogin', username: u, password: p });
}

function vrcLoginFromSettings() {
    const u = document.getElementById('setVrcUser').value, p = document.getElementById('setVrcPass').value;
    if (!u || !p) {
        document.getElementById('vrcLoginStatus').textContent = t('profiles.login.enter_credentials', 'Enter username and password');
        return;
    }
    document.getElementById('vrcLoginStatus').textContent = t('profiles.login.connecting', 'Connecting...');
    sendToCS({ action: 'vrcLogin', username: u, password: p });
}


function vrcLogout() {
    sendToCS({ action: 'vrcLogout' });
    document.getElementById('btnVrcLogin').style.display = '';
    document.getElementById('btnVrcLogout').style.display = 'none';
    document.getElementById('vrcLoginStatus').textContent = t('profiles.login.disconnected', 'Disconnected');
    currentVrcUser = null;
}

function vrcRefresh() {
    sendToCS({ action: 'vrcRefreshFriends' });
    requestInstanceInfo();
    refreshNotifications();
}

function closeDetailModal(fromNav = false) {
    document.getElementById('modalDetail').style.display = 'none';
    if (!fromNav && typeof navClear === 'function') navClear();
}

function statusDotClass(s) {
    if (!s) return 's-offline';
    const sl = s.toLowerCase();
    if (sl === 'active' || sl === 'online') return 's-active';
    if (sl === 'join me') return 's-join';
    if (sl === 'ask me' || sl === 'look me') return 's-ask';
    if (sl === 'busy' || sl === 'do not disturb') return 's-busy';
    return 's-offline';
}

function statusLabel(s) {
    if (!s) return t('status.offline', 'Offline');
    const sl = s.toLowerCase();
    const m = {
        'active': t('status.online', 'Online'),
        'online': t('status.online', 'Online'),
        'join me': t('status.join_me', 'Join Me'),
        'ask me': t('status.ask_me', 'Ask Me'),
        'look me': t('status.ask_me', 'Ask Me'),
        'busy': t('status.do_not_disturb', 'Do Not Disturb'),
        'do not disturb': t('status.do_not_disturb', 'Do Not Disturb'),
        'offline': t('status.offline', 'Offline')
    };
    return m[sl] || s;
}

function getFriendLocationLabel(presenceType, location) {
    const isPrivate = !location || location === 'private';
    const isOffline = location === 'offline' || presenceType === 'offline';
    if (isOffline) return t('status.offline', 'Offline');
    if (presenceType === 'web') return t('profiles.friends.location.web', 'Web / Mobile');
    if (isPrivate) return t('profiles.friends.location.private', 'Private Instance');
    const { worldId } = parseFriendLocation(location);
    const cached = worldId && (typeof dashWorldCache !== 'undefined') ? dashWorldCache[worldId] : null;
    return cached?.name || t('profiles.friends.location.world', 'In World');
}

function getFriendSectionLabel(section, count) {
    const map = {
        favorites: ['profiles.friends.sections.favorites', 'FAVORITES - {count}'],
        ingame: ['profiles.friends.sections.in_game', 'IN-GAME - {count}'],
        web: ['profiles.friends.sections.web', 'WEB / ACTIVE - {count}'],
        offline: ['profiles.friends.sections.offline', 'OFFLINE - {count}'],
        onlineZero: ['profiles.friends.sections.online_zero', 'ONLINE - {count}']
    };
    const entry = map[section];
    if (!entry) return `${count}`;
    return tf(entry[0], { count }, entry[1]);
}

function getFriendSectionShortLabel(section) {
    const map = {
        favorites: ['profiles.friends.sections_short.favorites', 'FAV'],
        ingame: ['profiles.friends.sections_short.in_game', 'GME'],
        web: ['profiles.friends.sections_short.web', 'WEB'],
        offline: ['profiles.friends.sections_short.offline', 'OFF']
    };
    const entry = map[section];
    return entry ? t(entry[0], entry[1]) : '';
}

function getProfileMutualBadgeLabel(count) {
    return count === 1
        ? tf('profiles.badges.mutual.one', { count }, '{count} Mutual')
        : tf('profiles.badges.mutual.other', { count }, '{count} Mutuals');
}

function getStatusText(status, description) {
    return `${statusLabel(status)}${description ? ' - ' + esc(description) : ''}`;
}

function getFriendStatusLine(friend) {
    if (!friend) {
        return `<span class="vrc-status-dot s-offline" style="width:6px;height:6px;flex-shrink:0;"></span><span class="fav-friend-status-text">${t('status.offline', 'Offline')}</span>`;
    }
    const dotCls = friend.presence === 'web' ? 'vrc-status-ring' : 'vrc-status-dot';
    return `<span class="${dotCls} ${statusDotClass(friend.status)}" style="width:6px;height:6px;flex-shrink:0;"></span><span class="fav-friend-status-text">${getStatusText(friend.status, friend.statusDescription)}</span>`;
}

function getGroupMemberText(memberCount, fallbackToGroup = true) {
    if (memberCount) return tf('worlds.groups.members', { count: memberCount }, '{count} members');
    return fallbackToGroup ? t('groups.common.group', 'Group') : '';
}

// Profile helpers
function formatDuration(totalSec) {
    if (totalSec < 1) return '0s';
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function formatLastSeen(apiLastLogin, localLastSeen) {
    let best = null;
    if (apiLastLogin) {
        const d = new Date(apiLastLogin);
        if (!isNaN(d)) best = d;
    }
    if (localLastSeen) {
        const d = new Date(localLastSeen);
        if (!isNaN(d) && (!best || d > best)) best = d;
    }
    if (!best) return '';
    const now = new Date();
    const diff = now - best;
    if (diff < 60000) return t('profiles.last_seen.just_now', 'Just now');
    if (diff < 3600000) return tf('profiles.last_seen.minutes_ago', { count: Math.floor(diff / 60000) }, '{count}m ago');
    if (diff < 86400000) return tf('profiles.last_seen.hours_ago', { count: Math.floor(diff / 3600000) }, '{count}h ago');
    if (diff < 604800000) return tf('profiles.last_seen.days_ago', { count: Math.floor(diff / 86400000) }, '{count}d ago');
    return fmtShortDate(best);
}


// Trust rank from tags (offset by 1 in API naming)
function getTrustRank(tags) {
    if (!tags || !Array.isArray(tags)) return null;
    // Order matters: check highest first
    if (tags.includes('system_trust_legend')) return { label: t('profiles.trust.trusted', 'Trusted User'), color: '#8143E6' };
    if (tags.includes('system_trust_veteran')) return { label: t('profiles.trust.trusted', 'Trusted User'), color: '#8143E6' };
    if (tags.includes('system_trust_trusted')) return { label: t('profiles.trust.known', 'Known User'), color: '#FF7B42' };
    if (tags.includes('system_trust_known'))   return { label: t('profiles.trust.user', 'User'), color: '#2BCF5C' };
    if (tags.includes('system_trust_basic'))   return { label: t('profiles.trust.new', 'New User'), color: '#1778FF' };
    return { label: t('profiles.trust.visitor', 'Visitor'), color: '#CCCCCC' };
}


function getPlatformInfo(hostname) {
    const h = hostname.replace('www.', '');
    if (h.includes('twitter.com') || h.includes('x.com'))          return { key: 'twitter',   label: 'Twitter/X' };
    if (h.includes('instagram.com'))                                 return { key: 'instagram', label: 'Instagram' };
    if (h.includes('tiktok.com'))                                    return { key: 'tiktok',    label: 'TikTok' };
    if (h.includes('youtube.com') || h.includes('youtu.be'))        return { key: 'youtube',   label: 'YouTube' };
    if (h.includes('discord.gg') || h.includes('discord.com'))      return { key: 'discord',   label: 'Discord' };
    if (h.includes('github.com'))                                    return { key: 'github',    label: 'GitHub' };
    if (h.includes('facebook.com') || h.includes('fb.com'))         return { key: 'facebook',  label: 'Facebook' };
    if (h.includes('twitch.tv'))                                     return { key: 'twitch',    label: 'Twitch' };
    if (h.includes('bsky.app'))                                      return { key: 'bluesky',   label: 'Bluesky' };
    if (h.includes('pixiv.net'))                                     return { key: 'pixiv',     label: 'Pixiv' };
    if (h.includes('ko-fi.com'))                                     return { key: 'kofi',      label: 'Ko-fi' };
    if (h.includes('patreon.com'))                                   return { key: 'patreon',   label: 'Patreon' };
    if (h.includes('booth.pm'))                                      return { key: 'booth',     label: 'Booth' };
    if (h.includes('vrchat.com') || h.includes('vrc.group'))        return { key: 'vrchat',    label: 'VRChat' };
    return { key: null, label: h };
}

// Bio link to SVG brand icon and label
function renderBioLink(url) {
    let platformSvg = '';
    let label = t('profiles.common.link', 'Link');
    try {
        const h = new URL(url).hostname;
        const info = getPlatformInfo(h);
        label = info.label;
        if (info.key && PLATFORM_ICONS[info.key]) {
            platformSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="flex-shrink:0"><path d="${PLATFORM_ICONS[info.key].svg}"/></svg>`;
        } else {
            platformSvg = `<span class="msi" style="font-size:14px;">link</span>`;
        }
    } catch {
        label = t('profiles.common.link', 'Link');
        platformSvg = `<span class="msi" style="font-size:14px;">link</span>`;
    }
    const safeUrl = esc(url);
    const safeUrlJs = jsq(url);
    return `<button class="fd-bio-link" onclick="sendToCS({action:'openUrl',url:'${safeUrlJs}'})" title="${safeUrl}">${platformSvg}<span>${esc(label)}</span></button>`;
}



// People Tab: Favorites / Search / Blocked / Muted

function setPeopleFilter(filter) {
    peopleFilter = filter;
    document.getElementById('peopleFilterFav').classList.toggle('active', filter === 'favorites');
    document.getElementById('peopleFilterAll').classList.toggle('active', filter === 'all');
    document.getElementById('peopleFilterSearch').classList.toggle('active', filter === 'search');
    document.getElementById('peopleFilterBlocked').classList.toggle('active', filter === 'blocked');
    document.getElementById('peopleFilterMuted').classList.toggle('active', filter === 'muted');
    document.getElementById('peopleFavArea').style.display     = filter === 'favorites' ? '' : 'none';
    document.getElementById('peopleAllArea').style.display     = filter === 'all'       ? '' : 'none';
    document.getElementById('peopleSearchArea').style.display  = filter === 'search'    ? '' : 'none';
    document.getElementById('peopleBlockedArea').style.display = filter === 'blocked'   ? '' : 'none';
    document.getElementById('peopleMutedArea').style.display   = filter === 'muted'     ? '' : 'none';
    refreshPeopleTab();
}

function refreshPeopleTab() {
    if (peopleFilter === 'favorites') sendToCS({ action: 'vrcGetFavoriteFriends' });
    if (peopleFilter === 'all')       filterAllFriends();
    if (peopleFilter === 'blocked')   sendToCS({ action: 'vrcGetBlocked' });
    if (peopleFilter === 'muted')     sendToCS({ action: 'vrcGetMuted' });
}

function filterAllFriends() {
    const el = document.getElementById('allFriendsGrid');
    if (!el) return;
    const q = (document.getElementById('allFriendSearchInput')?.value || '').toLowerCase();
    let friends = q
        ? vrcFriendsData.filter(f => (f.displayName || '').toLowerCase().includes(q))
        : [...vrcFriendsData];
    friends.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    if (!friends.length) {
        el.innerHTML = `<div class="empty-msg">${q ? t('profiles.people.no_results', 'No results') : t('profiles.people.no_friends', 'No friends yet')}</div>`;
        return;
    }
    el.innerHTML = friends.map(f => {
        const img = f.image ? `<div class="fav-friend-av" style="background-image:url('${cssUrl(f.image)}')"></div>`
                            : `<div class="fav-friend-av fav-friend-av-letter">${esc((f.displayName || '?')[0].toUpperCase())}</div>`;
        const uid = jsq(f.id);
        return `<div class="fav-friend-card" onclick="openFriendDetail('${uid}')">
            ${img}
            <div class="fav-friend-info">
                <div class="fav-friend-name">${esc(f.displayName)}</div>
                <div class="fav-friend-status">${getFriendStatusLine(f)}</div>
            </div>
        </div>`;
    }).join('');
}

function filterModList(type) {
    const isBlock = type === 'block';
    renderModList(isBlock ? 'blockedList' : 'mutedList', isBlock ? (blockedData || []) : (mutedData || []), type);
}

function renderModList(containerId, list, actionType) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const searchId = actionType === 'block' ? 'blockedSearch' : 'mutedSearch';
    const query = (document.getElementById(searchId)?.value || '').toLowerCase().trim();
    const filtered = query ? (list || []).filter(e => (e.targetDisplayName || e.targetUserId || '').toLowerCase().includes(query)) : (list || []);
    if (!filtered.length) {
        el.innerHTML = `<div class="empty-msg">${query ? t('profiles.people.no_results', 'No results') : (actionType === 'block' ? t('profiles.people.no_blocked', 'No blocked users') : t('profiles.people.no_muted', 'No muted users'))}</div>`;
        return;
    }
    list = filtered;
    const btnLabel = actionType === 'block' ? t('profiles.people.unblock', 'Unblock') : t('profiles.people.unmute', 'Unmute');
    const btnClass = 'vrcn-button-round vrcn-btn-danger';
    el.innerHTML = list.map(entry => {
        const uid = jsq(entry.targetUserId || '');
        const displayName = entry.targetDisplayName || entry.targetUserId || '?';
        // Use enriched image from API; fall back to friends cache, then letter
        const friend = vrcFriendsData.find(f => f.id === entry.targetUserId);
        const imageUrl = entry.image || (friend && friend.image) || '';
        const img = imageUrl
            ? `<div class="fav-friend-av" style="background-image:url('${cssUrl(imageUrl)}')"></div>`
            : `<div class="fav-friend-av fav-friend-av-letter">${esc(displayName[0].toUpperCase())}</div>`;
        const statusLine = getFriendStatusLine(friend);
        return `<div class="fav-friend-card" onclick="openFriendDetail('${uid}')">
            ${img}
            <div class="fav-friend-info">
                <div class="fav-friend-name">${esc(displayName)}</div>
                <div class="fav-friend-status">${statusLine}</div>
            </div>
            <button class="${btnClass}" style="margin-left:auto;flex-shrink:0;" onclick="event.stopPropagation();doUnmod('${uid}','${actionType}')">${btnLabel}</button>
        </div>`;
    }).join('');

    el.querySelectorAll('.fav-friend-card').forEach((card, index) => {
        const entry = list[index];
        const friend = vrcFriendsData.find(f => f.id === entry?.targetUserId);
        const statusEl = card.querySelector('.fav-friend-status');
        if (statusEl) statusEl.innerHTML = getFriendStatusLine(friend);
    });
}

function doUnmod(userId, type) {
    sendToCS({ action: type === 'block' ? 'vrcUnblock' : 'vrcUnmute', userId });
}


function renderFavFriends(list) {
    favFriendsData = Array.isArray(list) ? list : [];
    filterFavFriends();
}

function filterFavFriends() {
    const el = document.getElementById('favFriendsGrid');
    if (!el) return;
    const q = (document.getElementById('favFriendSearchInput')?.value || '').toLowerCase();
    const favIds = new Set(favFriendsData.map(f => f.favoriteId));
    let friends = vrcFriendsData.filter(f => favIds.has(f.id));
    if (q) friends = friends.filter(f => (f.displayName || '').toLowerCase().includes(q));
    if (!friends.length) {
        el.innerHTML = `<div class="empty-msg">${q ? t('profiles.people.no_favorites_match', 'No favorites match your search') : t('profiles.people.no_favorites', 'No favorite friends yet')}</div>`;
        return;
    }
    el.innerHTML = friends.map(f => {
        const img = f.image ? `<div class="fav-friend-av" style="background-image:url('${cssUrl(f.image)}')"></div>`
                            : `<div class="fav-friend-av fav-friend-av-letter">${esc((f.displayName || '?')[0].toUpperCase())}</div>`;
        const uid = jsq(f.id);
        const statusLine = getFriendStatusLine(f);
        return `<div class="fav-friend-card" onclick="openFriendDetail('${uid}')">
            ${img}
            <div class="fav-friend-info">
                <div class="fav-friend-name">${esc(f.displayName)}</div>
                <div class="fav-friend-status">${statusLine}</div>
            </div>
        </div>`;
    }).join('');

    el.querySelectorAll('.fav-friend-card').forEach((card, index) => {
        const statusEl = card.querySelector('.fav-friend-status');
        if (statusEl) statusEl.innerHTML = getFriendStatusLine(friends[index]);
    });
}

