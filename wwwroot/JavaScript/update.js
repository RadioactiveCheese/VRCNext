/* === Update UI === */

let _updatePanelOpen = false;
let _updateInstalling = false;
let _updateVersion = '';
let _updatePhase = 'idle';
let _updatePct = 0;

function updButtonHtml(icon, key, fallback) {
    return `<span class="msi" style="font-size:16px;">${icon}</span> ${t(key, fallback)}`;
}

function updStatusText() {
    if (_updatePhase === 'starting') return t('update.starting', 'Starting...');
    if (_updatePhase === 'downloading') return tf('update.downloading_progress', { percent: _updatePct }, 'Downloading... {percent}%');
    if (_updatePhase === 'installing') return t('update.installing_restarting', 'Installing & restarting...');
    return t('update.downloading', 'Downloading...');
}

function rerenderUpdateTranslations() {
    const btn = document.getElementById('updBtn');
    const status = document.getElementById('updStatus');
    if (btn) {
        if (_updatePhase === 'installing') btn.innerHTML = updButtonHtml('restart_alt', 'update.restarting', 'Restarting...');
        else if (_updatePhase === 'starting') btn.innerHTML = updButtonHtml('hourglass_empty', 'update.starting', 'Starting...');
        else btn.innerHTML = updButtonHtml('download', 'update.download_install', 'Download & Install');
    }
    if (status && document.getElementById('updProgressWrap')?.style.display !== 'none') {
        status.textContent = updStatusText();
    }
}

document.documentElement.addEventListener('languagechange', rerenderUpdateTranslations);

function showUpdateAvailable(version) {
    _updateVersion = version;
    _updatePhase = 'ready';
    _updatePct = 0;
    document.getElementById('updVersion').textContent = version;
    document.getElementById('btnUpdate').style.display = '';
    setUpdProgress(false);
    document.getElementById('updBtn').disabled = false;
    rerenderUpdateTranslations();
}

function toggleUpdatePanel() {
    if (_updateInstalling) return;
    _updatePanelOpen = !_updatePanelOpen;
    document.getElementById('updatePanel').style.display = _updatePanelOpen ? '' : 'none';
    if (_updatePanelOpen) {
        const np = document.getElementById('notifPanel');
        if (np) np.style.display = 'none';
    }
}

function startUpdate() {
    if (_updateInstalling) return;
    _updateInstalling = true;
    _updatePhase = 'starting';
    _updatePct = 0;
    document.getElementById('updBtn').disabled = true;
    rerenderUpdateTranslations();
    setUpdProgress(true, 0);
    sendToCS({ action: 'installUpdate' });
}

function setUpdProgress(visible, pct = 0) {
    _updatePct = pct;
    document.getElementById('updProgressWrap').style.display = visible ? '' : 'none';
    document.getElementById('updProgressFill').style.width = pct + '%';
    document.getElementById('updStatus').textContent = updStatusText();
}

function onUpdateProgress(pct) {
    _updatePhase = 'downloading';
    setUpdProgress(true, pct);
}

function onUpdateReady() {
    _updatePhase = 'installing';
    _updatePct = 100;
    setUpdProgress(true, 100);
    rerenderUpdateTranslations();
}
