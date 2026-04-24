/* === My Profile Modal === */
// My Profile Modal
function openMyProfileModal() {
    if (!currentVrcUser) return;
    const m = document.getElementById('modalMyProfile');
    if (!m) return;
    renderMyProfileContent();
    m.style.display = 'flex';
}

function closeMyProfile() {
    const m = document.getElementById('modalMyProfile');
    if (m) m.style.display = 'none';
}

function renderMyProfileContent() {
    const u = currentVrcUser;
    const box = document.getElementById('mypBox');
    if (!u || !box) return;

    const changeBannerTitle = t('profiles.my_profile.change_banner', 'Change banner');
    const addBannerTitle = t('profiles.my_profile.add_banner', 'Add banner');
    const bannerLabel = t('profiles.my_profile.banner', 'Banner');
    const changeIconTitle = t('profiles.my_profile.change_icon', 'Change icon');
    const noLanguagesLabel = t('profiles.my_profile.empty.no_languages', 'No languages set');
    const noLinksLabel = t('profiles.my_profile.empty.no_links', 'No links added');
    const noPronounsLabel = t('profiles.my_profile.empty.no_pronouns', 'No pronouns set');
    const noBioLabel = t('profiles.my_profile.empty.no_bio', 'No bio written yet');
    const addLanguageLabel = t('profiles.my_profile.add_language', 'Add language...');

    const bannerSrc = u.profilePicOverride || u.currentAvatarImageUrl || u.image || '';
    const bannerHtml = bannerSrc
        ? `<div class="fd-banner"><img src="${esc(bannerSrc)}" onerror="this.parentElement.style.display='none'"><div class="fd-banner-fade"></div><button class="myp-edit-btn" style="position:absolute;top:8px;right:8px;z-index:2;" onclick="openImagePicker('profile-banner')" title="${esc(changeBannerTitle)}"><span class="msi" style="font-size:13px;">edit</span></button></div>`
        : `<div style="display:flex;justify-content:flex-end;padding:4px 0 2px 0;"><button class="myp-edit-btn" onclick="openImagePicker('profile-banner')" title="${esc(addBannerTitle)}"><span class="msi" style="font-size:13px;">edit</span><span style="font-size:11px;margin-left:3px;">${esc(bannerLabel)}</span></button></div>`;

    const avatarImg = u.image
        ? `<img class="myp-avatar" src="${esc(u.image)}" onerror="this.outerHTML='<div class=\\'myp-avatar myp-avatar-fb\\'>${esc((u.displayName||'?')[0])}</div>'">`
        : `<div class="myp-avatar myp-avatar-fb">${esc((u.displayName||'?')[0])}</div>`;
    const imgTag = `<div style="position:relative;display:inline-block;flex-shrink:0;">${avatarImg}<button class="myp-edit-btn" style="position:absolute;bottom:-4px;right:-4px;padding:2px;min-width:0;width:18px;height:18px;display:flex;align-items:center;justify-content:center;" onclick="openImagePicker('profile-icon')" title="${esc(changeIconTitle)}"><span class="msi" style="font-size:11px;">edit</span></button></div>`;

    const langTags = (u.tags||[]).filter(t => t.startsWith('language_'));
    const langsViewHtml = langTags.length
        ? `<div class="fd-lang-tags">${langTags.map(t => `<span class="vrcn-badge">${esc(LANG_MAP[t]||t.replace('language_','').toUpperCase())}</span>`).join('')}</div>`
        : `<div class="myp-empty">${noLanguagesLabel}</div>`;

    const bioLinksViewHtml = (u.bioLinks||[]).length
        ? `<div class="fd-bio-links">${(u.bioLinks).map(bl => renderBioLink(bl)).join('')}</div>`
        : `<div class="myp-empty">${noLinksLabel}</div>`;

    const _repG = (typeof myGroups !== 'undefined') && myGroups.find(g => g.isRepresenting === true);
    let repGroupHtml = '';
    if (_repG) {
        const _repIcon = _repG.iconUrl
            ? `<img class="fd-group-icon" src="${esc(_repG.iconUrl)}" onerror="this.style.display='none'">`
            : `<div class="fd-group-icon fd-group-icon-empty"><span class="msi" style="font-size:18px;">group</span></div>`;
        repGroupHtml = `<div class="myp-section" style="padding-bottom:4px;">
            <div class="fd-group-rep-label">${t('profiles.badges.representing', 'Representing')}</div>
            <div class="fd-group-card fd-group-rep" onclick="closeMyProfile();openGroupDetail('${esc(_repG.id)}')">
                ${_repIcon}<div class="fd-group-card-info"><div class="fd-group-card-name">${esc(_repG.name)}</div><div class="fd-group-card-meta">${esc(_repG.shortCode || '')}${_repG.discriminator ? '.' + esc(_repG.discriminator) : ''}${_repG.memberCount ? ' &middot; ' + esc(getGroupMemberText(_repG.memberCount)) : ''}</div></div>
            </div>
        </div>`;
    }

    box.innerHTML = `
        ${bannerHtml}
        <div class="fd-content${bannerSrc ? ' fd-has-banner' : ''}">
            <div class="myp-header">
                ${imgTag}
                <div class="myp-header-info">
                    <div class="myp-name">${esc(u.displayName)}</div>
                    <div class="myp-status-row" onclick="openStatusModal()">
                        <span class="vrc-status-dot ${statusDotClass(u.status)}" style="width:7px;height:7px;flex-shrink:0;"></span>
                        <span>${getStatusText(u.status, u.statusDescription)}</span>
                        <span class="msi" style="font-size:13px;opacity:.45;margin-left:2px;">edit</span>
                    </div>
                </div>
            </div>

            ${repGroupHtml}
            ${_renderMyBadgesSection(u)}

            <div class="myp-section">
                <div class="myp-section-header">
                    <span class="myp-section-title">${t('profiles.my_profile.sections.pronouns', 'Pronouns')}</span>
                    <button class="myp-edit-btn" onclick="editMyField('pronouns')"><span class="msi" style="font-size:14px;">edit</span></button>
                </div>
                <div id="mypPronounsView">
                    ${u.pronouns ? `<div style="font-size:13px;color:var(--tx1);">${esc(u.pronouns)}</div>` : `<div class="myp-empty">${noPronounsLabel}</div>`}
                </div>
                <div id="mypPronounsEdit" style="display:none;">
                    <input type="text" id="mypPronounsInput" class="vrcn-edit-field" placeholder="${esc(t('profiles.my_profile.pronouns_placeholder', 'e.g. he/him, she/her, they/them...'))}" maxlength="32" value="${esc(u.pronouns||'')}" style="width:100%;">
                    <div class="myp-edit-actions">
                        <button class="vrcn-button" onclick="cancelMyField('pronouns')">${t('common.cancel', 'Cancel')}</button>
                        <button class="vrcn-button vrcn-btn-primary" onclick="saveMyField('pronouns')">${t('common.save', 'Save')}</button>
                    </div>
                </div>
            </div>

            <div class="myp-section">
                <div class="myp-section-header">
                    <span class="myp-section-title">${t('profiles.my_profile.sections.bio', 'Bio')}</span>
                    <button class="myp-edit-btn" onclick="editMyField('bio')"><span class="msi" style="font-size:14px;">edit</span></button>
                </div>
                <div id="mypBioView">
                    ${u.bio ? `<div class="fd-bio">${esc(u.bio)}</div>` : `<div class="myp-empty">${noBioLabel}</div>`}
                </div>
                <div id="mypBioEdit" style="display:none;">
                    <textarea id="mypBioInput" class="myp-textarea" rows="4" maxlength="512" placeholder="${esc(t('profiles.my_profile.bio_placeholder', 'Write your bio...'))}">${esc(u.bio||'')}</textarea>
                    <div class="myp-char-count"><span id="mypBioCount">${(u.bio||'').length}</span>/512</div>
                    <div class="myp-edit-actions">
                        <button class="vrcn-button" onclick="cancelMyField('bio')">${t('common.cancel', 'Cancel')}</button>
                        <button class="vrcn-button vrcn-btn-primary" onclick="saveMyField('bio')">${t('common.save', 'Save')}</button>
                    </div>
                </div>
            </div>

            <div class="myp-section">
                <div class="myp-section-header">
                    <span class="myp-section-title">${t('profiles.my_profile.sections.links', 'Links')}</span>
                    <button class="myp-edit-btn" onclick="editMyField('links')"><span class="msi" style="font-size:14px;">edit</span></button>
                </div>
                <div id="mypLinksView">${bioLinksViewHtml}</div>
                <div id="mypLinksEdit" style="display:none;">
                    <div id="mypLinksInputs"></div>
                    <div class="myp-edit-actions">
                        <button class="vrcn-button" onclick="cancelMyField('links')">${t('common.cancel', 'Cancel')}</button>
                        <button class="vrcn-button vrcn-btn-primary" onclick="saveMyField('links')">${t('common.save', 'Save')}</button>
                    </div>
                </div>
            </div>

            <div class="myp-section">
                <div class="myp-section-header">
                    <span class="myp-section-title">${t('profiles.my_profile.sections.languages', 'Languages')}</span>
                    <button class="myp-edit-btn" onclick="editMyField('languages')"><span class="msi" style="font-size:14px;">edit</span></button>
                </div>
                <div id="mypLangsView">${langsViewHtml}</div>
                <div id="mypLangsEdit" style="display:none;">
                    <div id="mypLangsChips" class="myp-lang-chips"></div>
                    <div class="myp-lang-add-row">
                        <select id="mypLangSelect" class="myp-lang-select"><option value="">${addLanguageLabel}</option></select>
                        <button class="myp-add-lang-btn" onclick="addMyLanguage()"><span class="msi" style="font-size:15px;">add</span></button>
                    </div>
                    <div class="myp-edit-actions">
                        <button class="vrcn-button" onclick="cancelMyField('languages')">${t('common.cancel', 'Cancel')}</button>
                        <button class="vrcn-button vrcn-btn-primary" onclick="saveMyField('languages')">${t('common.save', 'Save')}</button>
                    </div>
                </div>
            </div>

            <div style="text-align:right;padding-top:12px;">
                <button class="vrcn-button-round" onclick="closeMyProfile()">${t('common.close', 'Close')}</button>
            </div>
        </div>`;

    const myStatusTextEl = box.querySelector('.myp-status-row span:nth-of-type(2)');
    if (myStatusTextEl) myStatusTextEl.textContent = getStatusText(u.status, u.statusDescription);

    const bioInput = document.getElementById('mypBioInput');
    if (bioInput) bioInput.oninput = () => {
        const cnt = document.getElementById('mypBioCount');
        if (cnt) cnt.textContent = bioInput.value.length;
    };
}

