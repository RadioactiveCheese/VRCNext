/* === Join State === */
function joinStateBadge(js) {
    const map = {
        open:    { label: 'Open',           cls: 'public'  },
        closed:  { label: 'Closed',         cls: 'private' },
        invite:  { label: 'Invite Only',    cls: 'friends' },
        request: { label: 'Request Invite', cls: 'group'   },
    };
    const m = map[js] || { label: js || '?', cls: 'hidden' };
    return `<span class="vrcn-badge ${m.cls}">${esc(m.label)}</span>`;
}

/* === My Groups === */
function _renderGroupListCard(g) {
    return `<div class="s-card" onclick="openGroupDetail('${esc(g.id)}')">
        <div class="s-card-img" style="background-image:url('${cssUrl(g.bannerUrl||g.iconUrl||'')}')"><div class="s-card-icon" style="background-image:url('${cssUrl(g.iconUrl||'')}')"></div></div>
        <div class="s-card-body"><div class="s-card-title">${esc(g.name)}</div><div class="s-card-sub" style="display:flex;align-items:center;gap:4px;">${esc(g.shortCode)} · <span class="msi" style="font-size:11px;">group</span> ${g.memberCount}${g.joinState ? `<span style="margin-left:auto;">${joinStateBadge(g.joinState)}</span>` : ''}</div></div></div>`;
}

function setGroupFilter(filter) {
    document.getElementById('groupFilterMine').classList.toggle('active', filter === 'mine');
    document.getElementById('groupFilterSearch').classList.toggle('active', filter === 'search');
    document.getElementById('groupMineArea').style.display   = filter === 'mine'   ? '' : 'none';
    document.getElementById('groupSearchArea').style.display = filter === 'search' ? '' : 'none';
    if (filter === 'mine' && !myGroupsLoaded) loadMyGroups();
    if (filter === 'search') document.getElementById('searchGroupsInput')?.focus();
}

function filterMyGroups() {
    const q = (document.getElementById('filterGroupsInput')?.value || '').toLowerCase();
    const el = document.getElementById('myGroupsGrid');
    if (!el) return;
    const filtered = q
        ? myGroups.filter(g => (g.name||'').toLowerCase().includes(q) || (g.shortCode||'').toLowerCase().includes(q))
        : myGroups;
    el.innerHTML = filtered.length
        ? filtered.map(_renderGroupListCard).join('')
        : `<div class="empty-msg">${q ? 'No groups match' : 'No groups joined'}</div>`;
}

function loadMyGroups() {
    sendToCS({ action: 'vrcGetMyGroups' });
}

function refreshGroups() {
    const btn = document.getElementById('groupsRefreshBtn');
    if (btn) { btn.disabled = true; btn.querySelector('.msi').textContent = 'hourglass_empty'; }
    sendToCS({ action: 'vrcGetMyGroups' });
}

function renderMyGroups(list) {
    const btn = document.getElementById('groupsRefreshBtn');
    if (btn) { btn.disabled = false; btn.querySelector('.msi').textContent = 'refresh'; }
    myGroups = list || [];
    myGroupsLoaded = true;
    filterMyGroups();
}

function openGroupDetail(groupId) {
    const el = document.getElementById('detailModalContent');
    el.innerHTML = sk('detail');
    document.getElementById('modalDetail').style.display = 'flex';
    sendToCS({ action: 'vrcGetGroup', groupId });
}

