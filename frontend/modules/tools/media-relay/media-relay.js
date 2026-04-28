// Media Relay

function addFileToList(f) {
    postedFiles.unshift(f);
    renderFileList();
}

function renderFileList() {
    const e = document.getElementById('fileList');
    if (!postedFiles.length) {
        e.innerHTML = `<div class="empty-msg">${t('relay.empty.posted_files', 'No files posted yet')}</div>`;
        return;
    }
    e.innerHTML = postedFiles.map((f, i) =>
        `<div class="file-row"><span class="file-name">${esc(f.name)}</span><span class="file-channel">${esc(f.channel)}</span><span class="file-size">${f.size}</span><span class="file-time">${f.time}</span><button class="file-del" onclick="deleteFile(${i})" title="${esc(t('common.delete', 'Delete'))}"><span class="msi" style="font-size:16px;">delete</span></button></div>`
    ).join('');
}

function deleteFile(i) {
    const f = postedFiles[i];
    if (f?.messageId) sendToCS({ action: 'deletePost', messageId: f.messageId, webhookUrl: f.webhookUrl });
}

function renderWebhookCards(w) {
    const e = document.getElementById('whCards'), s = (w || []).slice(0, 4);
    while (s.length < 4) s.push({});
    e.innerHTML = s.map((w, i) =>
        `<div class="wh-card"><div class="wh-top"><span class="wh-num">#${i + 1}</span><input class="vrcn-edit-field" id="whName${i}" value="${esc(w.Name || w.name || '')}" placeholder="${esc(tf('relay.webhook.channel_placeholder', { index: i + 1 }, `Channel ${i + 1}`))}" style="width:120px;" oninput="autoSave()"><label class="toggle"><input type="checkbox" id="whOn${i}" ${(w.Enabled || w.enabled) ? 'checked' : ''} onchange="autoSave()"><div class="toggle-track"><div class="toggle-knob"></div></div></label></div><input class="vrcn-edit-field" id="whUrl${i}" value="${esc(w.Url || w.url || '')}" placeholder="${esc(t('relay.webhook.url_placeholder', 'https://discord.com/api/webhooks/...'))}" style="width:100%;" oninput="autoSave()"></div>`
    ).join('');
}