let _myBadgesEditing = false;

function _renderMyBadgesSection(u) {
    const badges = u.badges || [];
    if (badges.length === 0) return '';
    const noBadgesLabel = t('profiles.my_profile.empty.no_badges', 'No badges');
    const badgesTitle = t('profiles.my_profile.sections.badges', 'Badges');
    const iconsHtml = badges.map(b => {
        const hidden = !b.showcased;
        return `<div class="myp-badge-item fd-vrc-badge-wrap${hidden ? ' myp-badge-hidden' : ''}${_myBadgesEditing ? ' myp-badge-editing' : ''}" data-badge-id="${esc(b.id)}" data-badge-img="${esc(b.imageUrl)}" data-badge-name="${encodeURIComponent(b.name)}" data-badge-desc="${encodeURIComponent(b.description || '')}" onclick="${_myBadgesEditing ? `toggleMyBadge('${esc(b.id)}')` : ''}"><img class="fd-vrc-badge-icon" src="${esc(b.imageUrl)}" alt="${esc(b.name)}" onerror="this.closest('.myp-badge-item').style.display='none'"></div>`;
    }).join('');
    return `<div class="myp-section">
        <div class="myp-section-header">
            <span class="myp-section-title">${badgesTitle}</span>
            <button class="myp-edit-btn" onclick="toggleBadgeEditMode()"><span class="msi" style="font-size:14px;">${_myBadgesEditing ? 'check' : 'edit'}</span></button>
        </div>
        <div class="myp-badges-row">${iconsHtml}</div>
    </div>`;
}

