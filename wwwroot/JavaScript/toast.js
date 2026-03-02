/* === Unified Toast System ===
 * Single source of truth for ALL feedback toasts in the app.
 * showToast(ok, msg)        — action results (Blocked, Muted, Invite Sent, Saved, etc.)
 * showNotifToast(type, sender, message) — incoming VRChat notifications (invite received, friend request, etc.)
 */

function showToast(ok, msg) {
    const area = document.getElementById('notifToastArea');
    if (!area) return;
    const t = document.createElement('div');
    t.className = 'notif-toast';
    t.innerHTML = `<span class="msi" style="font-size:18px;color:${ok ? 'var(--ok)' : 'var(--err)'};">${ok ? 'check_circle' : 'error'}</span><div style="font-size:13px;">${esc(msg)}</div>`;
    area.appendChild(t);
    setTimeout(() => t.classList.add('notif-toast-show'), 10);
    setTimeout(() => { t.classList.remove('notif-toast-show'); setTimeout(() => t.remove(), 300); }, 3000);
}

function showNotifToast(type, sender, message) {
    const area = document.getElementById('notifToastArea');
    if (!area) return;
    const icon = type === 'invite' ? 'mail' : type === 'friendRequest' ? 'person_add' : 'notifications';
    const label = type === 'invite' ? 'Invite' : type === 'friendRequest' ? 'Friend Request' : type;
    const t = document.createElement('div');
    t.className = 'notif-toast';
    t.innerHTML = `<span class="msi" style="font-size:18px;color:var(--accent);">${icon}</span><div><strong>${esc(label)}</strong><div style="font-size:11px;color:var(--tx3);">from ${esc(sender)}${message ? ': ' + esc(message) : ''}</div></div>`;
    area.appendChild(t);
    setTimeout(() => t.classList.add('notif-toast-show'), 10);
    setTimeout(() => { t.classList.remove('notif-toast-show'); setTimeout(() => t.remove(), 300); }, 5000);
}