function renderGroupDetail(g) {
    window._currentGroupDetail = { id: g.id, canKick: g.canKick === true, canBan: g.canBan === true, canManageRoles: g.canManageRoles === true, canAssignRoles: g.canAssignRoles === true, languages: g.languages || [], links: g.links || [], joinState: g.joinState || '', roles: g.roles || [] };
    window._gdBannedLoaded = false;
    window._gdMemberRoleIds = {};
    const el = document.getElementById('detailModalContent');
    const canEdit = g.canEdit === true;
    const gidJs  = jsq(g.id);
    const banner = g.bannerUrl || g.iconUrl || '';
    const bannerEditBtn = canEdit ? `<button class="myp-edit-btn" style="position:absolute;top:8px;right:8px;z-index:2;" onclick="openImagePicker('group-banner','${gidJs}')" title="Change banner"><span class="msi" style="font-size:13px;">edit</span></button>` : '';
    const bannerHtml = banner
        ? `<div class="fd-banner">${bannerEditBtn}<img src="${banner}" onerror="this.parentElement.style.display='none'"><div class="fd-banner-fade"></div></div>`
        : (canEdit ? `<div style="display:flex;justify-content:flex-end;padding:4px 0 2px 0;"><button class="myp-edit-btn" onclick="openImagePicker('group-banner','${gidJs}')" title="Add banner"><span class="msi" style="font-size:13px;">edit</span><span style="font-size:11px;margin-left:3px;">Banner</span></button></div>` : '');

    // Header
    const iconEditBtn = canEdit ? `<button class="myp-edit-btn" style="position:absolute;bottom:-4px;right:-4px;padding:2px;min-width:0;width:18px;height:18px;display:flex;align-items:center;justify-content:center;" onclick="openImagePicker('group-icon','${gidJs}')" title="Change icon"><span class="msi" style="font-size:11px;">edit</span></button>` : '';
    const iconHtml = g.iconUrl
        ? `<div style="position:relative;display:inline-block;flex-shrink:0;"><img class="fd-avatar" src="${g.iconUrl}" onerror="this.style.display='none'">${iconEditBtn}</div>`
        : (canEdit ? `<div style="position:relative;display:inline-block;flex-shrink:0;"><div class="fd-avatar" style="display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:var(--tx3);">${esc((g.name||'?')[0])}</div>${iconEditBtn}</div>` : '');
    const headerHtml = `<div class="fd-content${banner ? ' fd-has-banner' : ''}"><div class="fd-header">${iconHtml}<div style="flex:1;min-width:0;"><div class="fd-name">${esc(g.name)}</div><div class="fd-status">${esc(g.shortCode)} · ${g.memberCount} members</div></div><span id="ggrpHeaderBadge" style="margin-left:auto;flex-shrink:0;">${g.joinState ? joinStateBadge(g.joinState) : ''}</span></div>`;

    // Actions - moved to bottom bar
    const canPost  = g.canPost === true;
    const canEvent = g.canEvent === true;
    const createPostBtn = (g.isJoined && canPost)
        ? `<button class="vrcn-button-round vrcn-btn-join" onclick="openGroupPostModal('${esc(g.id)}')"><span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">edit</span>Post</button>`
        : '';
    const createEventBtn = (g.isJoined && canEvent)
        ? `<button class="vrcn-button-round vrcn-btn-join" onclick="openGroupEventModal('${esc(g.id)}')"><span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">event</span>Events</button>`
        : '';
    const leaveJoinBtn = g.isJoined
        ? `<button class="vrcn-button-round vrcn-btn-danger" onclick="sendToCS({action:'vrcLeaveGroup',groupId:'${esc(g.id)}'});document.getElementById('modalDetail').style.display='none';"><span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">logout</span>Leave Group</button>`
        : `<button class="vrcn-button-round vrcn-btn-join" onclick="sendToCS({action:'vrcJoinGroup',groupId:'${esc(g.id)}'});document.getElementById('modalDetail').style.display='none';"><span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">group_add</span>Join Group</button>`;

    // Tab: Info
    const gid_e = esc(g.id);
    const grpLangs = (g.languages || []);
    const grpLinks = (g.links || []).filter(Boolean);
    const grpLangsViewHtml = grpLangs.length
        ? `<div class="fd-lang-tags">${grpLangs.map(l => `<span class="vrcn-badge">${esc(LANG_MAP['language_'+l] || l.toUpperCase())}</span>`).join('')}</div>`
        : `<div class="myp-empty">No languages set</div>`;
    const grpLinksViewHtml = grpLinks.length
        ? `<div class="fd-bio-links">${grpLinks.map(url => renderBioLink(url)).join('')}</div>`
        : `<div class="myp-empty">No links added</div>`;
    const infoTab = `
        <div class="myp-section">
            <div class="myp-section-header">
                <span class="myp-section-title">Description</span>
                ${canEdit ? `<button class="myp-edit-btn" onclick="editGroupField('desc')"><span class="msi" style="font-size:14px;">edit</span></button>` : ''}
            </div>
            <div id="gdescDescView">
                ${g.description ? `<div class="fd-bio">${esc(g.description)}</div>` : '<div class="myp-empty">No description</div>'}
            </div>
            ${canEdit ? `<div id="gdescDescEdit" style="display:none;">
                <textarea id="gdescDescInput" class="myp-textarea" rows="4" maxlength="2000" placeholder="Group description...">${esc(g.description||'')}</textarea>
                <div class="myp-edit-actions">
                    <button class="vrcn-button" onclick="cancelGroupField('desc')">Cancel</button>
                    <button class="vrcn-button vrcn-btn-primary" onclick="saveGroupField('desc','${gid_e}')">Save</button>
                </div>
            </div>` : ''}
        </div>
        <div class="myp-section">
            <div class="myp-section-header">
                <span class="myp-section-title">Links</span>
                ${canEdit ? `<button class="myp-edit-btn" onclick="editGroupField('links')"><span class="msi" style="font-size:14px;">edit</span></button>` : ''}
            </div>
            <div id="ggrpLinksView">${grpLinksViewHtml}</div>
            ${canEdit ? `<div id="ggrpLinksEdit" style="display:none;">
                <div id="ggrpLinksInputs"></div>
                <div class="myp-edit-actions">
                    <button class="vrcn-button" onclick="cancelGroupField('links')">Cancel</button>
                    <button class="vrcn-button vrcn-btn-primary" onclick="saveGroupField('links','${gid_e}')">Save</button>
                </div>
            </div>` : ''}
        </div>
        <div class="myp-section">
            <div class="myp-section-header">
                <span class="myp-section-title">Languages</span>
                ${canEdit ? `<button class="myp-edit-btn" onclick="editGroupField('langs')"><span class="msi" style="font-size:14px;">edit</span></button>` : ''}
            </div>
            <div id="ggrpLangsView">${grpLangsViewHtml}</div>
            ${canEdit ? `<div id="ggrpLangsEdit" style="display:none;">
                <div id="ggrpLangsChips" class="myp-lang-chips"></div>
                <div class="myp-lang-add-row">
                    <select id="ggrpLangSelect" class="myp-lang-select"><option value="">Add language...</option></select>
                    <button class="myp-add-lang-btn" onclick="addGrpLanguage()"><span class="msi" style="font-size:15px;">add</span></button>
                </div>
                <div class="myp-edit-actions">
                    <button class="vrcn-button" onclick="cancelGroupField('langs')">Cancel</button>
                    <button class="vrcn-button vrcn-btn-primary" onclick="saveGroupField('langs','${gid_e}')">Save</button>
                </div>
            </div>` : ''}
        </div>
        <div class="myp-section">
            <div class="myp-section-header">
                <span class="myp-section-title">Rules</span>
                ${canEdit ? `<button class="myp-edit-btn" onclick="editGroupField('rules')"><span class="msi" style="font-size:14px;">edit</span></button>` : ''}
            </div>
            <div id="gdescRulesView">
                ${g.rules ? `<div style="font-size:11px;color:var(--tx3);padding:8px;background:var(--bg-input);border-radius:8px;max-height:120px;overflow-y:auto;white-space:pre-wrap;">${esc(g.rules)}</div>` : '<div class="myp-empty">No rules set</div>'}
            </div>
            ${canEdit ? `<div id="gdescRulesEdit" style="display:none;">
                <textarea id="gdescRulesInput" class="myp-textarea" rows="5" maxlength="2000" placeholder="Group rules...">${esc(g.rules||'')}</textarea>
                <div class="myp-edit-actions">
                    <button class="vrcn-button" onclick="cancelGroupField('rules')">Cancel</button>
                    <button class="vrcn-button vrcn-btn-primary" onclick="saveGroupField('rules','${gid_e}')">Save</button>
                </div>
            </div>` : ''}
        </div>
        <div class="myp-section">
            <div class="myp-section-header">
                <span class="myp-section-title">Open to new Members</span>
                ${canEdit ? `<button class="myp-edit-btn" onclick="editGroupField('joinState')"><span class="msi" style="font-size:14px;">edit</span></button>` : ''}
            </div>
            <div id="ggrpJoinStateView">
                ${g.joinState ? joinStateBadge(g.joinState) : '<div class="myp-empty">Not set</div>'}
            </div>
            ${canEdit ? `<div id="ggrpJoinStateEdit" style="display:none;">
                <select id="ggrpJoinStateSelect" class="myp-lang-select" style="width:100%;margin-bottom:6px;">
                    <option value="open"    ${g.joinState==='open'    ? 'selected' : ''}>Open</option>
                    <option value="closed"  ${g.joinState==='closed'  ? 'selected' : ''}>Closed</option>
                    <option value="invite"  ${g.joinState==='invite'  ? 'selected' : ''}>Invite Only</option>
                    <option value="request" ${g.joinState==='request' ? 'selected' : ''}>Request Invite</option>
                </select>
                <div class="myp-edit-actions">
                    <button class="vrcn-button" onclick="cancelGroupField('joinState')">Cancel</button>
                    <button class="vrcn-button vrcn-btn-primary" onclick="saveGroupField('joinState','${gid_e}')">Save</button>
                </div>
            </div>` : ''}
        </div>`;

    // Tab: Posts
    const posts = g.posts || [];
    let postsTab = '';
    if (posts.length === 0) {
        postsTab = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">No posts</div>';
    } else {
        posts.forEach((p, i) => {
            const date = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '';
            const imgHtml = p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%;border-radius:6px;margin-top:8px;" onerror="this.style.display='none'">` : '';
            const fullText = p.text || '';
            const isLong = fullText.length > 120;
            const preview = isLong ? fullText.slice(0, 120) + '...' : fullText;
            const pid = esc(p.id || ''), gid = esc(g.id || '');
            const delBtn = (canPost && p.id)
                ? `<button class="gd-post-del" onclick="deleteGroupPost('${gid}','${pid}',this)" title="Delete post"><span class="msi">delete</span></button>`
                : '';
            postsTab += `<div class="fd-group-card" data-post-id="${pid}" style="display:block;cursor:default;padding:12px;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                    <div style="font-size:13px;font-weight:600;color:var(--tx0);flex:1;">${esc(p.title || 'Untitled')}</div>
                    ${delBtn}
                </div>
                <div style="font-size:10px;color:var(--tx3);margin-bottom:6px;">${date}${p.visibility ? ' · ' + esc(p.visibility) : ''}</div>
                <div class="gd-post-text" id="gpost${i}" data-full="${esc(fullText).replace(/"/g,'&quot;')}" data-preview="${esc(preview).replace(/"/g,'&quot;')}" style="font-size:12px;color:var(--tx2);line-height:1.4;">${esc(preview)}</div>
                ${isLong ? `<div style="margin-top:4px;"><span class="gd-expand" onclick="toggleGPost(${i})">Show more</span></div>` : ''}
                ${imgHtml}
            </div>`;
        });
    }

    // Tab: Events
    const events = g.groupEvents || [];
    let eventsTab = '';
    if (events.length === 0) {
        eventsTab = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">No events</div>';
    } else {
        events.forEach(e => {
            const startD = e.startsAt ? new Date(e.startsAt) : null;
            const endD   = e.endsAt   ? new Date(e.endsAt)   : null;
            const timeStr = startD && !isNaN(startD)
                ? startD.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' }) +
                  (endD && !isNaN(endD) ? ' – ' + endD.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' }) : '')
                : '';
            const dateStr = startD && !isNaN(startD)
                ? startD.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' })
                : '';
            const imgHtml = e.imageUrl ? `<img src="${e.imageUrl}" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;" onerror="this.style.display='none'">` : '';
            const badge = e.accessType ? `<span style="font-size:9px;padding:1px 6px;border-radius:4px;background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--accent-lt);border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);margin-left:6px;">${esc(e.accessType)}</span>` : '';
            const gid = esc(e.ownerId || g.id || '');
            const cid = esc(e.id || '');
            const delEvtBtn = (canEvent && e.id)
                ? `<button class="gd-post-del" onclick="event.stopPropagation();deleteGroupEvent('${esc(g.id)}','${cid}',this)" title="Delete event"><span class="msi">delete</span></button>`
                : '';
            eventsTab += `<div class="fd-group-card" data-event-id="${cid}" style="display:block;cursor:pointer;padding:12px;" onclick="openEventDetail('${gid}','${cid}')">
                ${imgHtml}
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                    <div style="font-size:13px;font-weight:600;color:var(--tx0);">${esc(e.title || 'Untitled Event')}${badge}</div>
                    ${delEvtBtn}
                </div>
                <div style="font-size:10px;color:var(--tx3);margin:2px 0 4px;">${dateStr}${timeStr ? ' · ' + timeStr : ''}</div>
                ${e.description ? `<div style="font-size:12px;color:var(--tx2);line-height:1.4;">${esc(e.description)}</div>` : ''}
            </div>`;
        });
    }

    // Tab: Instances
    const instances = g.groupInstances || [];
    let instancesTab = '';
    if (instances.length === 0) {
        instancesTab = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">No active instances</div>';
    } else {
        instances.forEach(inst => {
            const thumbHtml = inst.worldThumb ? `<img style="width:48px;height:48px;border-radius:8px;object-fit:cover;flex-shrink:0;" src="${inst.worldThumb}" onerror="this.style.display='none'">` : '';
            const users = inst.userCount > 0 ? (inst.capacity > 0 ? `${inst.userCount}/${inst.capacity}` : inst.userCount + ' users') : '';
            const loc = (inst.location || '').replace(/'/g, "\\'");
            instancesTab += `<div class="fd-group-card" onclick="sendToCS({action:'vrcJoinFriend',location:'${loc}'})">
                ${thumbHtml}<div class="fd-group-card-info"><div class="fd-group-card-name">${esc(inst.worldName || 'Unknown World')}</div><div class="fd-group-card-meta">${users}</div></div>
                <button class="vrcn-button-round vrcn-btn-join" onclick="event.stopPropagation();sendToCS({action:'vrcJoinFriend',location:'${loc}'})"><span class="msi" style="font-size:14px;">login</span>Join</button>
            </div>`;
        });
    }

    // Tab: Gallery
    const gallery = g.galleryImages || [];
    let galleryTab = '';
    if (gallery.length === 0) {
        galleryTab = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">No gallery images</div>';
    } else {
        galleryTab = '<div class="gd-gallery-grid">';
        gallery.forEach(img => {
            if (img.imageUrl) galleryTab += `<img class="gd-gallery-img" src="${img.imageUrl}" onclick="openLightbox('${jsq(img.imageUrl)}')" onerror="this.style.display='none'">`;
        });
        galleryTab += '</div>';
    }

    // Tab: Members (paginated)
    const members = g.groupMembers || [];
    let membersTab = `<div class="search-bar-row" style="margin-bottom:6px;">
        <span class="msi search-ico">search</span>
        <input id="gdMembersSearch" type="text" class="vrcn-input" placeholder="Search users by name... hit enter" style="background:var(--bg-input);" onkeydown="if(event.key==='Enter')searchGroupMembers()">
    </div>`;
    membersTab += '<div id="gdMembersList" style="display:grid;grid-template-columns:1fr 1fr;column-gap:6px;">';
    if (members.length === 0) {
        membersTab += '<div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">No members</div>';
    } else {
        members.forEach(m => { membersTab += renderGroupMemberCard(m); });
    }
    membersTab += '</div>';
    membersTab += `<div id="gdMembersLoadMore" style="text-align:center;padding:12px;">` +
        (members.length >= 50
            ? `<button class="vrcn-button" onclick="loadMoreGroupMembers()">Load More Members</button>`
            : (members.length > 0 ? `<div style="font-size:11px;color:var(--tx3);">All members loaded</div>` : '')) +
        `</div>`;
    // Store group id + offset for pagination
    window._gdMembersGroupId = g.id;
    window._gdMembersOffset = members.length;
    window._gdMembersSearchActive = false;

    // Tabs
    const tabs = [
        { key: 'info', label: 'Info' },
        { key: 'posts', label: 'Posts' },
        { key: 'events', label: 'Events' },
        { key: 'instances', label: 'Live' },
        { key: 'gallery', label: 'Gallery' },
        { key: 'members', label: 'Members' },
    ];
    if (g.canManageRoles) tabs.push({ key: 'roles', label: 'Roles' });
    if (g.canBan)         tabs.push({ key: 'banned', label: 'Banned' });
    const tabsHtml = `<div class="fd-tabs gd-tabs">${tabs.map((t,i) => `<button class="fd-tab${i===0?' active':''}" onclick="switchGdTab('${t.key}',this)">${t.label}</button>`).join('')}</div>`;

    const rolesTab   = g.canManageRoles ? _buildRolesTab(g) : '';
    const bannedTab  = g.canBan ? _buildBannedTab() : '';

    el.innerHTML = `${bannerHtml}${headerHtml}${tabsHtml}
        <div id="gdTabInfo">${infoTab}</div>
        <div id="gdTabPosts" style="display:none;">${postsTab}</div>
        <div id="gdTabEvents" style="display:none;">${eventsTab}</div>
        <div id="gdTabInstances" style="display:none;">${instancesTab}</div>
        <div id="gdTabGallery" style="display:none;">${galleryTab}</div>
        <div id="gdTabMembers" style="display:none;">${membersTab}</div>
        ${g.canManageRoles ? `<div id="gdTabRoles" style="display:none;">${rolesTab}</div>` : ''}
        ${g.canBan ? `<div id="gdTabBanned" style="display:none;">${bannedTab}</div>` : ''}
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;"><div style="display:flex;gap:8px;">${createPostBtn}${createEventBtn}${leaveJoinBtn}</div><button class="vrcn-button-round" onclick="document.getElementById('modalDetail').style.display='none'">Close</button></div>
    </div>`;
}

function renderGroupMemberCard(m) {
    if (m.id && m.roleIds) {
        if (!window._gdMemberRoleIds) window._gdMemberRoleIds = {};
        window._gdMemberRoleIds[m.id] = m.roleIds;
    }
    return renderProfileItem(m, `closeDetailModal();openFriendDetail('${jsq(m.id || '')}')`);
}

const _grpFieldIds = {
    desc:      { view: 'gdescDescView',       edit: 'gdescDescEdit'       },
    rules:     { view: 'gdescRulesView',      edit: 'gdescRulesEdit'      },
    links:     { view: 'ggrpLinksView',       edit: 'ggrpLinksEdit'       },
    langs:     { view: 'ggrpLangsView',       edit: 'ggrpLangsEdit'       },
    joinState: { view: 'ggrpJoinStateView',   edit: 'ggrpJoinStateEdit'   },
};

function editGroupField(field) {
    Object.keys(_grpFieldIds).forEach(f => {
        if (f === field) return;
        const ids = _grpFieldIds[f];
        const v = document.getElementById(ids.view); if (v) v.style.display = '';
        const e = document.getElementById(ids.edit); if (e) e.style.display = 'none';
    });
    const ids = _grpFieldIds[field];
    if (!ids) return;
    document.getElementById(ids.view).style.display = 'none';
    document.getElementById(ids.edit).style.display = '';
    if (field === 'desc')  document.getElementById('gdescDescInput')?.focus();
    if (field === 'rules') document.getElementById('gdescRulesInput')?.focus();
    if (field === 'links') _renderGrpLinksInputs();
    if (field === 'langs') _renderGrpLangsEdit();
}

function cancelGroupField(field) {
    const ids = _grpFieldIds[field];
    if (!ids) return;
    document.getElementById(ids.view).style.display = '';
    document.getElementById(ids.edit).style.display = 'none';
}

function saveGroupField(field, groupId) {
    const ids = _grpFieldIds[field];
    const saveBtn = document.querySelector(`#${ids.edit} .vrcn-btn-primary`);
    if (saveBtn) saveBtn.disabled = true;

    if (field === 'desc') {
        sendToCS({ action: 'vrcUpdateGroup', groupId, description: document.getElementById('gdescDescInput')?.value ?? '' });
    } else if (field === 'rules') {
        sendToCS({ action: 'vrcUpdateGroup', groupId, rules: document.getElementById('gdescRulesInput')?.value ?? '' });
    } else if (field === 'links') {
        const inputs = document.querySelectorAll('#ggrpLinksInputs .vrcn-edit-field');
        const links = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
        sendToCS({ action: 'vrcUpdateGroup', groupId, links });
    } else if (field === 'langs') {
        const chips = document.querySelectorAll('#ggrpLangsChips [data-lang]');
        const languages = Array.from(chips).map(c => c.dataset.lang);
        sendToCS({ action: 'vrcUpdateGroup', groupId, languages });
    } else if (field === 'joinState') {
        const val = document.getElementById('ggrpJoinStateSelect')?.value;
        if (val) sendToCS({ action: 'vrcUpdateGroup', groupId, joinState: val });
    }
}

function _renderGrpLinksInputs() {
    const container = document.getElementById('ggrpLinksInputs');
    if (!container) return;
    const links = (window._currentGroupDetail?.links || []).filter(Boolean);
    container.innerHTML = [0, 1, 2].map(i =>
        `<div class="myp-link-row">
            <span class="myp-link-num">${i + 1}</span>
            <input type="url" class="vrcn-edit-field" placeholder="https://..." value="${esc(links[i]||'')}" maxlength="512" style="flex:1;">
        </div>`
    ).join('');
}

function _renderGrpLangsEdit() {
    const selected = (window._currentGroupDetail?.languages || []);
    _renderGrpLangChips(selected, document.getElementById('ggrpLangsChips'));
    const sel = document.getElementById('ggrpLangSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">Add language...</option>';
    Object.entries(LANG_MAP).forEach(([key, name]) => {
        const code = key.replace('language_', '');
        if (!selected.includes(code))
            sel.insertAdjacentHTML('beforeend', `<option value="${code}">${esc(name)}</option>`);
    });
}

function _renderGrpLangChips(langs, el) {
    if (!el) return;
    el.innerHTML = langs.map(code =>
        `<span class="myp-lang-chip" data-lang="${code}">${esc(LANG_MAP['language_'+code] || code.toUpperCase())}<button class="myp-lang-remove" onclick="removeGrpLanguage('${code}')"><span class="msi" style="font-size:11px;">close</span></button></span>`
    ).join('');
}

function addGrpLanguage() {
    const sel = document.getElementById('ggrpLangSelect');
    const code = sel?.value;
    if (!code) return;
    const chips = Array.from(document.querySelectorAll('#ggrpLangsChips [data-lang]')).map(c => c.dataset.lang);
    if (chips.includes(code)) return;
    chips.push(code);
    _renderGrpLangChips(chips, document.getElementById('ggrpLangsChips'));
    const opt = sel.querySelector(`option[value="${code}"]`);
    if (opt) opt.remove();
    sel.value = '';
}

function removeGrpLanguage(code) {
    const chips = Array.from(document.querySelectorAll('#ggrpLangsChips [data-lang]')).map(c => c.dataset.lang).filter(c => c !== code);
    _renderGrpLangChips(chips, document.getElementById('ggrpLangsChips'));
    const sel = document.getElementById('ggrpLangSelect');
    if (sel) sel.insertAdjacentHTML('beforeend', `<option value="${code}">${esc(LANG_MAP['language_'+code] || code.toUpperCase())}</option>`);
}

function loadMoreGroupMembers() {
    if (!window._gdMembersGroupId || window._gdMembersSearchActive) return;
    const btn = document.querySelector('#gdMembersLoadMore button');
    if (btn) { btn.textContent = 'Loading...'; btn.disabled = true; }
    sendToCS({ action: 'vrcGetGroupMembers', groupId: window._gdMembersGroupId, offset: window._gdMembersOffset || 0 });
}

function searchGroupMembers() {
    if (!window._gdMembersGroupId) return;
    const q = document.getElementById('gdMembersSearch')?.value.trim() || '';
    if (!q) {
        // Empty search → reset to normal paginated view
        window._gdMembersSearchActive = false;
        window._gdMembersOffset = 0;
        const list = document.getElementById('gdMembersList');
        if (list) list.innerHTML = '<div style="padding:16px;text-align:center;font-size:12px;color:var(--tx3);">Loading...</div>';
        const lm = document.getElementById('gdMembersLoadMore');
        if (lm) lm.innerHTML = '';
        sendToCS({ action: 'vrcGetGroupMembers', groupId: window._gdMembersGroupId, offset: 0 });
        return;
    }
    window._gdMembersSearchActive = true;
    const list = document.getElementById('gdMembersList');
    if (list) list.innerHTML = '<div style="padding:16px;text-align:center;font-size:12px;color:var(--tx3);">Searching...</div>';
    const lm = document.getElementById('gdMembersLoadMore');
    if (lm) lm.innerHTML = '';
    sendToCS({ action: 'vrcSearchGroupMembers', groupId: window._gdMembersGroupId, query: q });
}

function switchGdTab(tab, btn) {
    ['Info','Posts','Events','Instances','Gallery','Members','Roles','Banned'].forEach(t => {
        const el = document.getElementById('gdTab' + t);
        if (el) el.style.display = t.toLowerCase() === tab ? '' : 'none';
    });
    btn.closest('.fd-tabs').querySelectorAll('.fd-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (tab === 'banned' && !window._gdBannedLoaded) loadGroupBans();
}

function toggleGPost(i) {
    const el = document.getElementById('gpost' + i);
    const link = el?.parentElement?.querySelector('.gd-expand');
    if (!el || !link) return;
    if (link.textContent === 'Show more') {
        el.textContent = el.dataset.full;
        link.textContent = 'Show less';
    } else {
        el.textContent = el.dataset.preview;
        link.textContent = 'Show more';
    }
}

function deleteGroupPost(groupId, postId, btn) {
    btn.disabled = true;
    btn.querySelector('.msi').textContent = 'hourglass_empty';
    const card = btn.closest('.fd-group-card');
    if (card) { card.style.opacity = '.4'; card.style.pointerEvents = 'none'; }
    sendToCS({ action: 'vrcDeleteGroupPost', groupId, postId });
}

function deleteGroupEvent(groupId, eventId, btn) {
    btn.disabled = true;
    btn.querySelector('.msi').textContent = 'hourglass_empty';
    const card = btn.closest('.fd-group-card');
    if (card) { card.style.opacity = '.4'; card.style.pointerEvents = 'none'; }
    sendToCS({ action: 'vrcDeleteGroupEvent', groupId, eventId });
}

/* === Group Post Modal === */
let _groupPostGroupId = null;
let _groupPostImageBase64 = null;
let _groupPostSelectedFileId = null; // file_xxx from library picker

function openGroupPostModal(groupId) {
    _groupPostGroupId = groupId;
    _groupPostImageBase64 = null;
    _groupPostSelectedFileId = null;

    let overlay = document.getElementById('groupPostOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'groupPostOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
    <div class="gp-modal" role="dialog" aria-label="Create Group Post">
        <div class="gp-modal-header">
            <span class="msi" style="font-size:20px;color:var(--accent);">edit</span>
            <span>Create Group Post</span>
        </div>
        <div class="gp-modal-body">
            <label class="gp-label">Title</label>
            <input id="gpTitle" class="vrcn-edit-field" type="text" placeholder="Post title..." maxlength="200" style="width:100%;">
            <label class="gp-label" style="margin-top:12px;">Content</label>
            <textarea id="gpText" class="gp-textarea" placeholder="What's on your mind?" rows="5" maxlength="2000"></textarea>
            <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;">
                <div style="flex:1;min-width:130px;">
                    <label class="gp-label">Visibility</label>
                    <select id="gpVisibility" class="wd-create-select" style="width:100%">
                        <option value="group">Group only</option>
                        <option value="public">Public</option>
                    </select>
                </div>
                <div style="flex:1;min-width:130px;">
                    <label class="gp-label">Notification</label>
                    <select id="gpNotify" class="wd-create-select" style="width:100%">
                        <option value="0">No notification</option>
                        <option value="1">Send notification</option>
                    </select>
                </div>
            </div>
            <label class="gp-label" style="margin-top:12px;">Image <span style="color:var(--tx3);font-weight:400;">(optional)</span></label>
            <div id="gpImgGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px;max-height:180px;overflow-y:auto;padding:4px 0;"></div>
            <div id="gpError" style="display:none;margin-top:8px;padding:8px 10px;background:rgba(255,80,80,.12);border-radius:8px;color:var(--err);font-size:12px;"></div>
        </div>
        <div class="gp-modal-footer">
            <button class="vrcn-button-round vrcn-btn-join" id="gpSubmitBtn" onclick="submitGroupPost()"><span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">send</span>Post</button>
            <button class="vrcn-button-round" onclick="closeGroupPostModal()" style="margin-left:auto;">Cancel</button>
        </div>
    </div>`;
    initAllVnSelects();
    overlay.style.display = 'flex';
    setTimeout(() => document.getElementById('gpTitle')?.focus(), 50);
    const _gpCached = (typeof invFilesCache !== 'undefined') && invFilesCache['gallery'];
    if (_gpCached && _gpCached.length > 0) renderGpImgGrid(_gpCached);
    else sendToCS({ action: 'invGetFiles', tag: 'gallery' });
}

const _GP_PLUS_TILE = `<div style="width:100%;aspect-ratio:1;border-radius:6px;cursor:pointer;background:var(--bg-input);border:1.5px dashed var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'" onclick="gpOpenUpload()" title="Upload new photo"><span class="msi" style="font-size:22px;color:var(--tx3);pointer-events:none;">add_photo_alternate</span></div>`;

function renderGpImgGrid(files) {
    const grid = document.getElementById('gpImgGrid');
    if (!grid) return;
    if (!files || !files.length) { grid.innerHTML = _GP_PLUS_TILE; return; }
    grid.innerHTML = _GP_PLUS_TILE + files.map(f => {
        const url = f.fileUrl || '';
        if (!url) return '';
        const fid = jsq(f.id || '');
        const fname = esc(f.name || f.id || '');
        return `<img src="${esc(url)}" title="${fname}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;cursor:pointer;opacity:0.85;transition:opacity .15s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85" onclick="gpSelectLibraryPhoto('${fid}','${jsq(url)}')" onerror="this.style.display='none'">`;
    }).join('');
}

function gpOpenUpload() {
    openInvUploadModal('photos', file => {
        _groupPostSelectedFileId = file.id;
        _groupPostImageBase64 = null;
        renderGpImgGrid(invFilesCache['gallery'] || []);
        const first = document.querySelector('#gpImgGrid img');
        if (first) { document.querySelectorAll('#gpImgGrid img').forEach(el => el.style.outline = 'none'); first.style.outline = '2px solid var(--accent)'; }
    });
}

function gpSelectLibraryPhoto(fileId, url) {
    _groupPostSelectedFileId = fileId;
    _groupPostImageBase64 = null;
    document.querySelectorAll('#gpImgGrid img').forEach(el => el.style.outline = 'none');
    event.target.style.outline = '2px solid var(--accent)';
}

function onGroupPostGalleryLoaded(files) {
    if (!document.getElementById('gpImgGrid')) return;
    renderGpImgGrid(files);
}

function closeGroupPostModal() {
    const overlay = document.getElementById('groupPostOverlay');
    if (overlay) overlay.style.display = 'none';
    _groupPostGroupId = null;
    _groupPostImageBase64 = null;
    _groupPostSelectedFileId = null;
}


function submitGroupPost() {
    if (!_groupPostGroupId) return;
    const title = document.getElementById('gpTitle')?.value.trim() || '';
    const text = document.getElementById('gpText')?.value.trim() || '';
    const visibility = document.getElementById('gpVisibility')?.value || 'group';
    const sendNotification = document.getElementById('gpNotify')?.value === '1';
    const errEl = document.getElementById('gpError');

    if (!title) { if (errEl) { errEl.textContent = 'Title is required.'; errEl.style.display = ''; } return; }
    if (!text) { if (errEl) { errEl.textContent = 'Content is required.'; errEl.style.display = ''; } return; }
    if (errEl) errEl.style.display = 'none';

    const btn = document.getElementById('gpSubmitBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">hourglass_empty</span>Posting...'; }

    const payload = {
        action: 'vrcCreateGroupPost',
        groupId: _groupPostGroupId,
        title,
        text,
        visibility,
        sendNotification,
    };
    if (_groupPostSelectedFileId) payload.imageFileId = _groupPostSelectedFileId;
    else if (_groupPostImageBase64) payload.imageBase64 = _groupPostImageBase64;

    sendToCS(payload);
    closeGroupPostModal();
}

/* === Group Event Date-Time Picker === */
let _gevDpTarget = null; // 'start' | 'end'
let _gevDpYear = 0, _gevDpMonth = 0;
let _gevDpSelDate = ''; // YYYY-MM-DD
let _gevDpHour = 12;   // 0-23 (internal always 24h)
let _gevDpMin  = 0;
let _gevDp24h  = false;

const _GEV_DP_MONTHS = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];

function _ensureGevDp() {
    if (document.getElementById('gevDatePicker')) return;
    const el = document.createElement('div');
    el.id = 'gevDatePicker';
    el.className = 'tl-date-picker';
    el.style.cssText = 'display:none;width:268px;z-index:10100;';
    el.innerHTML = `
        <div class="tl-dp-header">
            <button class="tl-dp-nav" onclick="gevDpNavMonth(-1)"><span class="msi" style="font-size:16px;">chevron_left</span></button>
            <span id="gevDpMonthLabel" class="tl-dp-month-label"></span>
            <button class="tl-dp-nav" onclick="gevDpNavMonth(1)"><span class="msi" style="font-size:16px;">chevron_right</span></button>
        </div>
        <div class="tl-dp-weekdays">
            <div class="tl-dp-wd">Su</div><div class="tl-dp-wd">Mo</div><div class="tl-dp-wd">Tu</div>
            <div class="tl-dp-wd">We</div><div class="tl-dp-wd">Th</div><div class="tl-dp-wd">Fr</div><div class="tl-dp-wd">Sa</div>
        </div>
        <div id="gevDpDaysGrid" class="tl-dp-days"></div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--brd);">
            <span class="msi" style="font-size:15px;color:var(--tx3);">schedule</span>
            <input id="gevDpHourInput" class="gev-dp-time-input" type="number" min="1" max="12" oninput="gevDpTimeChanged()">
            <span style="color:var(--tx2);font-weight:700;font-size:15px;">:</span>
            <input id="gevDpMinInput" class="gev-dp-time-input" type="number" min="0" max="59" oninput="gevDpTimeChanged()">
            <button id="gevDpAmPmBtn" class="gev-dp-ampm-btn" onclick="gevDpToggleAmPm()">AM</button>
            <button id="gevDp24hBtn" class="gev-dp-24h-btn" onclick="gevDpToggle24h()">24h</button>
        </div>
        <div class="tl-dp-footer">
            <button class="vrcn-button-round" style="flex:1;justify-content:center;" onclick="gevDpNow()">Now</button>
            <button class="vrcn-button-round vrcn-btn-join" style="flex:1;justify-content:center;" onclick="gevDpConfirm()">OK</button>
        </div>`;
    document.body.appendChild(el);
}

function _gevDpFmtDate(year, month, day) {
    const d = new Date(year, month, day);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function _gevDpFormatDisplay(dateStr, hour, min, use24) {
    const d   = new Date(dateStr + 'T00:00:00');
    const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
    let timeStr;
    if (use24) {
        timeStr = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    } else {
        const ap = hour < 12 ? 'AM' : 'PM';
        let h12 = hour % 12; if (h12 === 0) h12 = 12;
        timeStr = `${h12}:${String(min).padStart(2,'0')} ${ap}`;
    }
    return `${dow}, ${mon} ${d.getDate()} · ${timeStr}`;
}

function _gevDpSyncTimeInputs() {
    const hInput  = document.getElementById('gevDpHourInput');
    const mInput  = document.getElementById('gevDpMinInput');
    const ampmBtn = document.getElementById('gevDpAmPmBtn');
    const h24Btn  = document.getElementById('gevDp24hBtn');
    if (!hInput) return;
    if (_gevDp24h) {
        hInput.min = '0'; hInput.max = '23';
        hInput.value = String(_gevDpHour).padStart(2,'0');
        if (ampmBtn) ampmBtn.style.display = 'none';
        if (h24Btn)  h24Btn.classList.add('active');
    } else {
        hInput.min = '1'; hInput.max = '12';
        let h12 = _gevDpHour % 12; if (h12 === 0) h12 = 12;
        hInput.value = h12;
        if (ampmBtn) { ampmBtn.textContent = _gevDpHour < 12 ? 'AM' : 'PM'; ampmBtn.style.display = ''; }
        if (h24Btn)  h24Btn.classList.remove('active');
    }
    if (mInput) mInput.value = String(_gevDpMin).padStart(2,'0');
}

function openGevDp(target) {
    _ensureGevDp();
    _gevDpTarget = target;
    const existing = document.getElementById(target === 'start' ? 'gevStart' : 'gevEnd')?.value || '';
    if (existing) {
        const [datePart, timePart] = existing.split('T');
        _gevDpSelDate = datePart;
        if (timePart) { const [h, m] = timePart.split(':').map(Number); _gevDpHour = h||0; _gevDpMin = m||0; }
        const base = new Date(_gevDpSelDate + 'T00:00:00');
        _gevDpYear = base.getFullYear(); _gevDpMonth = base.getMonth();
    } else {
        const now = new Date();
        _gevDpSelDate = ''; _gevDpHour = now.getHours(); _gevDpMin = 0;
        _gevDpYear = now.getFullYear(); _gevDpMonth = now.getMonth();
    }
    _gevDpSyncTimeInputs();
    renderGevDpCalendar();
    const picker = document.getElementById('gevDatePicker');
    picker.style.display = '';
    const trigEl = document.getElementById(target === 'start' ? 'gevStartDisplay' : 'gevEndDisplay');
    if (trigEl) {
        const rect = trigEl.getBoundingClientRect();
        const ph = picker.offsetHeight || 360;
        const top = rect.bottom + 6 + ph > window.innerHeight ? rect.top - ph - 6 : rect.bottom + 6;
        picker.style.top  = Math.max(6, top) + 'px';
        picker.style.left = Math.min(rect.left, window.innerWidth - 276) + 'px';
    }
    setTimeout(() => document.addEventListener('click', _gevDpOutside), 0);
}

function _gevDpOutside(e) {
    const picker = document.getElementById('gevDatePicker');
    if (!picker) return;
    // Detached target = calendar grid was re-rendered (day click) — not an outside click
    if (!e.target.isConnected) {
        setTimeout(() => document.addEventListener('click', _gevDpOutside), 0);
        return;
    }
    const trigEl = document.getElementById(_gevDpTarget === 'start' ? 'gevStartDisplay' : 'gevEndDisplay');
    if (!picker.contains(e.target) && (!trigEl || !trigEl.contains(e.target))) {
        picker.style.display = 'none';
        document.removeEventListener('click', _gevDpOutside);
    } else {
        setTimeout(() => document.addEventListener('click', _gevDpOutside), 0);
    }
}

function renderGevDpCalendar() {
    const label = document.getElementById('gevDpMonthLabel');
    const grid  = document.getElementById('gevDpDaysGrid');
    if (!label || !grid) return;
    label.textContent = _GEV_DP_MONTHS[_gevDpMonth] + ' ' + _gevDpYear;
    const today    = new Date();
    const todayStr = _gevDpFmtDate(today.getFullYear(), today.getMonth(), today.getDate());
    const firstDow    = new Date(_gevDpYear, _gevDpMonth, 1).getDay();
    const daysInMonth = new Date(_gevDpYear, _gevDpMonth + 1, 0).getDate();
    const daysInPrev  = new Date(_gevDpYear, _gevDpMonth, 0).getDate();
    let html = '';
    for (let i = firstDow - 1; i >= 0; i--) {
        const d = daysInPrev - i;
        const ds = _gevDpFmtDate(_gevDpYear, _gevDpMonth - 1, d);
        html += `<button class="tl-dp-day other-month${ds === _gevDpSelDate ? ' selected' : ''}" onclick="gevDpSelectDate('${ds}')">${d}</button>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const ds  = _gevDpFmtDate(_gevDpYear, _gevDpMonth, d);
        const cls = (ds === todayStr ? ' today' : '') + (ds === _gevDpSelDate ? ' selected' : '');
        html += `<button class="tl-dp-day${cls}" onclick="gevDpSelectDate('${ds}')">${d}</button>`;
    }
    const used = firstDow + daysInMonth;
    const remaining = used % 7 === 0 ? 0 : 7 - (used % 7);
    for (let d = 1; d <= remaining; d++) {
        const ds = _gevDpFmtDate(_gevDpYear, _gevDpMonth + 1, d);
        html += `<button class="tl-dp-day other-month${ds === _gevDpSelDate ? ' selected' : ''}" onclick="gevDpSelectDate('${ds}')">${d}</button>`;
    }
    grid.innerHTML = html;
}

function gevDpNavMonth(dir) {
    _gevDpMonth += dir;
    if (_gevDpMonth < 0)  { _gevDpMonth = 11; _gevDpYear--; }
    if (_gevDpMonth > 11) { _gevDpMonth = 0;  _gevDpYear++; }
    renderGevDpCalendar();
}

function gevDpSelectDate(ds) { _gevDpSelDate = ds; renderGevDpCalendar(); }

function gevDpTimeChanged() {
    const hInput = document.getElementById('gevDpHourInput');
    const mInput = document.getElementById('gevDpMinInput');
    if (!hInput) return;
    let h = parseInt(hInput.value) || 0;
    let m = Math.max(0, Math.min(59, parseInt(mInput.value) || 0));
    if (_gevDp24h) {
        _gevDpHour = Math.max(0, Math.min(23, h));
    } else {
        h = Math.max(1, Math.min(12, h));
        const isAm = document.getElementById('gevDpAmPmBtn')?.textContent === 'AM';
        _gevDpHour = (h === 12 ? 0 : h) + (isAm ? 0 : 12);
    }
    _gevDpMin = m;
}

function gevDpToggleAmPm() {
    const btn = document.getElementById('gevDpAmPmBtn');
    if (!btn) return;
    if (_gevDpHour < 12) { _gevDpHour += 12; btn.textContent = 'PM'; }
    else                  { _gevDpHour -= 12; btn.textContent = 'AM'; }
}

function gevDpToggle24h() {
    gevDpTimeChanged();
    _gevDp24h = !_gevDp24h;
    _gevDpSyncTimeInputs();
}

function gevDpNow() {
    const now = new Date();
    _gevDpSelDate = _gevDpFmtDate(now.getFullYear(), now.getMonth(), now.getDate());
    _gevDpHour = now.getHours(); _gevDpMin = now.getMinutes();
    _gevDpYear = now.getFullYear(); _gevDpMonth = now.getMonth();
    _gevDpSyncTimeInputs();
    renderGevDpCalendar();
}

function gevDpConfirm() {
    if (!_gevDpSelDate) return;
    gevDpTimeChanged();
    const value     = `${_gevDpSelDate}T${String(_gevDpHour).padStart(2,'0')}:${String(_gevDpMin).padStart(2,'0')}`;
    const hiddenId  = _gevDpTarget === 'start' ? 'gevStart' : 'gevEnd';
    const displayId = _gevDpTarget === 'start' ? 'gevStartDisplay' : 'gevEndDisplay';
    const hidden  = document.getElementById(hiddenId);
    const display = document.getElementById(displayId);
    if (hidden)  hidden.value = value;
    if (display) display.textContent = _gevDpFormatDisplay(_gevDpSelDate, _gevDpHour, _gevDpMin, _gevDp24h);
    document.getElementById('gevDatePicker').style.display = 'none';
    document.removeEventListener('click', _gevDpOutside);
}

function _gevDpSetDisplay(target, dtLocalStr) {
    if (!dtLocalStr) return;
    const [datePart, timePart] = dtLocalStr.split('T');
    const [h, m] = (timePart || '00:00').split(':').map(Number);
    document.getElementById(target === 'start' ? 'gevStart' : 'gevEnd').value = dtLocalStr;
    const display = document.getElementById(target === 'start' ? 'gevStartDisplay' : 'gevEndDisplay');
    if (display) display.textContent = _gevDpFormatDisplay(datePart, h, m, _gevDp24h);
}

/* === Group Event Modal === */
let _groupEventGroupId = null;
let _groupEventImageBase64 = null;
let _groupEventSelectedFileId = null;

function openGroupEventModal(groupId) {
    _groupEventGroupId = groupId;
    _groupEventImageBase64 = null;
    _groupEventSelectedFileId = null;

    // Default start: now + 1h, rounded to next full hour
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const pad = n => String(n).padStart(2, '0');
    const localDT = v => `${v.getFullYear()}-${pad(v.getMonth()+1)}-${pad(v.getDate())}T${pad(v.getHours())}:${pad(v.getMinutes())}`;
    const defaultStart = localDT(now);
    const endD = new Date(now); endD.setHours(endD.getHours() + 1);
    const defaultEnd = localDT(endD);

    let overlay = document.getElementById('groupEventOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'groupEventOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;';
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
    <div class="gp-modal" role="dialog" aria-label="Create Group Event" style="max-height:calc(100vh - 32px);overflow-y:auto;">
        <div class="gp-modal-header">
            <span class="msi" style="font-size:20px;color:var(--accent);">event</span>
            <span>Create Group Event</span>
        </div>
        <div class="gp-modal-body">
            <label class="gp-label">Event Name</label>
            <input id="gevName" class="vrcn-edit-field" type="text" placeholder="Event name..." maxlength="64" style="width:100%;">

            <label class="gp-label" style="margin-top:12px;">Description</label>
            <textarea id="gevDesc" class="gp-textarea" placeholder="What's happening?" rows="4" maxlength="2000"></textarea>

            <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;">
                <div style="flex:1;min-width:160px;">
                    <label class="gp-label">Start</label>
                    <div class="gp-input gev-dt-trigger" id="gevStartDisplay" onclick="openGevDp('start')"></div>
                    <input type="hidden" id="gevStart">
                </div>
                <div style="flex:1;min-width:160px;">
                    <label class="gp-label">End</label>
                    <div class="gp-input gev-dt-trigger" id="gevEndDisplay" onclick="openGevDp('end')"></div>
                    <input type="hidden" id="gevEnd">
                </div>
            </div>

            <div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;">
                <div style="flex:1;min-width:130px;">
                    <label class="gp-label">Category</label>
                    <select id="gevCategory" class="wd-create-select" style="width:100%">
                        <option value="hangout">Hangout</option>
                        <option value="gaming">Gaming</option>
                        <option value="music">Music</option>
                        <option value="dance">Dance</option>
                        <option value="performance">Performance</option>
                        <option value="arts">Arts</option>
                        <option value="education">Education</option>
                        <option value="exploration">Exploration</option>
                        <option value="film_media">Film & Media</option>
                        <option value="roleplaying">Roleplaying</option>
                        <option value="wellness">Wellness</option>
                        <option value="avatars">Avatars</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div style="flex:1;min-width:130px;">
                    <label class="gp-label">Access Type</label>
                    <select id="gevAccess" class="wd-create-select" style="width:100%">
                        <option value="group">Group only</option>
                        <option value="public">Public</option>
                    </select>
                </div>
            </div>

            <div style="margin-top:12px;">
                <label class="gp-label">Notification</label>
                <select id="gevNotify" class="wd-create-select" style="width:100%">
                    <option value="0">No notification</option>
                    <option value="1">Send notification</option>
                </select>
            </div>

            <label class="gp-label" style="margin-top:12px;">Image <span style="color:var(--tx3);font-weight:400;">(optional)</span></label>
            <div id="gevImgGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:6px;max-height:180px;overflow-y:auto;padding:4px 0;"></div>

            <div id="gevError" style="display:none;margin-top:8px;padding:8px 10px;background:rgba(255,80,80,.12);border-radius:8px;color:var(--err);font-size:12px;"></div>
        </div>
        <div class="gp-modal-footer">
            <button class="vrcn-button-round vrcn-btn-join" id="gevSubmitBtn" onclick="submitGroupEvent()"><span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">event</span>Create Event</button>
            <button class="vrcn-button-round" onclick="closeGroupEventModal()" style="margin-left:auto;">Cancel</button>
        </div>
    </div>`;
    initAllVnSelects();
    _gevDpSetDisplay('start', defaultStart);
    _gevDpSetDisplay('end', defaultEnd);
    overlay.style.display = 'flex';
    setTimeout(() => document.getElementById('gevName')?.focus(), 50);
    const _gevCached = (typeof invFilesCache !== 'undefined') && invFilesCache['gallery'];
    if (_gevCached && _gevCached.length > 0) renderGevImgGrid(_gevCached);
    else sendToCS({ action: 'invGetFiles', tag: 'gallery' });
}

const _GEV_PLUS_TILE = `<div style="width:100%;aspect-ratio:1;border-radius:6px;cursor:pointer;background:var(--bg-input);border:1.5px dashed var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'" onclick="gevOpenUpload()" title="Upload new photo"><span class="msi" style="font-size:22px;color:var(--tx3);pointer-events:none;">add_photo_alternate</span></div>`;

function renderGevImgGrid(files) {
    const grid = document.getElementById('gevImgGrid');
    if (!grid) return;
    if (!files || !files.length) { grid.innerHTML = _GEV_PLUS_TILE; return; }
    grid.innerHTML = _GEV_PLUS_TILE + files.map(f => {
        const url = f.fileUrl || '';
        if (!url) return '';
        const fid = jsq(f.id || '');
        const fname = esc(f.name || f.id || '');
        return `<img src="${esc(url)}" title="${fname}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:6px;cursor:pointer;opacity:0.85;transition:opacity .15s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85" onclick="gevSelectLibraryPhoto('${fid}','${jsq(url)}')" onerror="this.style.display='none'">`;
    }).join('');
}

function gevOpenUpload() {
    openInvUploadModal('photos', file => {
        _groupEventSelectedFileId = file.id;
        _groupEventImageBase64 = null;
        renderGevImgGrid(invFilesCache['gallery'] || []);
        const first = document.querySelector('#gevImgGrid img');
        if (first) { document.querySelectorAll('#gevImgGrid img').forEach(el => el.style.outline = 'none'); first.style.outline = '2px solid var(--accent)'; }
    });
}

function gevSelectLibraryPhoto(fileId, url) {
    _groupEventSelectedFileId = fileId;
    _groupEventImageBase64 = null;
    document.querySelectorAll('#gevImgGrid img').forEach(el => el.style.outline = 'none');
    event.target.style.outline = '2px solid var(--accent)';
}

function onGroupEventGalleryLoaded(files) {
    if (!document.getElementById('gevImgGrid')) return;
    renderGevImgGrid(files);
}

function closeGroupEventModal() {
    const overlay = document.getElementById('groupEventOverlay');
    if (overlay) overlay.style.display = 'none';
    _groupEventGroupId = null;
    _groupEventImageBase64 = null;
    _groupEventSelectedFileId = null;
}


function submitGroupEvent() {
    if (!_groupEventGroupId) return;
    const title = document.getElementById('gevName')?.value.trim() || '';
    const description = document.getElementById('gevDesc')?.value.trim() || '';
    const startVal = document.getElementById('gevStart')?.value || '';
    const endVal = document.getElementById('gevEnd')?.value || '';
    const category = document.getElementById('gevCategory')?.value || 'other';
    const accessType = document.getElementById('gevAccess')?.value || 'group';
    const sendCreationNotification = document.getElementById('gevNotify')?.value === '1';
    const errEl = document.getElementById('gevError');

    if (!title) { if (errEl) { errEl.textContent = 'Event name is required.'; errEl.style.display = ''; } return; }
    if (!description) { if (errEl) { errEl.textContent = 'Description is required.'; errEl.style.display = ''; } return; }
    if (!startVal) { if (errEl) { errEl.textContent = 'Start date/time is required.'; errEl.style.display = ''; } return; }
    if (!endVal) { if (errEl) { errEl.textContent = 'End date/time is required.'; errEl.style.display = ''; } return; }
    if (new Date(endVal) <= new Date(startVal)) { if (errEl) { errEl.textContent = 'End must be after start.'; errEl.style.display = ''; } return; }
    if (errEl) errEl.style.display = 'none';

    const btn = document.getElementById('gevSubmitBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="msi" style="font-size:16px;vertical-align:middle;margin-right:4px;">hourglass_empty</span>Creating...'; }

    const payload = {
        action: 'vrcCreateGroupEvent',
        groupId: _groupEventGroupId,
        title,
        description,
        startsAt: new Date(startVal).toISOString(),
        endsAt: new Date(endVal).toISOString(),
        category,
        accessType,
        sendCreationNotification,
    };
    if (_groupEventSelectedFileId) payload.imageFileId = _groupEventSelectedFileId;
    else if (_groupEventImageBase64) payload.imageBase64 = _groupEventImageBase64;

    sendToCS(payload);
    closeGroupEventModal();
}

/* ============================================================
   GROUP ROLES
   ============================================================ */

const ROLE_PERM_DEFS = [
    { key: 'group-members-manage',               label: 'Manage Group Member Data',            desc: 'View, filter, sort, and edit data about all members.' },
    { key: 'group-data-manage',                  label: 'Manage Group Data',                   desc: 'Edit group details (name, description, joinState, etc).' },
    { key: 'group-audit-view',                   label: 'View Audit Log',                      desc: 'View the full group audit log.' },
    { key: 'group-roles-manage',                 label: 'Manage Group Roles',                  desc: 'Create, modify, and delete roles.' },
    { key: 'group-default-role-manage',          label: 'Manage Default Role',                 desc: 'Manage permissions for the default (Everyone) role.' },
    { key: 'group-roles-assign',                 label: 'Assign Group Roles',                  desc: 'Assign/unassign roles to users. Requires "Manage Group Member Data".' },
    { key: 'group-bans-manage',                  label: 'Manage Group Bans',                   desc: 'Ban/unban users and view all banned users. Requires "Manage Group Member Data".' },
    { key: 'group-members-remove',               label: 'Remove Group Members',                desc: 'Remove someone from the group. Requires "Manage Group Member Data".' },
    { key: 'group-members-viewall',              label: 'View All Members',                    desc: 'View all members in the group, not just friends.' },
    { key: 'group-announcement-manage',          label: 'Manage Group Announcement',           desc: 'Set/clear group announcement and send it as a notification.' },
    { key: 'group-calendar-manage',              label: 'Manage Group Calendar',               desc: 'Create, modify, and publish calendar entries.' },
    { key: 'group-galleries-manage',             label: 'Manage Group Galleries',              desc: 'Create, reorder, edit, and delete group galleries.' },
    { key: 'group-invites-manage',               label: 'Manage Group Invites',                desc: 'Create/cancel invites, accept/decline/block join requests.' },
    { key: 'group-instance-moderate',            label: 'Moderate Group Instances',            desc: 'Moderate within a group instance.' },
    { key: 'group-instance-manage',              label: 'Manage Group Instances',              desc: 'Rename or close a group instance.' },
    { key: 'group-instance-queue-priority',      label: 'Group Instance Queue Priority',       desc: 'Priority for group instance queues.' },
    { key: 'group-instance-age-gated-create',    label: 'Create Age Gated Instances',          desc: 'Create instances requiring age verification (18+).' },
    { key: 'group-instance-public-create',       label: 'Create Public Group Instances',       desc: 'Create instances open to all, member or not.' },
    { key: 'group-instance-plus-create',         label: 'Create Group+ Instances',             desc: 'Create instances that friends of attendees can also join.' },
    { key: 'group-instance-open-create',         label: 'Create Open Group Instances',         desc: 'Create open group instances.' },
    { key: 'group-instance-restricted-create',   label: 'Create Role-Restricted Instances',    desc: 'Create instances restricted to specific roles.' },
    { key: 'group-instance-plus-portal',         label: 'Portal to Group+ Instances',          desc: 'Open locked portals to Group+ instances.' },
    { key: 'group-instance-plus-portal-unlocked',label: 'Unlocked Portal to Group+ Instances', desc: 'Open unlocked portals to Group+ instances.' },
    { key: 'group-instance-join',                label: 'Join Group Instances',                desc: 'Join group instances.' },
];

function _buildRoleEditor(role, groupId, canManage, isSystemRole) {
    const rid = esc(role.id);
    const gid = jsq(groupId);
    const isOwner = (role.permissions || []).includes('*');
    const dis = (canManage && !isOwner) ? '' : 'disabled';
    const generalHtml = `
    <div class="gd-role-section">
        <div class="gd-role-section-title">General</div>
        <div class="sf-row" style="margin-bottom:8px;">
            <label style="font-size:12px;color:var(--tx2);min-width:50px;">Name</label>
            <input id="grole-name-${rid}" class="vrcn-edit-field" value="${esc(role.name)}" maxlength="64" style="flex:1;" ${dis}>
        </div>
        <div class="sf-toggle-row"><span>Assign On Join</span>
            <label class="toggle"><input type="checkbox" id="grole-join-${rid}" ${role.isAddedOnJoin ? 'checked' : ''} ${dis}><div class="toggle-track"><div class="toggle-knob"></div></div></label></div>
        <div class="sf-toggle-row"><span>Self Assignable</span>
            <label class="toggle"><input type="checkbox" id="grole-self-${rid}" ${role.isSelfAssignable ? 'checked' : ''} ${dis}><div class="toggle-track"><div class="toggle-knob"></div></div></label></div>
        <div class="sf-toggle-row"><span>Require Two Factor Authentication</span>
            <label class="toggle"><input type="checkbox" id="grole-tfa-${rid}" ${role.requiresTwoFactor ? 'checked' : ''} ${dis}><div class="toggle-track"><div class="toggle-knob"></div></div></label></div>
    </div>`;
    const hasWildcard = (role.permissions || []).includes('*');
    const permsHtml = `
    <div class="gd-role-section">
        <div class="gd-role-section-title">Permissions</div>
        ${hasWildcard
            ? `<div style="padding:8px 0;font-size:12px;color:var(--tx2);">This role has full access (all permissions).</div>`
            : ROLE_PERM_DEFS.map(p => {
                const checked = (role.permissions || []).includes(p.key);
                return `<div class="gd-perm-row">
                    <div class="gd-perm-info"><div class="gd-perm-label">${p.label}</div><div class="gd-perm-desc">${p.desc}</div></div>
                    <label class="toggle" style="flex-shrink:0;margin-left:12px;"><input type="checkbox" data-perm-key="${p.key}" ${checked ? 'checked' : ''} ${dis}><div class="toggle-track"><div class="toggle-knob"></div></div></label>
                </div>`;
            }).join('')}
    </div>`;
    const canSave = canManage && !isOwner;
    const actionBtns = canSave ? `
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:space-between;">
        ${!isSystemRole ? `<button class="vrcn-button-round vrcn-btn-danger" style="font-size:11px;" onclick="deleteGroupRole('${jsq(role.id)}','${gid}')"><span class="msi" style="font-size:14px;">delete</span> Delete</button>` : '<div></div>'}
        <button class="vrcn-button-round vrcn-btn-join" style="font-size:11px;" onclick="saveGroupRole('${jsq(role.id)}','${gid}')"><span class="msi" style="font-size:14px;">save</span> Save Changes</button>
    </div>` : '';
    return generalHtml + permsHtml + actionBtns;
}

function _buildRoleCard(role, groupId, canManage) {
    const rid = esc(role.id);
    const permCount = (role.permissions || []).includes('*') ? '∗' : (role.permissions || []).length;
    const meta = [
        permCount + (permCount === '∗' ? ' (all)' : permCount === 1 ? ' permission' : ' permissions'),
        role.isAddedOnJoin   ? 'Auto-join'   : '',
        role.isSelfAssignable? 'Self-assign' : '',
    ].filter(Boolean).join(' · ');
    const badge = role.isManagementRole ? `<span class="vrcn-badge" style="margin-right:6px;">System</span>` : '';
    return `<div class="gd-role-card" id="gdrole-${rid}">
        <div class="gd-role-header" onclick="toggleGdRoleExpand('${rid}')">
            <div style="flex:1;"><div class="gd-role-name">${badge}${esc(role.name)}</div><div class="gd-role-meta">${meta}</div></div>
            <span class="msi gd-role-chevron" style="font-size:18px;color:var(--tx3);transition:transform .2s;">expand_more</span>
        </div>
        <div class="gd-role-body" id="gdrole-body-${rid}" style="display:none;">
            <div class="fd-tabs gd-tabs" style="margin:10px 14px 0;">
                <button class="fd-tab active" onclick="switchGdRoleTab('${rid}','settings',this)">Settings</button>
                <button class="fd-tab" onclick="switchGdRoleTab('${rid}','members',this)">Members</button>
            </div>
            <div id="gdrole-settings-${rid}">
                ${_buildRoleEditor(role, groupId, canManage, role.isManagementRole)}
            </div>
            <div id="gdrole-members-${rid}" style="display:none;">
                <div id="gdrole-members-list-${rid}" style="padding:8px 0;">
                    <div style="padding:16px;text-align:center;font-size:12px;color:var(--tx3);">Click to load members...</div>
                </div>
            </div>
        </div>
    </div>`;
}

function _buildCreateRoleForm(groupId) {
    const gid = jsq(groupId);
    return `<div id="gdRoleCreateForm" style="display:none;margin-bottom:10px;">
        <div class="gd-role-card" style="border:1.5px dashed var(--accent);">
            <div style="padding:12px 14px 0;"><div class="gd-role-section-title">New Role</div>
            <div class="sf-row" style="margin-bottom:8px;">
                <label style="font-size:12px;color:var(--tx2);min-width:50px;">Name</label>
                <input id="gdNewRoleName" class="vrcn-edit-field" placeholder="Role name..." maxlength="64" style="flex:1;">
            </div>
            <div class="sf-toggle-row"><span>Assign On Join</span>
                <label class="toggle"><input type="checkbox" id="gdNewRoleJoin"><div class="toggle-track"><div class="toggle-knob"></div></div></label></div>
            <div class="sf-toggle-row"><span>Self Assignable</span>
                <label class="toggle"><input type="checkbox" id="gdNewRoleSelf"><div class="toggle-track"><div class="toggle-knob"></div></div></label></div>
            <div class="sf-toggle-row"><span>Require Two Factor Authentication</span>
                <label class="toggle"><input type="checkbox" id="gdNewRoleTfa"><div class="toggle-track"><div class="toggle-knob"></div></div></label></div>
            <div class="gd-role-section-title" style="margin-top:14px;">Permissions</div>
            ${ROLE_PERM_DEFS.map(p => `<div class="gd-perm-row">
                <div class="gd-perm-info"><div class="gd-perm-label">${p.label}</div><div class="gd-perm-desc">${p.desc}</div></div>
                <label class="toggle" style="flex-shrink:0;margin-left:12px;"><input type="checkbox" class="gdNewRolePerm" data-perm-key="${p.key}"><div class="toggle-track"><div class="toggle-knob"></div></div></label>
            </div>`).join('')}
            <div style="display:flex;gap:8px;margin-top:14px;padding-bottom:14px;">
                <button class="vrcn-button-round" style="font-size:11px;" onclick="closeCreateRoleForm()">Cancel</button>
                <button class="vrcn-button-round vrcn-btn-join" style="font-size:11px;margin-left:auto;" onclick="submitCreateRole('${gid}')"><span class="msi" style="font-size:14px;">add</span> Create Role</button>
            </div></div>
        </div>
    </div>`;
}

function _buildRolesTab(g) {
    const canManage = g.canManageRoles === true;
    const roles = g.roles || [];
    const createBtn = `<button class="vrcn-button-round" style="margin-bottom:10px;" onclick="openCreateRoleForm()"><span class="msi" style="font-size:14px;">add</span> Create Role</button>`;
    const createForm = _buildCreateRoleForm(g.id);
    const roleCards = roles.length
        ? roles.map(r => _buildRoleCard(r, g.id, canManage)).join('')
        : '<div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">No roles found</div>';
    return `${createBtn}${createForm}<div id="gdRolesList">${roleCards}</div>`;
}

function toggleGdRoleExpand(roleId) {
    const body    = document.getElementById('gdrole-body-' + roleId);
    const chevron = document.querySelector('#gdrole-' + roleId + ' .gd-role-chevron');
    if (!body) return;
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : '';
    if (chevron) chevron.style.transform = open ? '' : 'rotate(180deg)';
}

function switchGdRoleTab(roleId, tab, btn) {
    document.getElementById('gdrole-settings-' + roleId).style.display = tab === 'settings' ? '' : 'none';
    document.getElementById('gdrole-members-'  + roleId).style.display = tab === 'members'  ? '' : 'none';
    btn.closest('.fd-tabs').querySelectorAll('.fd-tab').forEach(b => b.classList.toggle('active', b === btn));
    if (tab === 'members') {
        const listEl = document.getElementById('gdrole-members-list-' + roleId);
        if (listEl && !listEl.dataset.loaded) {
            listEl.dataset.loaded = '1';
            listEl.innerHTML = '<div style="padding:16px;text-align:center;font-size:12px;color:var(--tx3);">Loading...</div>';
            const g = window._currentGroupDetail;
            if (g) sendToCS({ action: 'vrcGetGroupRoleMembers', groupId: g.id, roleId });
        }
    }
}

function onGroupRoleMembers(data) {
    const listEl = document.getElementById('gdrole-members-list-' + data.roleId);
    if (!listEl) return;
    if (!data.members || data.members.length === 0) {
        listEl.innerHTML = '<div style="padding:16px;text-align:center;font-size:12px;color:var(--tx3);">No members with this role.</div>';
        return;
    }
    listEl.innerHTML = data.members.map(m => renderGroupMemberCard(m)).join('');
}

function openCreateRoleForm() {
    const form = document.getElementById('gdRoleCreateForm');
    if (form) { form.style.display = ''; form.querySelector('input')?.focus(); }
}

function closeCreateRoleForm() {
    const form = document.getElementById('gdRoleCreateForm');
    if (form) form.style.display = 'none';
}

function submitCreateRole(groupId) {
    const name = document.getElementById('gdNewRoleName')?.value.trim() || '';
    if (!name) { showToast(false, 'Role name is required'); return; }
    const perms = Array.from(document.querySelectorAll('.gdNewRolePerm:checked')).map(el => el.dataset.permKey);
    sendToCS({
        action: 'vrcCreateGroupRole', groupId, name, description: '',
        permissions: perms,
        isAddedOnJoin:    document.getElementById('gdNewRoleJoin')?.checked || false,
        isSelfAssignable: document.getElementById('gdNewRoleSelf')?.checked || false,
        requiresTwoFactor:document.getElementById('gdNewRoleTfa')?.checked  || false,
    });
}

function saveGroupRole(roleId, groupId) {
    const name = document.getElementById('grole-name-' + roleId)?.value.trim() || '';
    if (!name) { showToast(false, 'Role name is required'); return; }
    const perms = Array.from(document.querySelectorAll(`#gdrole-body-${roleId} [data-perm-key]:checked`)).map(el => el.dataset.permKey);
    sendToCS({
        action: 'vrcUpdateGroupRole', groupId, roleId, name, permissions: perms,
        isAddedOnJoin:    document.getElementById('grole-join-' + roleId)?.checked || false,
        isSelfAssignable: document.getElementById('grole-self-' + roleId)?.checked || false,
        requiresTwoFactor:document.getElementById('grole-tfa-'  + roleId)?.checked || false,
    });
}

function deleteGroupRole(roleId, groupId) {
    const card = document.getElementById('gdrole-' + roleId);
    if (card) { card.style.opacity = '0.4'; card.style.pointerEvents = 'none'; }
    sendToCS({ action: 'vrcDeleteGroupRole', groupId, roleId });
}

function onGroupRoleResult(payload) {
    if (!payload.success) {
        const msg = { create: 'Failed to create role', update: 'Failed to save role', delete: 'Failed to delete role' }[payload.action] || 'Role action failed';
        showToast(false, msg);
        if (payload.action === 'delete') {
            const card = document.getElementById('gdrole-' + payload.roleId);
            if (card) { card.style.opacity = ''; card.style.pointerEvents = ''; }
        }
        return;
    }
    if (payload.action === 'create') {
        showToast(true, 'Role created');
        closeCreateRoleForm();
        if (payload.role && window._currentGroupDetail) {
            window._currentGroupDetail.roles = [...(window._currentGroupDetail.roles || []), payload.role];
            const list = document.getElementById('gdRolesList');
            if (list) list.insertAdjacentHTML('beforeend', _buildRoleCard(payload.role, payload.groupId, true));
        }
    } else if (payload.action === 'update') {
        showToast(true, 'Role saved');
    } else if (payload.action === 'delete') {
        showToast(true, 'Role deleted');
        if (window._currentGroupDetail)
            window._currentGroupDetail.roles = (window._currentGroupDetail.roles || []).filter(r => r.id !== payload.roleId);
        document.getElementById('gdrole-' + payload.roleId)?.remove();
    }
}

/* ============================================================
   GROUP BANNED MEMBERS
   ============================================================ */

function _buildBannedTab() {
    return `<div id="gdBannedList"><div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">Loading...</div></div>`;
}

function loadGroupBans() {
    if (!window._currentGroupDetail?.id) return;
    window._gdBannedLoaded = true;
    sendToCS({ action: 'vrcGetGroupBans', groupId: window._currentGroupDetail.id });
}

function renderGroupBans(groupId, bans) {
    const list = document.getElementById('gdBannedList');
    if (!list) return;
    if (!bans || bans.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--tx3);">No banned members</div>';
        return;
    }
    list.innerHTML = bans.map(b => renderProfileItem(b, `closeDetailModal();openFriendDetail('${jsq(b.id || '')}')`)).join('');
}