function toggleBadgeEditMode() {
    _myBadgesEditing = !_myBadgesEditing;
    renderMyProfileContent();
}

function toggleMyBadge(badgeId) {
    if (!currentVrcUser?.badges) return;
    const b = currentVrcUser.badges.find(x => x.id === badgeId);
    if (!b) return;
    const newShowcased = !b.showcased;
    // Optimistic update
    b.showcased = newShowcased;
    const wrap = document.querySelector(`.myp-badge-item[data-badge-id="${badgeId}"]`);
    if (wrap) wrap.classList.toggle('myp-badge-hidden', !newShowcased);
    sendToCS({ action: 'vrcUpdateBadge', badgeId, showcased: newShowcased });
}

function editMyField(field) {
    const VIEWS = { pronouns: 'mypPronounsView', bio: 'mypBioView', links: 'mypLinksView', languages: 'mypLangsView' };
    const EDITS = { pronouns: 'mypPronounsEdit', bio: 'mypBioEdit', links: 'mypLinksEdit', languages: 'mypLangsEdit' };
    // Close other open edit panels
    Object.keys(VIEWS).forEach(f => {
        if (f !== field) {
            const v = document.getElementById(VIEWS[f]); if (v) v.style.display = '';
            const e = document.getElementById(EDITS[f]); if (e) e.style.display = 'none';
        }
    });
    const viewEl = document.getElementById(VIEWS[field]);
    const editEl = document.getElementById(EDITS[field]);
    if (viewEl) viewEl.style.display = 'none';
    if (editEl) editEl.style.display = '';

    if (field === 'pronouns') {
        const inp = document.getElementById('mypPronounsInput');
        if (inp) { inp.value = currentVrcUser.pronouns || ''; inp.focus(); }
    } else if (field === 'bio') {
        const inp = document.getElementById('mypBioInput');
        if (inp) { inp.focus(); const cnt = document.getElementById('mypBioCount'); if (cnt) cnt.textContent = inp.value.length; }
    } else if (field === 'links') {
        _renderMyLinksInputs();
    } else if (field === 'languages') {
        _renderMyLangsEdit();
    }
}

