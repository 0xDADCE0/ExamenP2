// src/services/notification.service.js
const clients = new Map(); // user_id -> Set(res)

function addClient(userId, res) {
    let set = clients.get(userId);
    if (!set) {
        set = new Set();
        clients.set(userId, set);
    }
    set.add(res);
}

function removeClient(userId, res) {
    const set = clients.get(userId);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) {
        clients.delete(userId);
    }
}

function sendToUser(userId, data) {
    const set = clients.get(userId);
    if (!set) return;

    const payload = `data: ${JSON.stringify(data)}\n\n`;

    for (const res of set) {
        try {
            res.write(payload);
        } catch (e) {
            // Si se rompe el socket, se limpia en el on('close')
        }
    }
}

module.exports = {
    addClient,
    removeClient,
    sendToUser
};
