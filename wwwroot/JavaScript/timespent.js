/* === Time Spent - Tab 16 ===
 * Shows time spent in worlds and with persons, derived from instance_join timeline events.
 */

let _tsView = 'worlds';
let _tsData = null;
let _tsLoading = false;
let _tsInited = false;
let _tsWorldQuery = '';
let _tsPersonQuery = '';

document.documentElement.addEventListener('tabchange', () => {
    const tab16 = document.getElementById('tab16');
    if (tab16 && tab16.classList.contains('active') && !_tsInited) {
        _tsInited = true;
        tsLoad();
    }
});

function tsShortUnit(key, fallback) {
    return t(`timespent.unit.${key}`, fallback);
}

function tsFmtTime(seconds) {
    if (seconds < 1) return `0${tsShortUnit('second_short', 's')}`;

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
        return `${days}${tsShortUnit('day_short', 'd')} ${hours}${tsShortUnit('hour_short', 'h')} ${minutes}${tsShortUnit('minute_short', 'm')} ${secs}${tsShortUnit('second_short', 's')}`;
    }
    if (hours > 0) {
        return `${hours}${tsShortUnit('hour_short', 'h')} ${minutes}${tsShortUnit('minute_short', 'm')} ${secs}${tsShortUnit('second_short', 's')}`;
    }
    if (minutes > 0) {
        return `${minutes}${tsShortUnit('minute_short', 'm')} ${secs}${tsShortUnit('second_short', 's')}`;
    }
    return `${secs}${tsShortUnit('second_short', 's')}`;
}