function cancelMyField(field) {
    const VIEWS = { pronouns: 'mypPronounsView', bio: 'mypBioView', links: 'mypLinksView', languages: 'mypLangsView' };
    const EDITS = { pronouns: 'mypPronounsEdit', bio: 'mypBioEdit', links: 'mypLinksEdit', languages: 'mypLangsEdit' };
    const v = document.getElementById(VIEWS[field]); if (v) v.style.display = '';
    const e = document.getElementById(EDITS[field]); if (e) e.style.display = 'none';
}

function saveMyField(field) {
    const u = currentVrcUser;
    if (!u) return;
    const EDITS = { pronouns: 'mypPronounsEdit', bio: 'mypBioEdit', links: 'mypLinksEdit', languages: 'mypLangsEdit' };
    const saveBtn = document.querySelector(`#${EDITS[field]} .vrcn-btn-primary`);
    if (saveBtn) saveBtn.disabled = true;

    if (field === 'pronouns') {
        const pronouns = document.getElementById('mypPronounsInput')?.value ?? '';
        sendToCS({ action: 'vrcUpdateProfile', pronouns });
    } else if (field === 'bio') {
        const bio = document.getElementById('mypBioInput')?.value ?? '';
        sendToCS({ action: 'vrcUpdateProfile', bio });
    } else if (field === 'links') {
        const inputs = document.querySelectorAll('#mypLinksInputs .vrcn-edit-field');
        const bioLinks = Array.from(inputs).map(i => i.value.trim()).filter(Boolean).slice(0, 3);
        sendToCS({ action: 'vrcUpdateProfile', bioLinks });
    } else if (field === 'languages') {
        const chips = document.querySelectorAll('#mypLangsChips [data-lang]');
        const selectedLangs = Array.from(chips).map(c => c.dataset.lang);
        const nonLangTags = (u.tags||[]).filter(t => !t.startsWith('language_'));
        sendToCS({ action: 'vrcUpdateProfile', tags: [...nonLangTags, ...selectedLangs] });
    }
}

