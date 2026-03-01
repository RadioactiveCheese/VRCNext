/* === Update UI === */

let _updatePanelOpen = false;
let _updateInstalling = false;

function showUpdateAvailable(version) {
    document.getElementById('updVersion').textContent = version;
    document.getElementById('btnUpdate').style.display = '';
    // reset panel to initial state in case it was used before
    setUpdProgress(false);
    document.getElementById('updBtn').disabled = false;
    document.getElementById('updBtn').innerHTML = '<span class="msi" style="font-size:16px;">download</span> Download &amp; Install';
}

function toggleUpdatePanel() {
    if (_updateInstalling) return;
    _updatePanelOpen = !_updatePanelOpen;
    document.getElementById('updatePanel').style.display = _updatePanelOpen ? '' : 'none';
    if (_updatePanelOpen) {
        // close notif panel if open
        const np = document.getElementById('notifPanel');
        if (np) np.style.display = 'none';
    }
}

function startUpdate() {
    if (_updateInstalling) return;
    _updateInstalling = true;
    document.getElementById('updBtn').disabled = true;
    document.getElementById('updBtn').innerHTML = '<span class="msi" style="font-size:16px;">hourglass_empty</span> Starting…';
    setUpdProgress(true, 0, 'Downloading…');
    sendToCS({ action: 'installUpdate' });
}

function setUpdProgress(visible, pct = 0, status = '') {
    document.getElementById('updProgressWrap').style.display = visible ? '' : 'none';
    document.getElementById('updProgressFill').style.width = pct + '%';
    document.getElementById('updStatus').textContent = status;
}

function onUpdateProgress(pct) {
    setUpdProgress(true, pct, `Downloading… ${pct}%`);
}

function onUpdateReady() {
    setUpdProgress(true, 100, 'Installing & restarting…');
    document.getElementById('updBtn').innerHTML = '<span class="msi" style="font-size:16px;">restart_alt</span> Restarting…';
}