function tsFmtTimeDH(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}${tsShortUnit('day_short', 'd')} ${hours}${tsShortUnit('hour_short', 'h')}`;
    return `${hours}${tsShortUnit('hour_short', 'h')}`;
}

function tsFmtTimeLong(seconds) {
    return tsFmtTime(seconds);
}

function tsRefresh() {
    _tsData = null;
    tsLoad();
}

function tsLoad() {
    if (_tsLoading) return;
    _tsLoading = true;

    const icon = document.getElementById('tsRefreshIcon');
    if (icon) icon.classList.add('ts-spin');

    const list = document.getElementById('tsList');
    if (list) {
        list.innerHTML = `<div class="ts-loading"><span class="msi ts-spin" style="font-size:22px;color:var(--accent);">sync</span><span style="font-size:12px;color:var(--tx2);">${t('timespent.loading', 'Calculating stats...')}</span></div>`;
    }

    const summary = document.getElementById('tsSummary');
    if (summary) summary.innerHTML = '';

    sendToCS({ action: 'vrcGetTimeSpent' });
}

function tsOnData(payload) {
    _tsLoading = false;
    _tsData = payload;

    const icon = document.getElementById('tsRefreshIcon');
    if (icon) icon.classList.remove('ts-spin');

    const friendIds = new Set((vrcFriendsData || []).map(friend => friend.id));
    (_tsData.persons || []).forEach(person => {
        person.isFriend = friendIds.has(person.userId);
    });

    tsRender();
}

function tsSetView(view) {
    _tsView = view;
    document.getElementById('tsBtnWorlds')?.classList.toggle('active', view === 'worlds');
    document.getElementById('tsBtnPersons')?.classList.toggle('active', view === 'persons');
    if (_tsData) tsRender();
    else tsLoad();
}

function tsRender() {
    if (!_tsData) return;

    const tab = document.getElementById('tab16');
    if (!tab || !tab.classList.contains('active')) return;

    if (_tsView === 'worlds') tsRenderWorlds();
    else tsRenderPersons();
}

function tsRenderWorlds() {
    const worlds = _tsData.worlds || [];
    const totalSec = _tsData.totalSeconds || 0;
    const topWorld = worlds[0];
    const summary = document.getElementById('tsSummary');
    if (!summary) return;

    summary.innerHTML = `
        <div class="ts-stat-row">
            <div class="ts-stat">
                <span class="msi ts-stat-icon">schedule</span>
                <div class="ts-stat-val">${tsFmtTimeDH(totalSec)}</div>
                <div class="ts-stat-label">${t('timespent.summary.total_vrchat_time', 'Total VRChat Time')}</div>
            </div>
            <div class="ts-stat">
                <span class="msi ts-stat-icon">travel_explore</span>
                <div class="ts-stat-val">${worlds.length}</div>
                <div class="ts-stat-label">${t('timespent.summary.unique_worlds', 'Unique Worlds')}</div>
            </div>
            <div class="ts-stat">
                <span class="msi ts-stat-icon">star</span>
                <div class="ts-stat-val">${topWorld ? esc(topWorld.worldName || t('timespent.unknown_world', 'Unknown')) : '-'}</div>
                <div class="ts-stat-label">${t('timespent.summary.favourite_world', 'Favourite World')}</div>
            </div>
            <div class="ts-stat">
                <span class="msi ts-stat-icon">login</span>
                <div class="ts-stat-val">${worlds.reduce((sum, world) => sum + world.visits, 0)}</div>
                <div class="ts-stat-label">${t('timespent.summary.total_joins', 'Total Joins')}</div>
            </div>
        </div>
        <div class="search-bar-row ts-search-bar">
            <span class="msi search-ico">search</span>
            <input type="text" class="search-input" placeholder="${esc(t('timespent.search.worlds', 'Filter worlds...'))}"
                   value="${_tsWorldQuery.replace(/"/g, '&quot;')}"
                   oninput="_tsWorldQuery=this.value;tsRenderWorldItems()">
        </div>`;

    tsRenderWorldItems();
}

function tsRenderWorldItems() {
    const worlds = _tsData?.worlds || [];
    const query = _tsWorldQuery.toLowerCase().trim();
    const list = query ? worlds.filter(world => (world.worldName || '').toLowerCase().includes(query)) : worlds;
    const tsList = document.getElementById('tsList');
    if (!tsList) return;

    if (worlds.length === 0) {
        tsList.innerHTML = `<div class="ts-empty"><span class="msi" style="font-size:28px;color:var(--tx3);">travel_explore</span><div>${t('timespent.empty.no_world_data', 'No world data yet.')}</div></div>`;
        return;
    }

    if (list.length === 0) {
        tsList.innerHTML = `<div class="ts-empty"><span class="msi" style="font-size:28px;color:var(--tx3);">search_off</span><div>${t('timespent.empty.no_world_match', 'No worlds match your search.')}</div></div>`;
        return;
    }

    const maxSec = list[0].seconds || 1;
    const rows = list.map(world => {
        const pct = Math.round((world.seconds / maxSec) * 100);
        const rank = worlds.indexOf(world) + 1;
        const thumb = world.worldThumb
            ? `<img class="ts-item-thumb" src="${esc(world.worldThumb)}" onerror="this.style.display='none'">`
            : `<div class="ts-item-thumb ts-thumb-placeholder"><span class="msi" style="font-size:18px;color:var(--tx3);">travel_explore</span></div>`;
        const click = world.worldId ? `onclick="openWorldSearchDetail('${esc(world.worldId)}')" style="cursor:pointer"` : '';
        const visits = tf(`timespent.visit.${world.visits === 1 ? 'one' : 'other'}`, { count: world.visits }, `${world.visits} visit${world.visits === 1 ? '' : 's'}`);

        return `
        <div class="ts-item" ${click}>
            <div class="ts-item-rank">#${rank}</div>
            ${thumb}
            <div class="ts-item-body">
                <div class="ts-item-name">${esc(world.worldName || t('timespent.unknown_world_full', 'Unknown World'))}</div>
                <div class="ts-item-meta">
                    <span class="msi" style="font-size:12px;color:var(--tx3);">login</span>
                    <span>${visits}</span>
                </div>
                <div class="ts-bar-wrap">
                    <div class="ts-bar" style="width:${pct}%"></div>
                </div>
            </div>
            <div class="ts-item-time">${tsFmtTime(world.seconds)}</div>
        </div>`;
    }).join('');

    tsList.innerHTML = `<div class="ts-items">${rows}</div>`;
}

function tsRenderPersons() {
    const persons = _tsData.persons || [];
    const friendCount = persons.filter(person => person.isFriend).length;
    const strangerCount = persons.length - friendCount;
    const totalWithOthers = persons.reduce((sum, person) => sum + person.seconds, 0);
    const topFriend = persons.find(person => person.isFriend);
    const topStranger = persons.find(person => !person.isFriend);
    const summary = document.getElementById('tsSummary');
    if (!summary) return;

    summary.innerHTML = `
        <div class="ts-stat-row">
            <div class="ts-stat">
                <span class="msi ts-stat-icon">group</span>
                <div class="ts-stat-val">${persons.length}</div>
                <div class="ts-stat-label">${t('timespent.summary.unique_people', 'Unique People')}</div>
            </div>
            <div class="ts-stat">
                <span class="msi ts-stat-icon" style="color:var(--ok);">person</span>
                <div class="ts-stat-val">${friendCount}</div>
                <div class="ts-stat-label">${t('timespent.summary.friends', 'Friends')}</div>
            </div>
            <div class="ts-stat">
                <span class="msi ts-stat-icon" style="color:var(--cyan);">person_outline</span>
                <div class="ts-stat-val">${strangerCount}</div>
                <div class="ts-stat-label">${t('timespent.summary.others', 'Others')}</div>
            </div>
            <div class="ts-stat">
                <span class="msi ts-stat-icon">schedule</span>
                <div class="ts-stat-val">${tsFmtTimeDH(totalWithOthers)}</div>
                <div class="ts-stat-label">${t('timespent.summary.total_social_time', 'Total Social Time')}</div>
            </div>
        </div>
        ${topFriend || topStranger ? `
        <div class="ts-highlights">
            ${topFriend ? `<div class="ts-highlight ts-hl-friend">
                <span class="msi" style="font-size:13px;">favorite</span>
                <span>${t('timespent.highlight.friend', 'Most time with friend')}: <strong>${esc(topFriend.displayName)}</strong> - ${tsFmtTimeLong(topFriend.seconds)}</span>
            </div>` : ''}
            ${topStranger ? `<div class="ts-highlight ts-hl-stranger">
                <span class="msi" style="font-size:13px;">person_add</span>
                <span>${t('timespent.highlight.new_person', 'Most time with someone new')}: <strong>${esc(topStranger.displayName)}</strong> - ${tsFmtTimeLong(topStranger.seconds)}</span>
            </div>` : ''}
        </div>` : ''}
        <div class="search-bar-row ts-search-bar">
            <span class="msi search-ico">search</span>
            <input type="text" class="search-input" placeholder="${esc(t('timespent.search.persons', 'Filter persons...'))}"
                   value="${_tsPersonQuery.replace(/"/g, '&quot;')}"
                   oninput="_tsPersonQuery=this.value;tsRenderPersonItems()">
        </div>`;

    tsRenderPersonItems();
}

function tsRenderPersonItems() {
    const persons = _tsData?.persons || [];
    const query = _tsPersonQuery.toLowerCase().trim();
    const list = query ? persons.filter(person => (person.displayName || person.userId || '').toLowerCase().includes(query)) : persons;
    const tsList = document.getElementById('tsList');
    if (!tsList) return;

    if (persons.length === 0) {
        tsList.innerHTML = `<div class="ts-empty"><span class="msi" style="font-size:28px;color:var(--tx3);">group</span><div>${t('timespent.empty.no_person_data', 'No person data yet.')}</div></div>`;
        return;
    }

    if (list.length === 0) {
        tsList.innerHTML = `<div class="ts-empty"><span class="msi" style="font-size:28px;color:var(--tx3);">search_off</span><div>${t('timespent.empty.no_person_match', 'No persons match your search.')}</div></div>`;
        return;
    }

    const maxSec = list[0].seconds || 1;
    const rows = list.map(person => {
        const pct = Math.round((person.seconds / maxSec) * 100);
        const rank = persons.indexOf(person) + 1;
        const isFriend = person.isFriend;
        const avatar = person.image
            ? `<img class="ts-item-avatar" src="${esc(person.image)}" onerror="this.style.display='none'">`
            : `<div class="ts-item-avatar ts-avatar-placeholder"><span class="msi" style="font-size:16px;color:var(--tx3);">person</span></div>`;
        const badge = isFriend
            ? `<span class="vrcn-badge ok">${esc(t('timespent.badge.friend', 'Friend'))}</span>`
            : `<span class="vrcn-badge cyan">${esc(t('timespent.badge.new', 'New'))}</span>`;
        const encounters = tf(`timespent.encounter.${person.meets === 1 ? 'one' : 'other'}`, { count: person.meets }, `${person.meets} encounter${person.meets === 1 ? '' : 's'}`);

        return `
        <div class="ts-item" onclick="openFriendDetail('${esc(person.userId)}')" style="cursor:pointer">
            <div class="ts-item-rank">#${rank}</div>
            <div class="ts-avatar-wrap">${avatar}</div>
            <div class="ts-item-body">
                <div class="ts-item-name">${esc(person.displayName || person.userId)} ${badge}</div>
                <div class="ts-item-meta">
                    <span class="msi" style="font-size:12px;color:var(--tx3);">handshake</span>
                    <span>${encounters}</span>
                </div>
                <div class="ts-bar-wrap">
                    <div class="ts-bar ${isFriend ? 'ts-bar-friend' : 'ts-bar-stranger'}" style="width:${pct}%"></div>
                </div>
            </div>
            <div class="ts-item-time">${tsFmtTime(person.seconds)}</div>
        </div>`;
    }).join('');

    tsList.innerHTML = `<div class="ts-items">${rows}</div>`;
}

function rerenderTimeSpentTranslations() {
    if (_tsData) {
        tsRender();
        return;
    }

    const list = document.getElementById('tsList');
    if (!list) return;

    if (_tsLoading) {
        list.innerHTML = `<div class="ts-loading"><span class="msi ts-spin" style="font-size:22px;color:var(--accent);">sync</span><span style="font-size:12px;color:var(--tx2);">${t('timespent.loading', 'Calculating stats...')}</span></div>`;
        return;
    }

    list.innerHTML = `<div class="ts-empty"><span class="msi" style="font-size:28px;color:var(--tx3);">schedule</span><div>${t('timespent.empty.no_session', 'No session data yet.')}<br><span style="font-size:11px;">${t('timespent.empty.no_session_hint', 'Join some worlds in VRChat to see stats.')}</span></div></div>`;
}

document.documentElement.addEventListener('languagechange', rerenderTimeSpentTranslations);