function _renderMyLinksInputs() {
    const container = document.getElementById('mypLinksInputs');
    if (!container) return;
    const links = currentVrcUser.bioLinks || [];
    container.innerHTML = [0, 1, 2].map(i =>
        `<div class="myp-link-row">
            <span class="myp-link-num">${i + 1}</span>
            <input type="url" class="vrcn-edit-field" placeholder="https://..." value="${esc(links[i]||'')}" maxlength="512" style="flex:1;">
        </div>`
    ).join('');
}

function _renderMyLangsEdit() {
    const selectedLangs = (currentVrcUser.tags||[]).filter(t => t.startsWith('language_'));
    _renderMyLangChips(selectedLangs, document.getElementById('mypLangsChips'));
    const sel = document.getElementById('mypLangSelect');
    if (!sel) return;
    sel.innerHTML = `<option value="">${t('profiles.my_profile.add_language', 'Add language...')}</option>`;
    Object.entries(LANG_MAP).forEach(([key, name]) => {
        if (!selectedLangs.includes(key))
            sel.insertAdjacentHTML('beforeend', `<option value="${key}">${esc(name)}</option>`);
    });
}

function _renderMyLangChips(langs, el) {
    if (!el) return;
    el.innerHTML = langs.map(tag =>
        `<span class="myp-lang-chip" data-lang="${tag}">${esc(LANG_MAP[tag]||tag.replace('language_','').toUpperCase())}<button class="myp-lang-remove" onclick="removeMyLanguage('${tag}')"><span class="msi" style="font-size:11px;">close</span></button></span>`
    ).join('');
}

function addMyLanguage() {
    const sel = document.getElementById('mypLangSelect');
    const key = sel?.value;
    if (!key) return;
    const chips = Array.from(document.querySelectorAll('#mypLangsChips [data-lang]')).map(c => c.dataset.lang);
    if (chips.includes(key)) return;
    chips.push(key);
    _renderMyLangChips(chips, document.getElementById('mypLangsChips'));
    const opt = sel.querySelector(`option[value="${key}"]`);
    if (opt) opt.remove();
    sel.value = '';
}

function removeMyLanguage(tag) {
    const chips = Array.from(document.querySelectorAll('#mypLangsChips [data-lang]')).map(c => c.dataset.lang).filter(t => t !== tag);
    _renderMyLangChips(chips, document.getElementById('mypLangsChips'));
    const sel = document.getElementById('mypLangSelect');
    if (sel) sel.insertAdjacentHTML('beforeend', `<option value="${tag}">${esc(LANG_MAP[tag]||tag.replace('language_','').toUpperCase())}</option>`);
}



function openStatusModal() {
    if (!currentVrcUser) return;
    selectedStatus = currentVrcUser.status || 'active';
    const m = document.getElementById('modalStatus');
    const opts = document.getElementById('statusOptions');
    opts.innerHTML = STATUS_LIST.map(s =>
        `<div class="status-option${selectedStatus === s.key ? ' selected' : ''}" data-status-key="${s.key}" onclick="selectStatusOption('${s.key}')"><div class="status-option-dot" style="background:${s.color}"></div><div><div class="status-option-label">${t(s.labelKey || '', s.label)}</div><div class="status-option-desc">${t(s.descKey || '', s.desc)}</div></div></div>`
    ).join('');
    const inp = document.getElementById('statusDescInput');
    inp.value = currentVrcUser.statusDescription || '';
    document.getElementById('statusDescCount').textContent = (inp.value.length) + '/32';
    inp.oninput = () => {
        document.getElementById('statusDescCount').textContent = inp.value.length + '/32';
    };
    m.style.display = 'flex';
    setTimeout(() => inp.focus(), 100);
}

function selectStatusOption(key) {
    selectedStatus = key;
    document.querySelectorAll('.status-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.statusKey === key);
    });
}

function submitStatusChange() {
    const desc = document.getElementById('statusDescInput').value.trim();
    sendToCS({ action: 'vrcUpdateStatus', status: selectedStatus, statusDescription: desc });
    document.getElementById('modalStatus').style.display = 'none';
}

