// ============================================================
// Synopsys Ping Pong VN07 Club - Ranking System
// ============================================================

// ============================================================
// Google Sheets Sync Configuration
// ============================================================
// Paste your Google Apps Script Web App URL here after deployment:
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzwoaEsQ85gSG_w2HC4XOFUKCJOEJxPBwgMlhIaCR1AiR7PnfYHSSDb36WvBRDJWIJk/exec';

// ============================================================
// Sync Manager — Google Sheets Backend
// ============================================================
class SyncManager {
    constructor() {
        this.apiUrl = SHEETS_API_URL;
        this.enabled = !!this.apiUrl;
        this._saving = false;
        this._pendingSave = null;
    }

    async fetchAll(extraParams) {
        if (!this.enabled) return null;
        try {
            let url = this.apiUrl + '?t=' + Date.now();
            if (extraParams) Object.keys(extraParams).forEach(k => {
                url += '&' + k + '=' + encodeURIComponent(extraParams[k]);
            });
            const res = await fetch(url, { redirect: 'follow' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return await res.json();
        } catch (e) {
            console.warn('[Sync] fetch failed:', e);
            return null;
        }
    }

    async save(data) {
        if (!this.enabled) return;
        this._pendingSave = data;
        if (this._saving) return;
        this._saving = true;
        try {
            while (this._pendingSave) {
                const payload = this._pendingSave;
                this._pendingSave = null;
                const res = await fetch(this.apiUrl, {
                    method: 'POST',
                    redirect: 'follow',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) console.warn('[Sync] save HTTP', res.status);
            }
        } catch (e) {
            console.warn('[Sync] save failed:', e);
        } finally {
            this._saving = false;
        }
    }
}

const sync = new SyncManager();

// ============================================================
// Player & Match Configuration
// ============================================================

const INITIAL_PLAYERS = [
    { id: 1,  name: "Nguyễn Thế Sự",        group: "Field", rating: 800 },
    { id: 2,  name: "Do Nguyen Hoang Vu",    group: "Field", rating: 820 },
    { id: 3,  name: "Pham Thieu Khang",      group: "PV",    rating: 990 },
    { id: 4,  name: "Hoàng Quốc Khánh",      group: "PD",    rating: 700 },
    { id: 5,  name: "Nam Nguyen",             group: "Field", rating: 770 },
    { id: 6,  name: "Huynh Nguyen",           group: "SSG",   rating: 760 },
    { id: 7,  name: "Huy Hoang",              group: "SSG",   rating: 770 },
    { id: 8,  name: "Nghia Huynh",            group: "AE",    rating: 600 },
    { id: 9,  name: "Hùng Nguyễn",            group: "AE",    rating: 500 },
    { id: 10, name: "Tú Bùi",                 group: "AE",    rating: 500 },
    { id: 11, name: "Khang Nguyễn",           group: "AE",    rating: 750 },
    { id: 12, name: "Phu-Qui Pham",           group: "AE",    rating: 400 },
    { id: 13, name: "Chồng Nhật Cường",       group: "IPG",   rating: 790 },
    { id: 14, name: "Las Tran",               group: "AE",    rating: 500 },
    { id: 15, name: "Harry Luong",            group: "SSG",   rating: 700 },
    { id: 16, name: "Thuc Nguyen",            group: "CSG",   rating: 650 },
    { id: 17, name: "Khanh Nguyen",           group: "SSG",   rating: 400 },
    { id: 18, name: "Nguyen Ngoc Tien",       group: "CSG",   rating: 650 },
    { id: 19, name: "Le Ngoc Thao",           group: "CSG",   rating: 750 },
    { id: 20, name: "Tyluke",                 group: "IPG",   rating: 760 },
    { id: 21, name: "Kyrene Gay Paglumotan",  group: "TPG",   rating: 650 },
    { id: 22, name: "Võ Quang Thanh Nghĩa",   group: "Field", rating: 600 },
    { id: 23, name: "Vo Ngoc Hieu",           group: "SSG",   rating: 500 },
    { id: 24, name: "Ngo Tran Viet Khai",     group: "SSG",   rating: 500 },
    { id: 25, name: "Thinh Ta",               group: "Field", rating: 790 },
    { id: 26, name: "Nguyễn Kim Anh",         group: "Field", rating: 600 },
    { id: 27, name: "Trần Thanh Liêm",        group: "SSG",   rating: 500 },
    { id: 28, name: "Châu Pham",              group: "CSG",   rating: 400 },
    { id: 29, name: "Tân Nguyễn",             group: "CSG",   rating: 500 },
    { id: 30, name: "Hanh Pham",              group: "CSG",   rating: 400 },
    { id: 31, name: "Cuong Truong",           group: "CSG",   rating: 500 },
    { id: 32, name: "Qui Nguyen",             group: "CSG",   rating: 600 },
    { id: 33, name: "Dương Chí Tông",         group: "SSG",   rating: 700 },
    { id: 34, name: "Jane Nguyen",            group: "Field", rating: 700 },
    { id: 35, name: "Huy Nguyen",             group: "TPG",   rating: 500 },
];

const FUN_HANDICAP_LABELS = {
    'tay-trai': '🤚 Tay Trái',
    'vot-ngan': '🏓 Vợt Ngắn',
    'nua-ban': '🎯 Nửa Bàn',
    'doi-vot': '🔄 Đổi Vợt',
    '1-vs-2': '👥 1 vs 2',
    '1-mat': '🏓 Chỉ 1 Mặt (FH/BH)',
    'khong-xoay': '🚫 Không Xoáy Ngang',
    'friday-night': '🍺 Friday Night',
    'plank': '💪 Plank',
};

const K_FACTOR = 32;
const FORM_WINDOW = 5;
const STORAGE_PREFIX = 'snps_pp_';

// ============================================================
// Password Hashing (SHA-256)
// ============================================================
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_snps_pp_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================
// Auth System
// ============================================================
class Auth {
    constructor() {
        this._users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
        this._saveCooldown = false;
        this._cooldownTimer = null;
        this._ensureAdmin();
    }

    loadFromCloud(users) {
        if (this._saveCooldown) return;
        if (!Array.isArray(users) || !users.length) return;

        const cloudMap = new Map(users.map(u => [u.username, { ...u }]));
        const localMap = new Map(this._users.map(u => [u.username, u]));

        localMap.forEach((local, key) => {
            if (!cloudMap.has(key)) cloudMap.set(key, local);
            else {
                const merged = cloudMap.get(key);
                if (local.password && !merged.password) merged.password = local.password;
                if (local.playerId && !merged.playerId) merged.playerId = local.playerId;
                if (local.displayName && !merged.displayName) merged.displayName = local.displayName;
                if (local.reputation !== undefined && merged.reputation === undefined) merged.reputation = local.reputation;
                if (local.role && !merged.role) merged.role = local.role;
            }
        });

        this._users = Array.from(cloudMap.values());
        localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(this._users));
        this._ensureAdmin();
    }

    _ensureAdmin() {
        if (!this._users.find(u => u.username === 'admin')) {
            this._users.push({
                username: 'admin', password: null, displayName: 'Admin',
                role: 'admin', reputation: 5, needsSetup: true,
            });
            this._saveUsers();
        }
        this._users.forEach(u => {
            if (u.reputation === undefined) u.reputation = 5;
        });
    }

    _saveUsers() {
        localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(this._users));
        this._saveCooldown = true;
        clearTimeout(this._cooldownTimer);
        this._cooldownTimer = setTimeout(() => { this._saveCooldown = false; }, 10000);
        sync.save({ users: this._users });
    }

    async _migrateIfPlainText(user, plainPassword) {
        if (user.password && user.password.length !== 64) {
            user.password = await hashPassword(plainPassword);
            this._saveUsers();
        }
    }

    getUsers() { return this._users; }
    getUser(username) { return this._users.find(u => u.username === username); }
    isAdminNeedsSetup() { const a = this.getUser('admin'); return a && a.needsSetup; }

    async login(username, password) {
        const user = this._users.find(u => u.username === username);
        if (!user) return null;
        if (user.needsSetup) return null;
        const hashed = await hashPassword(password);
        if (user.password === hashed) {
            sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
            return user;
        }
        if (user.password === password) {
            await this._migrateIfPlainText(user, password);
            sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
            return user;
        }
        return null;
    }

    async setupAdmin(password) {
        const admin = this.getUser('admin');
        if (!admin) return null;
        admin.password = await hashPassword(password);
        admin.needsSetup = false;
        this._saveUsers();
        sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(admin));
        return admin;
    }

    loginGuest() {
        const guest = { username: '__guest__', displayName: 'Guest', role: 'guest' };
        sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(guest));
        return guest;
    }

    async register(username, password, customDisplayName, playerId, newPlayerData) {
        if (this._users.find(u => u.username === username)) return { error: 'Tên đăng nhập đã tồn tại!' };
        if (playerId && playerId !== '__new__') {
            const taken = this._users.find(u => u.playerId === parseInt(playerId));
            if (taken) return { error: `Tay vợt này đã được liên kết với tài khoản "${taken.username}"!` };
        }
        const displayName = customDisplayName || (newPlayerData ? newPlayerData.name : (this._getPlayerName ? this._getPlayerName(parseInt(playerId)) : username));
        const hashed = await hashPassword(password);
        const user = {
            username, password: hashed, displayName,
            role: 'user',
            reputation: 5,
            playerId: playerId === '__new__' ? null : (playerId ? parseInt(playerId) : null),
            registeredAt: new Date().toISOString(),
        };
        if (newPlayerData) user._pendingPlayer = newPlayerData;
        this._users.push(user);
        this._saveUsers();
        sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
        return user;
    }

    updateUser(username, updates) {
        const user = this.getUser(username);
        if (!user) return;
        Object.assign(user, updates);
        this._saveUsers();
        const session = this.getSession();
        if (session && session.username === username) {
            sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
        }
    }

    async changePassword(username, newPassword) {
        const user = this.getUser(username);
        if (!user) return;
        user.password = await hashPassword(newPassword);
        this._saveUsers();
    }

    adjustReputation(username, delta) {
        const user = this.getUser(username);
        if (!user) return;
        user.reputation = Math.max(0, Math.min(5, (user.reputation || 5) + delta));
        this._saveUsers();
    }

    deleteUser(username) {
        if (username === 'admin') return false;
        this._users = this._users.filter(u => u.username !== username);
        this._saveUsers();
        return true;
    }

    getSession() {
        const s = sessionStorage.getItem(STORAGE_PREFIX + 'session');
        return s ? JSON.parse(s) : null;
    }

    logout() { sessionStorage.removeItem(STORAGE_PREFIX + 'session'); }

    isAdmin() {
        const s = this.getSession();
        return s && s.role === 'admin';
    }
}

// ============================================================
// State Management
// ============================================================
class AppState {
    constructor() {
        const savedP = localStorage.getItem(STORAGE_PREFIX + 'players');
        this.players = savedP ? this._normalizePlayers(JSON.parse(savedP)) : INITIAL_PLAYERS.map(p => ({
            ...p, wins: 0, losses: 0, recentResults: [], streak: 0, streakType: null, initialRating: p.rating,
        }));
        this.matches = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'matches') || '[]');
        this.chat = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'chat') || '[]');
        this.challenges = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'challenges') || '[]');
        this.onChatUpdate = null;
        this.onChallengesUpdate = null;
    }

    loadFromCloud(data) {
        if (data.chat && Array.isArray(data.chat)) {
            this.chat = data.chat;
            localStorage.setItem(STORAGE_PREFIX + 'chat', JSON.stringify(this.chat));
            if (this.onChatUpdate) this.onChatUpdate();
        }
        if (data.challenges && Array.isArray(data.challenges)) {
            this.challenges = data.challenges;
            localStorage.setItem(STORAGE_PREFIX + 'challenges', JSON.stringify(this.challenges));
            if (this.onChallengesUpdate) this.onChallengesUpdate();
        }
        if (this._saveCooldown) return;
        if (data.players && Array.isArray(data.players) && data.players.length) {
            this.players = this._normalizePlayers(data.players);
            localStorage.setItem(STORAGE_PREFIX + 'players', JSON.stringify(this.players));
        }
        if (data.matches && Array.isArray(data.matches) && data.matches.length) {
            this.matches = data.matches.sort((a, b) => b.id - a.id);
            localStorage.setItem(STORAGE_PREFIX + 'matches', JSON.stringify(this.matches));
        }
    }

    savePlayers() {
        localStorage.setItem(STORAGE_PREFIX + 'players', JSON.stringify(this.players));
        this._pushToCloud();
    }

    saveMatches() {
        localStorage.setItem(STORAGE_PREFIX + 'matches', JSON.stringify(this.matches));
        this._pushToCloud();
    }

    _pushToCloud() {
        this._saveCooldown = true;
        clearTimeout(this._cooldownTimer);
        this._cooldownTimer = setTimeout(() => { this._saveCooldown = false; }, 8000);
        clearTimeout(this._syncTimer);
        this._syncTimer = setTimeout(() => {
            sync.save({ players: this.players, matches: this.matches });
        }, 300);
    }

    _normalizePlayer(p) {
        p.wins = p.wins || 0;
        p.losses = p.losses || 0;
        p.recentResults = p.recentResults || [];
        p.streak = p.streak || 0;
        p.streakType = p.streakType || null;
        p.initialRating = p.initialRating || p.rating;
        p.lastDelta = p.lastDelta || 0;
        p.email = p.email || '';
        return p;
    }

    restoreEmails() {
        const emailMap = {
            1:'thesu@synopsys.com', 2:'hoangvu@synopsys.com', 3:'thiepham@synopsys.com',
            4:'qhoang@synopsys.com', 5:'namn@synopsys.com', 6:'vanhuynh@synopsys.com',
            7:'huyh@synopsys.com', 8:'lhuynh@synopsys.com', 9:'minguyen@synopsys.com',
            10:'tubui@synopsys.com', 11:'phanvi@synopsys.com', 12:'phuqui@synopsys.com',
            13:'nchong@synopsys.com', 14:'baonhung@synopsys.com', 15:'hluong@synopsys.com',
            16:'thuc@synopsys.com', 17:'thiki@synopsys.com', 18:'ngoctien@synopsys.com',
            19:'thaol@synopsys.com', 20:'dinhty@synopsys.com', 21:'paglu@synopsys.com',
            22:'qvo@synopsys.com', 23:'ngochieu@synopsys.com', 24:'trngo@synopsys.com',
            25:'qta@synopsys.com', 26:'nguyenj@synopsys.com', 27:'thanhl@synopsys.com',
            28:'chaupham@synopsys.com', 29:'hoangtan@synopsys.com', 30:'hieuhanh@synopsys.com',
            31:'ctruong@synopsys.com', 32:'thanhqui@synopsys.com', 33:'chitong@synopsys.com',
            34:'chitong@synopsys.com', 35:'duchuyn@synopsys.com',
        };
        let fixed = 0;
        this.players.forEach(p => {
            if (emailMap[p.id] && (!p.email || p.email === '')) {
                p.email = emailMap[p.id];
                fixed++;
            }
        });
        if (fixed > 0) {
            this.savePlayers();
            console.log(`[Restore] Đã khôi phục ${fixed} email.`);
        }
    }

    _normalizePlayers(players) {
        return players.map(p => this._normalizePlayer(p));
    }

    getPlayer(id) { return this.players.find(p => p.id === id); }

    getSortedPlayers() { return [...this.players].sort((a, b) => b.rating - a.rating); }

    getGroups() { return [...new Set(this.players.map(p => p.group))].sort(); }

    getAccumulatedStats(fromDate) {
        const stats = {};
        this.players.forEach(p => { stats[p.id] = { id: p.id, name: p.name, group: p.group, totalChange: 0, wins: 0, losses: 0, matches: 0 }; });
        this.matches.forEach(m => {
            if (m.date < fromDate) return;
            if (stats[m.playerAId]) {
                stats[m.playerAId].totalChange += m.ratingChangeA;
                stats[m.playerAId].matches++;
                if (m.winnerId === m.playerAId) stats[m.playerAId].wins++; else stats[m.playerAId].losses++;
            }
            if (stats[m.playerBId]) {
                stats[m.playerBId].totalChange += m.ratingChangeB;
                stats[m.playerBId].matches++;
                if (m.winnerId === m.playerBId) stats[m.playerBId].wins++; else stats[m.playerBId].losses++;
            }
        });
        return Object.values(stats).filter(s => s.matches > 0).sort((a, b) => b.totalChange - a.totalChange);
    }

    calculateElo(ratingA, ratingB, scoreA) {
        const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
        return Math.round(K_FACTOR * (scoreA - expectedA));
    }

    adjustRating(playerId, newRating) {
        const p = this.getPlayer(playerId);
        if (p) { p.rating = Math.max(100, Math.min(2000, newRating)); this.savePlayers(); }
    }

    editPlayer(playerId, updates) {
        const p = this.getPlayer(playerId);
        if (!p) return;
        if (updates.name) p.name = updates.name;
        if (updates.email !== undefined) p.email = updates.email;
        if (updates.group) p.group = updates.group;
        if (updates.rating !== undefined) p.rating = Math.max(100, Math.min(2000, updates.rating));
        this.savePlayers();
    }

    resetKeepRatings() {
        this.players.forEach(p => {
            p.initialRating = p.rating;
            p.wins = 0;
            p.losses = 0;
            p.recentResults = [];
            p.streak = 0;
            p.streakType = null;
            p.lastDelta = 0;
        });
        this.matches = [];
        this.savePlayers();
        this.saveMatches();
    }

    addPlayer(name, group, email, rating) {
        const maxId = this.players.reduce((max, p) => Math.max(max, p.id), 0);
        const player = {
            id: maxId + 1, name, group, email,
            rating: Math.max(100, Math.min(2000, rating)),
            wins: 0, losses: 0, recentResults: [], streak: 0, streakType: null,
            initialRating: rating,
        };
        this.players.push(player);
        this.savePlayers();
        return player;
    }

    removePlayer(playerId) {
        this.players = this.players.filter(p => p.id !== playerId);
        this.savePlayers();
    }

    deleteMatch(matchId) {
        const idx = this.matches.findIndex(m => m.id === matchId);
        if (idx === -1) return false;
        this.matches.splice(idx, 1);
        this.saveMatches();
        return true;
    }

    recordMatch(playerAId, playerBId, sets, date, funHandicaps) {
        const playerA = this.getPlayer(playerAId);
        const playerB = this.getPlayer(playerBId);
        if (!playerA || !playerB) return null;

        let setsWonA = 0, setsWonB = 0;
        sets.forEach(s => {
            if (s.scoreA > s.scoreB) setsWonA++;
            else if (s.scoreB > s.scoreA) setsWonB++;
        });

        const winnerIsA = setsWonA > setsWonB;
        const ratingChange = this.calculateElo(playerA.rating, playerB.rating, winnerIsA ? 1 : 0);

        const match = {
            id: Date.now(), date,
            playerAId, playerBId,
            playerAName: playerA.name, playerBName: playerB.name,
            sets, setsWonA, setsWonB,
            winnerId: winnerIsA ? playerAId : playerBId,
            ratingChangeA: ratingChange, ratingChangeB: -ratingChange,
            ratingBeforeA: playerA.rating, ratingBeforeB: playerB.rating,
            funHandicaps: funHandicaps || [],
        };

        playerA.rating = Math.max(100, playerA.rating + ratingChange);
        playerB.rating = Math.max(100, playerB.rating - ratingChange);
        playerA.lastDelta = ratingChange;
        playerB.lastDelta = -ratingChange;

        if (winnerIsA) { playerA.wins++; playerB.losses++; playerA.recentResults.push('W'); playerB.recentResults.push('L'); }
        else { playerB.wins++; playerA.losses++; playerA.recentResults.push('L'); playerB.recentResults.push('W'); }

        if (playerA.recentResults.length > FORM_WINDOW) playerA.recentResults.shift();
        if (playerB.recentResults.length > FORM_WINDOW) playerB.recentResults.shift();

        this.updateStreak(playerA);
        this.updateStreak(playerB);
        this.matches.unshift(match);
        this.savePlayers();
        this.saveMatches();
        return match;
    }

    updateStreak(player) {
        if (player.recentResults.length === 0) { player.streak = 0; player.streakType = null; return; }
        const last = player.recentResults[player.recentResults.length - 1];
        let count = 0;
        for (let i = player.recentResults.length - 1; i >= 0; i--) {
            if (player.recentResults[i] === last) count++; else break;
        }
        player.streak = count;
        player.streakType = last;
    }

    resetData() {
        this.players = INITIAL_PLAYERS.map(p => ({
            ...p, wins: 0, losses: 0, recentResults: [], streak: 0, streakType: null, initialRating: p.rating,
        }));
        this.matches = [];
        this.savePlayers();
        this.saveMatches();
    }

    sendChat(username, displayName, message, type) {
        const MAX_MESSAGES = 200;
        const msg = {
            id: Date.now(),
            username, displayName, message,
            type: type || 'chat',
            time: new Date().toISOString(),
        };
        this.chat.push(msg);
        if (this.chat.length > MAX_MESSAGES) this.chat = this.chat.slice(-MAX_MESSAGES);
        localStorage.setItem(STORAGE_PREFIX + 'chat', JSON.stringify(this.chat));
        sync.save({ chat: this.chat });
        if (this.onChatUpdate) this.onChatUpdate();
        return msg;
    }

    clearChat() {
        this.chat = [];
        localStorage.setItem(STORAGE_PREFIX + 'chat', JSON.stringify(this.chat));
        sync.save({ chat: this.chat });
        if (this.onChatUpdate) this.onChatUpdate();
    }

    _saveChallenges() {
        localStorage.setItem(STORAGE_PREFIX + 'challenges', JSON.stringify(this.challenges));
        sync.save({ challenges: this.challenges });
        if (this.onChallengesUpdate) this.onChallengesUpdate();
    }

    createChallenge(fromUser, toUser, fromPlayerId, toPlayerId) {
        const pending = this.challenges.find(c =>
            c.status === 'pending' && c.fromUser === fromUser && c.toUser === toUser
        );
        if (pending) return { error: 'Bạn đã gửi thách đấu cho người này rồi!' };
        const ch = {
            id: Date.now(), fromUser, toUser, fromPlayerId, toPlayerId,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        this.challenges.push(ch);
        this._saveChallenges();
        return ch;
    }

    respondChallenge(challengeId, accept, auth) {
        const ch = this.challenges.find(c => c.id === challengeId);
        if (!ch || ch.status !== 'pending') return null;
        ch.status = accept ? 'accepted' : 'declined';
        ch.respondedAt = new Date().toISOString();
        if (!accept) {
            const declineCount = this.challenges.filter(c =>
                c.toUser === ch.toUser && c.fromUser === ch.fromUser && c.status === 'declined'
            ).length;
            if (declineCount >= 3 && auth) {
                auth.adjustReputation(ch.toUser, -0.5);
            }
        }
        this._saveChallenges();
        return ch;
    }

    submitChallengeScore(challengeId, sets, submittedBy) {
        const ch = this.challenges.find(c => c.id === challengeId);
        if (!ch || (ch.status !== 'accepted' && ch.status !== 'score_submitted')) return null;
        ch.status = 'score_submitted';
        ch.sets = sets;
        ch.submittedBy = submittedBy;
        ch.submittedAt = new Date().toISOString();
        this._saveChallenges();
        return ch;
    }

    approveChallengeScore(challengeId) {
        const ch = this.challenges.find(c => c.id === challengeId && c.status === 'score_submitted');
        if (!ch || !ch.sets) return null;
        const match = this.recordMatch(ch.fromPlayerId, ch.toPlayerId, ch.sets, ch.submittedAt.split('T')[0], []);
        if (match) {
            match.challengeId = ch.id;
            ch.status = 'completed';
            ch.matchId = match.id;
            this._saveChallenges();
        }
        return match;
    }

    rejectChallengeScore(challengeId) {
        const ch = this.challenges.find(c => c.id === challengeId && c.status === 'score_submitted');
        if (!ch) return null;
        ch.status = 'accepted';
        delete ch.sets;
        delete ch.submittedBy;
        delete ch.submittedAt;
        this._saveChallenges();
        return ch;
    }

    completeChallenge(challengeId) {
        const ch = this.challenges.find(c => c.id === challengeId);
        if (!ch) return;
        ch.status = 'completed';
        this._saveChallenges();
    }

    createDirectMatch(playerAId, playerBId, sets, submittedBy) {
        const playerA = this.getPlayer(playerAId);
        const playerB = this.getPlayer(playerBId);
        if (!playerA || !playerB) return { error: 'Không tìm thấy tay vợt!' };
        const dm = {
            id: Date.now(), type: 'direct',
            fromUser: submittedBy, toUser: null,
            fromPlayerId: playerAId, toPlayerId: playerBId,
            status: 'score_submitted',
            sets, submittedBy,
            createdAt: new Date().toISOString(),
            submittedAt: new Date().toISOString(),
        };
        this.challenges.push(dm);
        this._saveChallenges();
        return dm;
    }

    getChallengesForUser(username) {
        return this.challenges.filter(c =>
            (c.fromUser === username || c.toUser === username) && c.status === 'pending'
        );
    }

    getAcceptedChallenges() {
        return this.challenges.filter(c => c.status === 'accepted');
    }

    getScoreSubmittedChallenges() {
        return this.challenges.filter(c => c.status === 'score_submitted');
    }
}

// ============================================================
// UI Controller
// ============================================================
class UI {
    constructor(state, auth) {
        this.state = state;
        this.auth = auth;
        this.currentSort = { field: 'rating', dir: 'desc' };
        this.initAuth();
    }

    // --- Auth UI ---
    initAuth() {
        const formMap = { guest: 'guestForm', login: 'loginForm', register: 'registerForm' };
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(formMap[tab.dataset.auth]).classList.add('active');
            });
        });

        document.getElementById('btnGuest').addEventListener('click', () => {
            this.enterApp(this.auth.loginGuest());
        });

        document.getElementById('loginForm').addEventListener('submit', async e => {
            e.preventDefault();
            const username = document.getElementById('loginUser').value.trim();
            const password = document.getElementById('loginPass').value;
            if (username === 'admin' && this.auth.isAdminNeedsSetup()) {
                this._showAdminSetup();
                return;
            }
            const user = await this.auth.login(username, password);
            if (user) this.enterApp(user);
            else document.getElementById('loginError').textContent = 'Sai tên đăng nhập hoặc mật khẩu!';
        });

        const regPlayerSel = document.getElementById('regPlayerId');
        const regNewFields = document.getElementById('regNewPlayerFields');
        if (regPlayerSel) {
            const sorted = this.state.getSortedPlayers();
            const takenIds = this.auth.getUsers().filter(u => u.playerId).map(u => u.playerId);
            sorted.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.name} (${p.rating} - ${p.group})`;
                if (takenIds.includes(p.id)) { opt.disabled = true; opt.textContent += ' [đã có TK]'; }
                regPlayerSel.appendChild(opt);
            });
            regPlayerSel.addEventListener('change', () => {
                regNewFields.style.display = regPlayerSel.value === '__new__' ? 'flex' : 'none';
            });
        }
        this.auth._getPlayerName = (id) => { const p = this.state.getPlayer(id); return p ? p.name : ''; };

        document.getElementById('registerForm').addEventListener('submit', async e => {
            e.preventDefault();
            const pass = document.getElementById('regPass').value;
            const confirmPass = document.getElementById('regPassConfirm').value;
            if (pass !== confirmPass) { document.getElementById('regError').textContent = 'Mật khẩu xác nhận không khớp!'; return; }
            const playerId = regPlayerSel.value;
            let newPlayerData = null;
            if (playerId === '__new__') {
                const name = document.getElementById('regPlayerName').value.trim();
                const email = document.getElementById('regPlayerEmail').value.trim();
                const group = document.getElementById('regPlayerGroup').value;
                const rating = parseInt(document.getElementById('regPlayerRating').value) || 500;
                if (!name) { document.getElementById('regError').textContent = 'Nhập tên tay vợt!'; return; }
                newPlayerData = { name, email, group, rating: Math.max(400, Math.min(2000, rating)) };
            } else if (!playerId) {
                document.getElementById('regError').textContent = 'Chọn tay vợt hoặc tạo mới!'; return;
            }
            const customName = document.getElementById('regDisplayName').value.trim();
            const result = await this.auth.register(
                document.getElementById('regUser').value.trim(), pass, customName, playerId, newPlayerData
            );
            if (result.error) { document.getElementById('regError').textContent = result.error; return; }
            if (newPlayerData) {
                const p = this.state.addPlayer(newPlayerData.name, newPlayerData.group, newPlayerData.email, newPlayerData.rating);
                this.auth.updateUser(result.username, { playerId: p.id, displayName: p.name });
                delete result._pendingPlayer;
            }
            const playerLinked = result.playerId ? this.state.getPlayer(result.playerId) : null;
            const regMsg = playerLinked
                ? `${result.displayName} vừa đăng ký tài khoản (tay vợt: ${playerLinked.name})`
                : `${result.displayName} vừa đăng ký tài khoản`;
            this.state.sendChat('system', 'Hệ thống', regMsg, 'system');
            this.enterApp(result);
        });

        const session = this.auth.getSession();
        if (session) this.enterApp(session);
    }

    enterApp(user) {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('appMain').style.display = 'block';
        document.getElementById('userName').textContent = user.displayName;

        const repEl = document.getElementById('userReputation');
        if (repEl && user.role !== 'guest') {
            const rep = user.reputation !== undefined ? user.reputation : 5;
            repEl.innerHTML = this._renderStars(rep);
            repEl.style.display = '';
        }

        const isAdmin = user.role === 'admin';
        const isUser = user.role === 'user';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
        document.querySelectorAll('.user-only').forEach(el => el.style.display = (isAdmin || isUser) ? '' : 'none');
        if (isAdmin) document.getElementById('adminTag').style.display = '';

        document.getElementById('btnLogout').addEventListener('click', () => {
            this.auth.logout();
            location.reload();
        });

        this.initApp();
    }

    _showAdminSetup() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `<div class="modal-card" style="max-width:400px;">
            <div class="modal-logo">
                <i class="fas fa-shield-halved"></i>
                <h2>Thiết lập Admin</h2>
            </div>
            <p style="text-align:center;color:var(--text-muted);font-size:13px;margin-bottom:16px;">
                Lần đầu đăng nhập. Hãy tạo mật khẩu Admin mới.</p>
            <div class="form-group"><label>Mật khẩu mới (6+ ký tự)</label>
                <input type="password" id="adminSetupPass" placeholder="Mật khẩu mới" minlength="6" class="form-input" required></div>
            <div class="form-group"><label>Xác nhận mật khẩu</label>
                <input type="password" id="adminSetupPassConfirm" placeholder="Nhập lại mật khẩu" class="form-input" required></div>
            <div class="auth-error" id="adminSetupError"></div>
            <button class="btn-auth" id="btnAdminSetup" style="width:100%;margin-top:8px;">Tạo mật khẩu & Đăng nhập</button>
        </div>`;
        document.body.appendChild(modal);

        modal.querySelector('#btnAdminSetup').addEventListener('click', async () => {
            const pass = modal.querySelector('#adminSetupPass').value;
            const confirm = modal.querySelector('#adminSetupPassConfirm').value;
            const err = modal.querySelector('#adminSetupError');
            if (pass.length < 6) { err.textContent = 'Mật khẩu tối thiểu 6 ký tự!'; return; }
            if (pass !== confirm) { err.textContent = 'Mật khẩu xác nhận không khớp!'; return; }
            const admin = await this.auth.setupAdmin(pass);
            if (admin) { modal.remove(); this.enterApp(admin); }
        });
    }

    initApp() {
        this.bindTabs();
        this.bindFilters();
        this.bindMatchForm();
        this.bindHistory();
        this.bindHandicapCalc();
        this.bindChat();
        this.bindChallenges();
        this.bindAdmin();
        this.bindAnnounce();
        this.populateSelects();
        this.render();
        document.getElementById('matchDate').valueAsDate = new Date();
    }

    _renderStars(rep) {
        const full = Math.floor(rep);
        const half = rep % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '<span class="stars">' +
            '<i class="fas fa-star"></i>'.repeat(full) +
            (half ? '<i class="fas fa-star-half-alt"></i>' : '') +
            '<i class="far fa-star"></i>'.repeat(empty) +
            '</span>';
    }

    bindTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
            });
        });
    }

    bindFilters() {
        const groupSelect = document.getElementById('filterGroup');
        this.state.getGroups().forEach(g => {
            const opt = document.createElement('option');
            opt.value = g; opt.textContent = g;
            groupSelect.appendChild(opt);
        });
        document.getElementById('searchPlayer').addEventListener('input', () => this.renderTable());
        groupSelect.addEventListener('change', () => this.renderTable());
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (this.currentSort.field === field) this.currentSort.dir = this.currentSort.dir === 'asc' ? 'desc' : 'asc';
                else this.currentSort = { field, dir: field === 'name' ? 'asc' : 'desc' };
                this.renderTable();
            });
        });
    }

    bindMatchForm() {
        const playerA = document.getElementById('playerA');
        const playerB = document.getElementById('playerB');

        const updatePreview = () => {
            this.updatePlayerPreview('previewA', playerA.value);
            this.updatePlayerPreview('previewB', playerB.value);
            this.updateMatchHandicapBanner();
            this.updateMatchSummary();
            this.validateMatchForm();
        };

        playerA.addEventListener('change', updatePreview);
        playerB.addEventListener('change', updatePreview);

        this.minSets = 3;
        this.maxSets = 7;
        this.currentSets = 0;
        for (let i = 0; i < this.minSets; i++) this.addSetRow();
        this.updateSetsUI();

        document.getElementById('btnAddSet').addEventListener('click', () => {
            if (this.currentSets < this.maxSets) { this.addSetRow(); this.updateSetsUI(); }
        });
        document.getElementById('btnRemoveSet').addEventListener('click', () => {
            if (this.currentSets > this.minSets) { this.removeSetRow(); this.updateSetsUI(); }
        });

        document.getElementById('submitMatch').addEventListener('click', () => this.submitMatch());
    }

    addSetRow() {
        this.currentSets++;
        const container = document.getElementById('setsContainer');
        const row = document.createElement('div');
        row.className = 'set-row';
        row.dataset.set = this.currentSets;
        row.innerHTML = `
            <span class="set-label">Set ${this.currentSets}</span>
            <input type="number" class="score-input score-a" min="0" max="30" placeholder="0">
            <span class="score-dash">-</span>
            <input type="number" class="score-input score-b" min="0" max="30" placeholder="0">
        `;
        container.appendChild(row);
        row.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('input', () => { this.updateMatchSummary(); this.validateMatchForm(); });
        });
    }

    removeSetRow() {
        const container = document.getElementById('setsContainer');
        if (container.lastElementChild) {
            container.removeChild(container.lastElementChild);
            this.currentSets--;
            this.updateMatchSummary();
            this.validateMatchForm();
        }
    }

    updateSetsUI() {
        document.getElementById('setsCount').textContent = `${this.currentSets} / ${this.maxSets} sets`;
        document.getElementById('btnAddSet').disabled = this.currentSets >= this.maxSets;
        document.getElementById('btnRemoveSet').disabled = this.currentSets <= this.minSets;
    }

    updateMatchHandicapBanner() {
        const aId = parseInt(document.getElementById('playerA').value);
        const bId = parseInt(document.getElementById('playerB').value);
        const banner = document.getElementById('matchHandicapBanner');
        const funSel = document.getElementById('funHandicapSelect');

        if (!aId || !bId || aId === bId) { banner.style.display = 'none'; funSel.style.display = 'none'; return; }

        const pA = this.state.getPlayer(aId);
        const pB = this.state.getPlayer(bId);
        const diff = Math.abs(pA.rating - pB.rating);
        const stronger = pA.rating >= pB.rating ? pA : pB;
        const weaker = pA.rating >= pB.rating ? pB : pA;
        const h = this.getHandicap(diff);

        banner.innerHTML = `
            <div class="hb-title"><i class="fas fa-scale-balanced"></i> Kèo Chấp Gợi Ý</div>
            <div class="hb-body">
                <strong>${stronger.name}</strong> (${stronger.rating}) chấp <strong>${weaker.name}</strong> (${weaker.rating})
                <div class="hb-sets">${h.sets[0]}-${h.sets[1]}-${h.sets[2]}</div>
                <span class="hb-label">${h.label} (chênh ${diff} điểm)</span>
            </div>
        `;
        banner.style.display = 'block';
        funSel.style.display = 'block';
    }

    bindHistory() {
        document.getElementById('clearHistory').addEventListener('click', () => {
            if (confirm('Xóa toàn bộ lịch sử? Điểm hiện tại sẽ được giữ lại.')) {
                this.state.resetKeepRatings();
                this.populateSelects();
                this.render();
                this.showToast('Đã xóa lịch sử, giữ nguyên điểm', 'info');
            }
        });
    }

    bindChat() {
        const session = this.auth.getSession();
        const isGuest = !session || session.role === 'guest';
        const inputArea = document.getElementById('chatInputArea');
        const loginPrompt = document.getElementById('chatLoginPrompt');
        const chatInput = document.getElementById('chatInput');

        if (isGuest) {
            if (inputArea) inputArea.querySelector('.chat-input-row').style.display = 'none';
            if (inputArea) inputArea.querySelector('.chat-quick-actions').style.display = 'none';
            if (loginPrompt) loginPrompt.style.display = 'flex';
        }

        const sendMessage = () => {
            if (isGuest) return;
            const text = chatInput.value.trim();
            if (!text) return;
            this.state.sendChat(session.username, session.displayName, text, 'chat');
            chatInput.value = '';
            chatInput.focus();
        };

        document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

        document.querySelectorAll('.chat-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (isGuest) return;
                this.state.sendChat(session.username, session.displayName, btn.dataset.msg, 'challenge');
            });
        });

        const clearBtn = document.getElementById('btnClearChat');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Xóa tất cả tin nhắn?')) {
                    this.state.clearChat();
                    this.showToast('Đã xóa tin nhắn', 'info');
                }
            });
        }

        this.state.onChatUpdate = () => this.renderChat();
        this.renderChat();
    }

    renderChat() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        const messages = this.state.chat;
        if (!messages.length) {
            container.innerHTML = '<div class="chat-empty"><i class="fas fa-comments"></i><p>Chưa có tin nhắn. Hãy gửi lời thách đấu đầu tiên!</p></div>';
            return;
        }
        const session = this.auth.getSession();
        const myName = session ? session.username : '';
        container.innerHTML = messages.map(m => {
            const isMine = m.username === myName;
            const isChallenge = m.type === 'challenge';
            const isResult = m.type === 'result';
            const isSystem = m.type === 'system';
            const time = new Date(m.time);
            const timeStr = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            const dateStr = time.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            const typeClass = isResult ? 'chat-result' : isSystem ? 'chat-system' : isChallenge ? 'chat-challenge' : '';
            const icon = isResult ? '<i class="fas fa-trophy"></i> ' : isSystem ? '<i class="fas fa-user-plus"></i> ' : isChallenge ? '<i class="fas fa-table-tennis-paddle-ball"></i> ' : '';
            return `<div class="chat-msg ${isMine ? 'chat-mine' : ''} ${typeClass}">
                <div class="chat-msg-header">
                    <span class="chat-sender">${m.displayName}</span>
                    <span class="chat-time">${dateStr} ${timeStr}</span>
                </div>
                <div class="chat-msg-body">${icon}${this._escapeHtml(m.message)}</div>
            </div>`;
        }).join('');
        container.scrollTop = container.scrollHeight;
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    _maskEmail(email) {
        if (!email) return '-';
        const [local, domain] = email.split('@');
        if (!domain) return '-';
        const masked = local.length <= 2 ? local[0] + '***' : local.slice(0, 2) + '***';
        return `${masked}@${domain}`;
    }

    bindChallenges() {
        const session = this.auth.getSession();
        const container = document.getElementById('challengeSection');
        if (!container) return;
        if (!session || session.role === 'guest') {
            container.innerHTML = '<p class="challenge-login-prompt"><i class="fas fa-lock"></i> Đăng nhập để sử dụng tính năng thách đấu.</p>';
            return;
        }

        const dmForm = document.getElementById('directMatchForm');
        if (dmForm && session.role !== 'guest') {
            const dmA = document.getElementById('dmPlayerA');
            const dmB = document.getElementById('dmPlayerB');
            this.state.getSortedPlayers().forEach(p => {
                const optA = new Option(`${p.name} (${p.rating})`, p.id);
                const optB = new Option(`${p.name} (${p.rating})`, p.id);
                dmA.appendChild(optA);
                dmB.appendChild(optB);
            });

            document.getElementById('dmAddSet').addEventListener('click', () => {
                const setsDiv = document.getElementById('dmSets');
                const count = setsDiv.querySelectorAll('.csf-set').length;
                if (count >= 7) { this.showToast('Tối đa 7 set!', 'info'); return; }
                const setEl = document.createElement('div');
                setEl.className = 'csf-set';
                setEl.innerHTML = `<span class="csf-set-label">Set ${count + 1}</span>
                    <input type="number" class="dm-score-a" min="0" max="30" placeholder="0">
                    <span>-</span>
                    <input type="number" class="dm-score-b" min="0" max="30" placeholder="0">
                    <button type="button" class="csf-remove-set" title="Xóa"><i class="fas fa-times"></i></button>`;
                setEl.querySelector('.csf-remove-set').addEventListener('click', () => setEl.remove());
                setsDiv.appendChild(setEl);
            });

            dmForm.addEventListener('submit', e => {
                e.preventDefault();
                const aId = parseInt(dmA.value);
                const bId = parseInt(dmB.value);
                if (!aId || !bId) { this.showToast('Chọn cả 2 tay vợt!', 'error'); return; }
                if (aId === bId) { this.showToast('Hai tay vợt phải khác nhau!', 'error'); return; }
                const setEls = document.querySelectorAll('#dmSets .csf-set');
                const sets = [];
                let valid = true;
                setEls.forEach(el => {
                    const a = parseInt(el.querySelector('.dm-score-a').value) || 0;
                    const b = parseInt(el.querySelector('.dm-score-b').value) || 0;
                    if (a === 0 && b === 0) valid = false;
                    sets.push({ scoreA: a, scoreB: b });
                });
                if (!valid || sets.length < 1) { this.showToast('Nhập đầy đủ tỉ số các set!', 'error'); return; }
                const result = this.state.createDirectMatch(aId, bId, sets, session.username);
                if (result.error) { this.showToast(result.error, 'error'); return; }
                this.showToast('Đã gửi kết quả, chờ Admin duyệt!', 'success');
                dmForm.reset();
                document.getElementById('dmSets').innerHTML = [1,2,3].map(i =>
                    `<div class="csf-set"><span class="csf-set-label">Set ${i}</span><input type="number" class="dm-score-a" min="0" max="30" placeholder="0"><span>-</span><input type="number" class="dm-score-b" min="0" max="30" placeholder="0"></div>`
                ).join('');
                this.renderChallenges();
            });
        }

        const createForm = document.getElementById('challengeCreateForm');
        if (createForm) {
            const select = document.getElementById('challengeTarget');
            if (select) {
                const users = this.auth.getUsers().filter(u => u.username !== session.username && u.username !== 'admin' && u.playerId);
                users.forEach(u => {
                    const player = this.state.getPlayer(u.playerId);
                    const opt = document.createElement('option');
                    opt.value = u.username;
                    opt.textContent = `${u.displayName} (${player ? player.rating : '?'} pts)`;
                    select.appendChild(opt);
                });
            }
            createForm.addEventListener('submit', e => {
                e.preventDefault();
                const targetUser = document.getElementById('challengeTarget').value;
                if (!targetUser) return;
                const myPlayer = session.playerId ? this.state.getPlayer(session.playerId) : null;
                const targetAccount = this.auth.getUser(targetUser);
                const targetPlayer = targetAccount && targetAccount.playerId ? this.state.getPlayer(targetAccount.playerId) : null;
                const result = this.state.createChallenge(
                    session.username, targetUser,
                    myPlayer ? myPlayer.id : null,
                    targetPlayer ? targetPlayer.id : null
                );
                if (result.error) this.showToast(result.error, 'error');
                else {
                    this.showToast(`Đã gửi thách đấu đến ${targetAccount.displayName}!`, 'success');
                    this.state.sendChat(session.username, session.displayName,
                        `thách đấu ${targetAccount.displayName}!`, 'challenge');
                }
            });
        }

        this.state.onChallengesUpdate = () => this.renderChallenges();
        this.renderChallenges();
    }

    renderChallenges() {
        const session = this.auth.getSession();
        if (!session || session.role === 'guest') return;
        const container = document.getElementById('challengeList');
        if (!container) return;
        const section = document.getElementById('challengeSection');
        if (section && section.querySelector('input:focus, select:focus')) return;

        const incoming = this.state.challenges.filter(c => c.toUser === session.username && c.status === 'pending');
        const outgoing = this.state.challenges.filter(c => c.fromUser === session.username && c.status === 'pending');
        const accepted = this.state.getAcceptedChallenges();

        let html = '';
        if (incoming.length) {
            html += '<h4><i class="fas fa-inbox"></i> Lời thách đấu nhận được</h4>';
            incoming.forEach(c => {
                const fromAccount = this.auth.getUser(c.fromUser);
                const fromPlayer = c.fromPlayerId ? this.state.getPlayer(c.fromPlayerId) : null;
                html += `<div class="challenge-card challenge-incoming">
                    <div class="challenge-info">
                        <strong>${fromAccount ? fromAccount.displayName : c.fromUser}</strong>
                        ${fromPlayer ? `<span class="challenge-rating">${fromPlayer.rating} pts</span>` : ''}
                        <span class="challenge-time">${new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="challenge-actions">
                        <button class="btn-accept" data-id="${c.id}"><i class="fas fa-check"></i> Chấp Nhận</button>
                        <button class="btn-decline" data-id="${c.id}"><i class="fas fa-times"></i> Từ Chối</button>
                    </div>
                </div>`;
            });
        }
        if (outgoing.length) {
            html += '<h4><i class="fas fa-paper-plane"></i> Đã gửi thách đấu</h4>';
            outgoing.forEach(c => {
                const toAccount = this.auth.getUser(c.toUser);
                html += `<div class="challenge-card challenge-outgoing">
                    <div class="challenge-info">
                        <strong>${toAccount ? toAccount.displayName : c.toUser}</strong>
                        <span class="challenge-time">${new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                        <span class="badge badge-pending">Chờ phản hồi</span>
                    </div>
                </div>`;
            });
        }
        if (accepted.length) {
            html += '<h4><i class="fas fa-handshake"></i> Đã chấp nhận - Nhập kết quả</h4>';
            accepted.forEach(c => {
                const fromAcc = this.auth.getUser(c.fromUser);
                const toAcc = this.auth.getUser(c.toUser);
                const fromPlayer = c.fromPlayerId ? this.state.getPlayer(c.fromPlayerId) : null;
                const toPlayer = c.toPlayerId ? this.state.getPlayer(c.toPlayerId) : null;
                const canSubmit = session.username === c.fromUser || session.username === c.toUser || session.role === 'admin';
                html += `<div class="challenge-card challenge-accepted">
                    <div class="challenge-info">
                        <strong>${fromAcc ? fromAcc.displayName : c.fromUser}</strong>
                        ${fromPlayer ? `<small>(${fromPlayer.rating})</small>` : ''} vs
                        <strong>${toAcc ? toAcc.displayName : c.toUser}</strong>
                        ${toPlayer ? `<small>(${toPlayer.rating})</small>` : ''}
                    </div>
                    ${canSubmit ? `<div class="challenge-score-form" data-id="${c.id}" data-a="${c.fromPlayerId}" data-b="${c.toPlayerId}">
                        <div class="csf-header">
                            <span class="csf-label">${fromPlayer ? fromPlayer.name : 'A'}</span>
                            <span class="csf-vs">vs</span>
                            <span class="csf-label">${toPlayer ? toPlayer.name : 'B'}</span>
                        </div>
                        <div class="csf-sets">
                            ${[1,2,3].map(i => `<div class="csf-set">
                                <span class="csf-set-label">Set ${i}</span>
                                <input type="number" class="csf-score-a" min="0" max="30" placeholder="0">
                                <span>-</span>
                                <input type="number" class="csf-score-b" min="0" max="30" placeholder="0">
                            </div>`).join('')}
                        </div>
                        <div class="csf-actions">
                            <button class="btn-add-set" data-id="${c.id}" title="Thêm set"><i class="fas fa-plus"></i> Set</button>
                            <button class="btn-submit-score" data-id="${c.id}"><i class="fas fa-paper-plane"></i> Gửi kết quả</button>
                        </div>
                    </div>` : `<span class="badge badge-accepted">Chờ nhập điểm</span>`}
                </div>`;
            });
        }

        const submitted = this.state.getScoreSubmittedChallenges().filter(c =>
            c.fromUser === session.username || c.toUser === session.username || session.role === 'admin'
        );
        if (submitted.length) {
            html += '<h4><i class="fas fa-clock"></i> Chờ Admin duyệt</h4>';
            submitted.forEach(c => {
                const isDirect = c.type === 'direct';
                const playerA = c.fromPlayerId ? this.state.getPlayer(c.fromPlayerId) : null;
                const playerB = c.toPlayerId ? this.state.getPlayer(c.toPlayerId) : null;
                const fromAcc = this.auth.getUser(c.fromUser);
                const toAcc = this.auth.getUser(c.toUser);
                const nameA = playerA ? playerA.name : (fromAcc ? fromAcc.displayName : c.fromUser);
                const nameB = playerB ? playerB.name : (toAcc ? toAcc.displayName : (c.toUser || '?'));
                const setsStr = (c.sets || []).map(s => `${s.scoreA}-${s.scoreB}`).join(', ');
                let setsA = 0, setsB = 0;
                (c.sets || []).forEach(s => { if (s.scoreA > s.scoreB) setsA++; else if (s.scoreB > s.scoreA) setsB++; });
                html += `<div class="challenge-card challenge-submitted">
                    <div class="challenge-info">
                        <strong>${nameA}</strong>
                        <span class="csf-result">${setsA}-${setsB}</span>
                        <strong>${nameB}</strong>
                    </div>
                    <div class="csf-detail">${isDirect ? '<span class="badge badge-direct"><i class="fas fa-pen"></i> Trực tiếp</span> ' : ''}Sets: ${setsStr}</div>
                    <span class="badge badge-submitted"><i class="fas fa-hourglass-half"></i> Chờ duyệt</span>
                </div>`;
            });
        }

        if (!html) html = '<div class="challenge-empty"><i class="fas fa-table-tennis-paddle-ball"></i><p>Chưa có lời thách đấu nào.</p></div>';
        container.innerHTML = html;

        container.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.respondChallenge(parseInt(btn.dataset.id), true, this.auth);
                this.showToast('Đã chấp nhận thách đấu!', 'success');
                this.renderChallenges();
            });
        });
        container.querySelectorAll('.btn-decline').forEach(btn => {
            btn.addEventListener('click', () => {
                const ch = this.state.challenges.find(c => c.id === parseInt(btn.dataset.id));
                const declineCount = this.state.challenges.filter(c =>
                    c.toUser === ch.toUser && c.fromUser === ch.fromUser && c.status === 'declined'
                ).length;
                let msg = 'Từ chối lời thách đấu?';
                if (declineCount >= 2) msg += '\n\nCảnh báo: Từ chối lần thứ 3 sẽ bị trừ điểm uy tín!';
                if (confirm(msg)) {
                    this.state.respondChallenge(parseInt(btn.dataset.id), false, this.auth);
                    this.showToast('Đã từ chối thách đấu.', 'info');
                    this.renderChallenges();
                }
            });
        });
        container.querySelectorAll('.btn-add-set').forEach(btn => {
            btn.addEventListener('click', () => {
                const form = container.querySelector(`.challenge-score-form[data-id="${btn.dataset.id}"]`);
                const setsDiv = form.querySelector('.csf-sets');
                const count = setsDiv.querySelectorAll('.csf-set').length;
                if (count >= 7) { this.showToast('Tối đa 7 set!', 'info'); return; }
                const setEl = document.createElement('div');
                setEl.className = 'csf-set';
                setEl.innerHTML = `<span class="csf-set-label">Set ${count + 1}</span>
                    <input type="number" class="csf-score-a" min="0" max="30" placeholder="0">
                    <span>-</span>
                    <input type="number" class="csf-score-b" min="0" max="30" placeholder="0">
                    <button class="csf-remove-set" title="Xóa"><i class="fas fa-times"></i></button>`;
                setEl.querySelector('.csf-remove-set').addEventListener('click', () => { setEl.remove(); });
                setsDiv.appendChild(setEl);
            });
        });
        container.querySelectorAll('.btn-submit-score').forEach(btn => {
            btn.addEventListener('click', () => {
                const cId = parseInt(btn.dataset.id);
                const form = container.querySelector(`.challenge-score-form[data-id="${cId}"]`);
                const setEls = form.querySelectorAll('.csf-set');
                const sets = [];
                let valid = true;
                setEls.forEach(el => {
                    const a = parseInt(el.querySelector('.csf-score-a').value) || 0;
                    const b = parseInt(el.querySelector('.csf-score-b').value) || 0;
                    if (a === 0 && b === 0) { valid = false; }
                    sets.push({ scoreA: a, scoreB: b });
                });
                if (!valid || sets.length < 1) { this.showToast('Nhập đầy đủ tỉ số các set!', 'error'); return; }
                const result = this.state.submitChallengeScore(cId, sets, session.username);
                if (result) {
                    this.showToast('Đã gửi kết quả, chờ Admin duyệt!', 'success');
                    this.renderChallenges();
                }
            });
        });
    }

    bindHandicapCalc() {
        const hA = document.getElementById('handicapPlayerA');
        const hB = document.getElementById('handicapPlayerB');
        const update = () => this.updateHandicapResult();
        hA.addEventListener('change', update);
        hB.addEventListener('change', update);

        const eloToggle = document.getElementById('eloToggle');
        const eloBody = document.getElementById('eloBody');
        if (eloToggle && eloBody) {
            eloToggle.addEventListener('click', () => {
                const open = eloBody.style.display !== 'none';
                eloBody.style.display = open ? 'none' : 'block';
                eloToggle.classList.toggle('open', !open);
            });
        }
    }

    bindAdmin() {
        const adjustPlayer = document.getElementById('adjustPlayer');
        const adjustRating = document.getElementById('adjustRating');
        const editFields = document.getElementById('editPlayerFields');
        const editName = document.getElementById('editName');
        const editEmail = document.getElementById('editEmail');
        const editGroup = document.getElementById('editGroup');

        adjustPlayer.addEventListener('change', () => {
            const p = this.state.getPlayer(parseInt(adjustPlayer.value));
            if (p) {
                editFields.style.display = 'block';
                editName.value = p.name;
                editEmail.value = p.email || '';
                editGroup.value = p.group;
                adjustRating.value = p.rating;
            } else {
                editFields.style.display = 'none';
            }
        });

        document.getElementById('btnAdjust').addEventListener('click', () => {
            const id = parseInt(adjustPlayer.value);
            if (!id) { this.showToast('Chọn tay vợt!', 'error'); return; }
            const name = editName.value.trim();
            if (!name) { this.showToast('Tên không được để trống!', 'error'); return; }
            this.state.editPlayer(id, {
                name,
                email: editEmail.value.trim(),
                group: editGroup.value,
                rating: parseInt(adjustRating.value) || 500
            });
            this.populateSelects();
            adjustPlayer.value = String(id);
            this.render();
            this.renderAdminHistory();
            this.showToast('Đã cập nhật thông tin!', 'success');
        });

        const addGroupSelect = document.getElementById('addPlayerGroup');
        const customGroupInput = document.getElementById('addPlayerCustomGroup');
        addGroupSelect.addEventListener('change', () => {
            customGroupInput.style.display = addGroupSelect.value === '__custom__' ? 'block' : 'none';
            if (addGroupSelect.value === '__custom__') customGroupInput.focus();
        });

        document.getElementById('btnAddPlayer').addEventListener('click', () => {
            const name = document.getElementById('addPlayerName').value.trim();
            let group = addGroupSelect.value;
            if (group === '__custom__') {
                group = customGroupInput.value.trim();
                if (!group) { this.showToast('Nhập tên nhóm mới!', 'error'); return; }
            }
            const email = document.getElementById('addPlayerEmail').value.trim();
            const rating = parseInt(document.getElementById('addPlayerRating').value) || 500;
            if (!name) { this.showToast('Nhập tên tay vợt!', 'error'); return; }
            this.state.addPlayer(name, group, email, rating);
            document.getElementById('addPlayerName').value = '';
            document.getElementById('addPlayerEmail').value = '';
            document.getElementById('addPlayerRating').value = '500';
            addGroupSelect.value = 'Field';
            customGroupInput.value = '';
            customGroupInput.style.display = 'none';
            this.populateSelects();
            this.render();
            this.showToast(`Đã thêm ${name}!`, 'success');
        });

        document.getElementById('btnRemovePlayer').addEventListener('click', () => {
            const id = parseInt(document.getElementById('removePlayer').value);
            if (!id) { this.showToast('Chọn tay vợt cần xóa!', 'error'); return; }
            const p = this.state.getPlayer(id);
            if (!confirm(`Xóa ${p.name} khỏi danh sách?`)) return;
            this.state.removePlayer(id);
            document.getElementById('removePlayer').value = '';
            this.populateSelects();
            this.render();
            this.renderAdminHistory();
            this.showToast(`Đã xóa ${p.name}`, 'info');
        });

        document.getElementById('btnResetAll').addEventListener('click', () => {
            if (confirm('RESET TẤT CẢ lịch sử? Điểm hiện tại sẽ được giữ lại làm điểm gốc mới. Thao tác không thể hoàn tác!')) {
                this.state.resetKeepRatings();
                this.populateSelects();
                this.render();
                this.renderAdminHistory();
                this.showToast('Đã reset lịch sử, giữ nguyên điểm hiện tại', 'info');
            }
        });

        this.renderAdminHistory();
        this.renderAdminUsers();
        this.renderAdminChallenges();
    }

    renderAdminChallenges() {
        const container = document.getElementById('adminChallengesList');
        if (!container) return;
        const submitted = this.state.getScoreSubmittedChallenges();
        const accepted = this.state.getAcceptedChallenges();

        if (!submitted.length && !accepted.length) {
            container.innerHTML = '<p class="admin-note">Không có thách đấu nào đang chờ xử lý.</p>';
            return;
        }

        let html = '';
        if (submitted.length) {
            html += '<h4 class="admin-section-label"><i class="fas fa-clipboard-check"></i> Chờ duyệt kết quả</h4>';
            html += submitted.map(c => {
                const fromAcc = this.auth.getUser(c.fromUser);
                const toAcc = this.auth.getUser(c.toUser);
                const fromPlayer = c.fromPlayerId ? this.state.getPlayer(c.fromPlayerId) : null;
                const toPlayer = c.toPlayerId ? this.state.getPlayer(c.toPlayerId) : null;
                const submitter = this.auth.getUser(c.submittedBy);
                const setsStr = (c.sets || []).map(s => `${s.scoreA}-${s.scoreB}`).join(', ');
                let setsA = 0, setsB = 0;
                (c.sets || []).forEach(s => { if (s.scoreA > s.scoreB) setsA++; else if (s.scoreB > s.scoreA) setsB++; });
                const isDirect = c.type === 'direct';
                return `<div class="admin-challenge-item achi-review">
                    <div class="achi-players">
                        <strong>${fromPlayer ? fromPlayer.name : (fromAcc ? fromAcc.displayName : c.fromUser)}</strong>
                        ${fromPlayer ? `<small>(${fromPlayer.rating})</small>` : ''}
                        <span class="achi-score-big">${setsA} - ${setsB}</span>
                        <strong>${toPlayer ? toPlayer.name : (toAcc ? toAcc.displayName : c.toUser)}</strong>
                        ${toPlayer ? `<small>(${toPlayer.rating})</small>` : ''}
                    </div>
                    <div class="achi-detail">
                        ${isDirect ? '<span class="badge badge-direct"><i class="fas fa-pen"></i> Nhập trực tiếp</span>' : ''}
                        <span>Sets: ${setsStr}</span>
                        <span class="achi-submitter">Gửi bởi: <strong>${submitter ? submitter.displayName : c.submittedBy}</strong></span>
                        <span class="achi-time">${new Date(c.submittedAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="achi-review-actions">
                        <button class="btn-approve-score" data-id="${c.id}"><i class="fas fa-check-circle"></i> Duyệt & Ghi nhận</button>
                        <button class="btn-reject-score" data-id="${c.id}"><i class="fas fa-redo"></i> Trả lại</button>
                    </div>
                </div>`;
            }).join('');
        }

        if (accepted.length) {
            html += '<h4 class="admin-section-label"><i class="fas fa-hourglass-half"></i> Đã chấp nhận (chờ nhập điểm)</h4>';
            html += accepted.map(c => {
                const fromAcc = this.auth.getUser(c.fromUser);
                const toAcc = this.auth.getUser(c.toUser);
                const fromPlayer = c.fromPlayerId ? this.state.getPlayer(c.fromPlayerId) : null;
                const toPlayer = c.toPlayerId ? this.state.getPlayer(c.toPlayerId) : null;
                return `<div class="admin-challenge-item">
                    <div class="achi-players">
                        <strong>${fromAcc ? fromAcc.displayName : c.fromUser}</strong>
                        ${fromPlayer ? `<small>(${fromPlayer.name} - ${fromPlayer.rating})</small>` : ''}
                        <span class="vs">VS</span>
                        <strong>${toAcc ? toAcc.displayName : c.toUser}</strong>
                        ${toPlayer ? `<small>(${toPlayer.name} - ${toPlayer.rating})</small>` : ''}
                    </div>
                    <div class="achi-meta">
                        <span class="achi-time">${new Date(c.respondedAt || c.createdAt).toLocaleString('vi-VN')}</span>
                        <span class="badge badge-accepted">Chờ user nhập điểm</span>
                    </div>
                </div>`;
            }).join('');
        }

        container.innerHTML = html;

        container.querySelectorAll('.btn-approve-score').forEach(btn => {
            btn.addEventListener('click', () => {
                const cId = parseInt(btn.dataset.id);
                if (!confirm('Duyệt kết quả và ghi nhận vào bảng xếp hạng?')) return;
                const ch = this.state.challenges.find(c => c.id === cId);
                const match = this.state.approveChallengeScore(cId);
                if (match) {
                    const winner = match.winnerId === match.playerAId ? match.playerAName : match.playerBName;
                    const loser = match.winnerId === match.playerAId ? match.playerBName : match.playerAName;
                    const setsW = match.winnerId === match.playerAId ? match.setsWonA : match.setsWonB;
                    const setsL = match.winnerId === match.playerAId ? match.setsWonB : match.setsWonA;
                    const changeW = match.winnerId === match.playerAId ? match.ratingChangeA : match.ratingChangeB;
                    const changeL = match.winnerId === match.playerAId ? match.ratingChangeB : match.ratingChangeA;
                    this.state.sendChat('system', 'Admin',
                        `${winner} thắng ${loser} (${setsW}-${setsL}) | ${winner} ${changeW > 0 ? '+' : ''}${changeW} pts, ${loser} ${changeL > 0 ? '+' : ''}${changeL} pts`,
                        'result');
                    this.render();
                    this.renderAdminChallenges();
                    this.renderAdminHistory();
                    this.showToast('Đã duyệt và ghi nhận kết quả!', 'success');
                } else {
                    this.showToast('Lỗi: Không thể ghi nhận kết quả.', 'error');
                }
            });
        });
        container.querySelectorAll('.btn-reject-score').forEach(btn => {
            btn.addEventListener('click', () => {
                const cId = parseInt(btn.dataset.id);
                if (!confirm('Trả kết quả lại cho user nhập lại?')) return;
                this.state.rejectChallengeScore(cId);
                this.renderAdminChallenges();
                this.showToast('Đã trả lại, user có thể nhập lại kết quả.', 'info');
            });
        });
    }

    renderAdminUsers() {
        const container = document.getElementById('adminUsersList');
        if (!container) return;
        const users = this.auth.getUsers();
        if (!users.length) {
            container.innerHTML = '<p class="admin-note">Chưa có tài khoản nào.</p>';
            return;
        }
        const roleLabels = { admin: 'Admin', user: 'User', guest: 'Guest' };
        container.innerHTML = `
            <table class="admin-users-table">
                <thead><tr><th>Username</th><th>Tên hiển thị</th><th>Tay vợt</th><th>Uy tín</th><th>Vai trò</th><th>Ngày ĐK</th><th></th></tr></thead>
                <tbody>${users.map(u => {
                    const linked = u.playerId ? this.state.getPlayer(u.playerId) : null;
                    return `<tr>
                        <td><code>${u.username}</code></td>
                        <td>${u.displayName || '-'}</td>
                        <td>${linked ? `${linked.name} <small>(${linked.rating})</small>` : '<em class="text-muted">Chưa liên kết</em>'}</td>
                        <td class="stars-col">${this._renderStars(u.reputation || 5)}</td>
                        <td><span class="role-badge role-${u.role}">${roleLabels[u.role] || u.role}</span></td>
                        <td class="date-col">${u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('vi-VN') : '-'}</td>
                        <td class="actions-col">${u.username !== 'admin' ? `
                            <button class="btn-edit-user" data-username="${u.username}" title="Chỉnh sửa"><i class="fas fa-pen"></i></button>
                            <button class="btn-delete-user" data-username="${u.username}" title="Xóa"><i class="fas fa-trash"></i></button>
                        ` : ''}</td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>`;
        container.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                if (!confirm(`Xóa tài khoản "${username}"?`)) return;
                this.auth.deleteUser(username);
                this.renderAdminUsers();
                this.showToast(`Đã xóa tài khoản ${username}`, 'info');
            });
        });
        container.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                const user = this.auth.getUser(username);
                if (!user) return;
                this._showEditUserModal(user);
            });
        });
    }

    _showEditUserModal(user) {
        const players = this.state.getSortedPlayers();
        const takenIds = this.auth.getUsers().filter(u => u.playerId && u.username !== user.username).map(u => u.playerId);
        const playerOpts = players.map(p =>
            `<option value="${p.id}" ${p.id === user.playerId ? 'selected' : ''} ${takenIds.includes(p.id) ? 'disabled' : ''}>` +
            `${p.name} (${p.rating}) ${takenIds.includes(p.id) ? '[đã liên kết]' : ''}</option>`
        ).join('');
        const repVal = user.reputation !== undefined ? user.reputation : 5;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `<div class="modal-card" style="max-width:460px;">
            <h3 style="margin-bottom:1rem;"><i class="fas fa-user-edit"></i> Chỉnh sửa: ${user.username}</h3>
            <div class="form-group"><label>Tên hiển thị</label>
                <input type="text" id="editUserDisplay" value="${user.displayName || ''}" class="form-input"></div>
            <div class="form-group"><label>Liên kết tay vợt</label>
                <select id="editUserPlayer" class="form-input">
                    <option value="">-- Chưa liên kết --</option>${playerOpts}</select></div>
            <div class="form-group"><label>Uy tín (0-5 sao)</label>
                <input type="number" id="editUserRep" value="${repVal}" min="0" max="5" step="0.5" class="form-input"></div>
            <div class="form-group"><label>Đặt lại mật khẩu</label>
                <input type="password" id="editUserNewPass" placeholder="Để trống nếu không đổi" class="form-input"></div>
            <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:1rem;">
                <button class="btn-secondary" id="editUserCancel">Hủy</button>
                <button class="btn-primary" id="editUserSave">Lưu</button></div>
        </div>`;
        document.body.appendChild(modal);

        modal.querySelector('#editUserCancel').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        modal.querySelector('#editUserSave').addEventListener('click', async () => {
            const displayName = modal.querySelector('#editUserDisplay').value.trim();
            const playerId = modal.querySelector('#editUserPlayer').value;
            const reputation = parseFloat(modal.querySelector('#editUserRep').value);
            const newPass = modal.querySelector('#editUserNewPass').value;
            this.auth.updateUser(user.username, {
                displayName: displayName || user.displayName,
                playerId: playerId ? parseInt(playerId) : null,
                reputation: Math.max(0, Math.min(5, reputation)),
            });
            if (newPass && newPass.length >= 4) {
                await this.auth.changePassword(user.username, newPass);
            }
            modal.remove();
            this.renderAdminUsers();
            this.showToast(`Đã cập nhật tài khoản ${user.username}`, 'success');
        });
    }

    renderAdminHistory() {
        const container = document.getElementById('adminHistoryList');
        if (!container) return;
        if (!this.state.matches.length) {
            container.innerHTML = '<p class="admin-note">Chưa có trận đấu nào.</p>';
            return;
        }
        container.innerHTML = this.state.matches.map(m => {
            const isAWin = m.winnerId === m.playerAId;
            const setsStr = m.sets.map(s => `${s.scoreA}-${s.scoreB}`).join(', ');
            return `<div class="admin-history-item">
                <div class="ahi-info">
                    <span class="ahi-date">${this.formatDate(m.date)}</span>
                    <span class="ahi-match ${isAWin ? '' : 'ahi-reverse'}">${m.playerAName} <strong>${m.setsWonA}-${m.setsWonB}</strong> ${m.playerBName}</span>
                    <span class="ahi-score">(${setsStr})</span>
                </div>
                <button class="btn-delete-match" data-match-id="${m.id}" title="Xóa trận này"><i class="fas fa-times"></i></button>
            </div>`;
        }).join('');

        container.querySelectorAll('.btn-delete-match').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!confirm('Xóa trận đấu này? (Điểm sẽ KHÔNG tự động hoàn lại)')) return;
                this.state.deleteMatch(parseInt(btn.dataset.matchId));
                this.render();
                this.renderAdminHistory();
                this.showToast('Đã xóa trận đấu', 'info');
            });
        });
    }

    bindAnnounce() {
        document.getElementById('btnAnnounce').addEventListener('click', () => this.showAnnouncement());
        document.getElementById('closeAnnounce').addEventListener('click', () => {
            document.getElementById('announceModal').style.display = 'none';
        });
        document.getElementById('announceModal').addEventListener('click', e => {
            if (e.target.id === 'announceModal') document.getElementById('announceModal').style.display = 'none';
        });
    }

    showAnnouncement() {
        const aId = parseInt(document.getElementById('handicapPlayerA').value);
        const bId = parseInt(document.getElementById('handicapPlayerB').value);
        if (!aId || !bId || aId === bId) { this.showToast('Chọn 2 tay vợt trước!', 'error'); return; }

        const pA = this.state.getPlayer(aId);
        const pB = this.state.getPlayer(bId);
        const diff = Math.abs(pA.rating - pB.rating);
        const stronger = pA.rating >= pB.rating ? pA : pB;
        const weaker = pA.rating >= pB.rating ? pB : pA;
        const h = this.getHandicap(diff);

        const selectedFun = [];
        document.querySelectorAll('#guideFunCheckList input:checked').forEach(cb => {
            selectedFun.push(FUN_HANDICAP_LABELS[cb.value] || cb.value);
        });

        const content = document.getElementById('announceContent');
        content.innerHTML = `
            <div class="announce-header">
                <i class="fas fa-bullhorn"></i>
                <h2>THÔNG BÁO TRẬN ĐẤU</h2>
            </div>
            <div class="announce-players">
                <div class="announce-p">
                    <div class="announce-name">${pA.name}</div>
                    <div class="announce-rating">${pA.rating} pts</div>
                </div>
                <div class="announce-vs">VS</div>
                <div class="announce-p">
                    <div class="announce-name">${pB.name}</div>
                    <div class="announce-rating">${pB.rating} pts</div>
                </div>
            </div>
            <div class="announce-handicap">
                <div class="announce-h-label">${h.label}</div>
                <div class="announce-h-sets">
                    <span>Set 1: <strong>0-${h.sets[0]}</strong></span>
                    <span>Set 2: <strong>0-${h.sets[1]}</strong></span>
                    <span>Set 3: <strong>0-${h.sets[2]}</strong></span>
                </div>
                <p>${stronger.name} chấp ${weaker.name}</p>
            </div>
            ${selectedFun.length > 0 ? `
            <div class="announce-fun">
                <div class="announce-fun-title">Kèo Vui Áp Dụng:</div>
                <div class="announce-fun-tags">${selectedFun.map(f => `<span class="announce-fun-tag">${f}</span>`).join('')}</div>
            </div>` : ''}
            <div class="announce-footer">Synopsys Ping Pong VN07 Club 🏓</div>
        `;
        document.getElementById('announceModal').style.display = 'flex';
    }

    getHandicap(diff) {
        if (diff <= 50)  return { sets: [0, 0, 0], label: 'Không chấp', level: 0 };
        if (diff <= 100) return { sets: [1, 1, 1], label: 'Chấp nhẹ', level: 1 };
        if (diff <= 150) return { sets: [2, 2, 2], label: 'Chấp vừa', level: 2 };
        if (diff <= 200) return { sets: [2, 3, 2], label: 'Chấp khá nhiều', level: 3 };
        if (diff <= 250) return { sets: [3, 3, 3], label: 'Chấp nhiều', level: 4 };
        if (diff <= 300) return { sets: [3, 4, 3], label: 'Chấp rất nhiều', level: 5 };
        if (diff <= 400) return { sets: [4, 5, 4], label: 'Chấp cực lớn', level: 6 };
        return { sets: [5, 6, 5], label: 'Sư phụ vs Đệ tử', level: 7 };
    }

    updateHandicapResult() {
        const aId = parseInt(document.getElementById('handicapPlayerA').value);
        const bId = parseInt(document.getElementById('handicapPlayerB').value);
        const result = document.getElementById('handicapResult');
        const funSel = document.getElementById('guideFunSelect');

        if (!aId || !bId || aId === bId) { result.style.display = 'none'; funSel.style.display = 'none'; return; }

        const pA = this.state.getPlayer(aId);
        const pB = this.state.getPlayer(bId);
        const diff = Math.abs(pA.rating - pB.rating);
        const stronger = pA.rating >= pB.rating ? pA : pB;
        const weaker = pA.rating >= pB.rating ? pB : pA;
        const h = this.getHandicap(diff);

        result.innerHTML = `
            <div class="handicap-result-card">
                <div class="hrc-players">
                    <div class="hrc-player hrc-stronger">
                        <div class="hrc-label">Người chấp</div>
                        <div class="hrc-name">${stronger.name}</div>
                        <div class="hrc-rating">${stronger.rating} pts</div>
                    </div>
                    <div class="hrc-arrow"><i class="fas fa-arrow-right"></i><div class="hrc-diff">Chênh ${diff} điểm</div></div>
                    <div class="hrc-player hrc-weaker">
                        <div class="hrc-label">Được chấp</div>
                        <div class="hrc-name">${weaker.name}</div>
                        <div class="hrc-rating">${weaker.rating} pts</div>
                    </div>
                </div>
                <div class="hrc-handicap">
                    <div class="hrc-handicap-label">${h.label}</div>
                    <div class="hrc-sets">
                        <span class="hrc-set">Set 1: <strong>0 - ${h.sets[0]}</strong></span>
                        <span class="hrc-set">Set 2: <strong>0 - ${h.sets[1]}</strong></span>
                        <span class="hrc-set">Set 3: <strong>0 - ${h.sets[2]}</strong></span>
                    </div>
                    <div class="hrc-note">${stronger.name} bắt đầu 0, ${weaker.name} được ${h.sets.join('-')} trước.</div>
                </div>
            </div>
        `;
        result.style.display = 'block';
        funSel.style.display = 'block';
    }

    populateSelects() {
        const sorted = this.state.getSortedPlayers();
        ['playerA', 'playerB', 'handicapPlayerA', 'handicapPlayerB', 'adjustPlayer', 'removePlayer'].forEach(selId => {
            const sel = document.getElementById(selId);
            if (!sel) return;
            const current = sel.value;
            while (sel.options.length > 1) sel.remove(1);
            sorted.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.name} (${p.rating} - ${p.group})`;
                sel.appendChild(opt);
            });
            sel.value = current;
        });
    }

    updatePlayerPreview(containerId, playerId) {
        const container = document.getElementById(containerId);
        if (!playerId) { container.innerHTML = ''; return; }
        const p = this.state.getPlayer(parseInt(playerId));
        if (!p) return;
        const form = this.getFormIndicator(p);
        container.innerHTML = `<div class="preview-card"><div class="preview-name">${p.name}</div><div class="preview-details"><span class="preview-rating">${p.rating} pts</span><span class="preview-group badge-${p.group.toLowerCase()}">${p.group}</span></div><div class="preview-record">${p.wins}W - ${p.losses}L ${form}</div></div>`;
    }

    updateMatchSummary() {
        const aId = parseInt(document.getElementById('playerA').value);
        const bId = parseInt(document.getElementById('playerB').value);
        const summary = document.getElementById('matchSummary');
        if (!aId || !bId || aId === bId) { summary.style.display = 'none'; return; }
        const sets = this.getSetScores();
        const validSets = sets.filter(s => s.scoreA > 0 || s.scoreB > 0);
        if (validSets.length === 0) { summary.style.display = 'none'; return; }
        const pA = this.state.getPlayer(aId), pB = this.state.getPlayer(bId);
        let setsA = 0, setsB = 0;
        validSets.forEach(s => { if (s.scoreA > s.scoreB) setsA++; else if (s.scoreB > s.scoreA) setsB++; });
        const winnerIsA = setsA > setsB;
        const change = this.state.calculateElo(pA.rating, pB.rating, winnerIsA ? 1 : 0);
        document.getElementById('summaryContent').innerHTML = `
            <div class="summary-row">
                <div class="summary-player ${winnerIsA ? 'winner' : 'loser'}">
                    <span class="summary-name">${pA.name}</span><span class="summary-sets">${setsA} set</span>
                    <span class="summary-delta ${change >= 0 ? 'positive' : 'negative'}">${change >= 0 ? '+' : ''}${change} pts</span>
                    <span class="summary-new">${pA.rating + change}</span>
                </div>
                <div class="summary-vs">vs</div>
                <div class="summary-player ${!winnerIsA ? 'winner' : 'loser'}">
                    <span class="summary-name">${pB.name}</span><span class="summary-sets">${setsB} set</span>
                    <span class="summary-delta ${-change >= 0 ? 'positive' : 'negative'}">${-change >= 0 ? '+' : ''}${-change} pts</span>
                    <span class="summary-new">${pB.rating - change}</span>
                </div>
            </div>`;
        summary.style.display = 'block';
    }

    getSetScores() {
        const sets = [];
        document.querySelectorAll('#setsContainer .set-row').forEach(row => {
            sets.push({ scoreA: parseInt(row.querySelector('.score-a').value) || 0, scoreB: parseInt(row.querySelector('.score-b').value) || 0 });
        });
        return sets;
    }

    validateMatchForm() {
        const aId = document.getElementById('playerA').value;
        const bId = document.getElementById('playerB').value;
        const sets = this.getSetScores();
        const validSets = sets.filter(s => s.scoreA > 0 || s.scoreB > 0);
        const hasWinner = validSets.some(s => s.scoreA !== s.scoreB);
        document.getElementById('submitMatch').disabled = !(aId && bId && aId !== bId && validSets.length > 0 && hasWinner);
    }

    submitMatch() {
        const aId = parseInt(document.getElementById('playerA').value);
        const bId = parseInt(document.getElementById('playerB').value);
        const sets = this.getSetScores().filter(s => s.scoreA > 0 || s.scoreB > 0);
        const date = document.getElementById('matchDate').value;

        const funHandicaps = [];
        document.querySelectorAll('#funHandicapSelect .fun-check input:checked').forEach(cb => funHandicaps.push(cb.value));

        const match = this.state.recordMatch(aId, bId, sets, date, funHandicaps);
        if (!match) { this.showToast('Lỗi khi lưu kết quả!', 'error'); return; }

        const winner = match.winnerId === aId ? match.playerAName : match.playerBName;
        this.showToast(`Đã lưu! ${winner} thắng!`, 'success');

        document.getElementById('playerA').value = '';
        document.getElementById('playerB').value = '';
        document.getElementById('previewA').innerHTML = '';
        document.getElementById('previewB').innerHTML = '';
        document.getElementById('matchSummary').style.display = 'none';
        document.getElementById('matchHandicapBanner').style.display = 'none';
        document.getElementById('funHandicapSelect').style.display = 'none';
        const setsContainer = document.getElementById('setsContainer');
        setsContainer.innerHTML = '';
        this.currentSets = 0;
        for (let i = 0; i < this.minSets; i++) this.addSetRow();
        this.updateSetsUI();
        document.querySelectorAll('#funHandicapSelect .fun-check input').forEach(cb => cb.checked = false);
        document.getElementById('submitMatch').disabled = true;

        this.populateSelects();
        this.render();
    }

    render() {
        this.renderStats();
        this.renderTopPlayers();
        this.renderTable();
        this.renderHistory();
        this.renderLeaderboards();
    }

    renderStats() {
        document.getElementById('totalPlayers').textContent = this.state.players.length;
        document.getElementById('totalMatches').textContent = this.state.matches.length;
        document.getElementById('totalGroups').textContent = this.state.getGroups().length;
    }

    renderTopPlayers() {
        const top = this.state.getSortedPlayers().slice(0, 3);
        ['top1', 'top2', 'top3'].forEach((id, i) => {
            const el = document.getElementById(id);
            if (top[i]) {
                el.querySelector('.top-name').textContent = top[i].name;
                el.querySelector('.top-rating').textContent = top[i].rating + ' pts';
            }
        });
    }

    renderTable() {
        const search = document.getElementById('searchPlayer').value.toLowerCase();
        const group = document.getElementById('filterGroup').value;
        let players = this.state.getSortedPlayers();
        if (search) players = players.filter(p => p.name.toLowerCase().includes(search) || p.email.toLowerCase().includes(search));
        if (group !== 'all') players = players.filter(p => p.group === group);

        const { field, dir } = this.currentSort;
        players.sort((a, b) => {
            let va, vb;
            switch (field) {
                case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
                case 'group': va = a.group; vb = b.group; break;
                default: va = a.rating; vb = b.rating;
            }
            return va < vb ? (dir === 'asc' ? -1 : 1) : va > vb ? (dir === 'asc' ? 1 : -1) : 0;
        });

        const allSorted = this.state.getSortedPlayers();
        const userMap = {};
        this.auth.getUsers().forEach(u => { if (u.playerId) userMap[u.playerId] = u.displayName; });
        document.getElementById('rankingBody').innerHTML = players.map(p => {
            const rank = allSorted.findIndex(x => x.id === p.id) + 1;
            const form = this.getFormDots(p);
            const formLabel = this.getFormLabel(p);
            const delta = p.lastDelta || 0;
            const cls = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';
            const total = p.wins + p.losses;
            const wr = total > 0 ? Math.round(p.wins / total * 100) : 0;
            const linkedUser = userMap[p.id];
            return `<tr class="${rank <= 3 ? 'top-rank rank-' + rank : ''}">
                <td class="col-rank"><span class="rank-number">${rank}</span></td>
                <td class="col-name"><div class="player-info"><div class="player-avatar">${p.name.charAt(0)}</div><div><div class="player-name-text">${p.name}</div>${linkedUser ? `<div class="player-linked-user">(${linkedUser})</div>` : ''}</div></div></td>
                <td class="col-group"><span class="group-badge badge-${p.group.toLowerCase()}">${p.group}</span></td>
                <td class="col-email">${this._maskEmail(p.email)}</td>
                <td class="col-rating"><div class="rating-display"><span class="rating-value">${p.rating}</span><span class="rating-delta ${cls}">${delta > 0 ? '+' : ''}${delta}</span></div></td>
                <td class="col-form"><div class="form-display"><div class="form-dots">${form}</div><span class="form-label ${formLabel.cls}">${formLabel.text}</span></div></td>
                <td class="col-record"><div class="record-display"><span>${p.wins}W - ${p.losses}L</span>${total > 0 ? `<div class="win-rate-bar"><div class="win-rate-fill" style="width:${wr}%"></div></div>` : ''}</div></td>
                <td class="col-streak">${this.getStreakBadge(p)}</td>
            </tr>`;
        }).join('');
    }

    getFormDots(p) {
        if (!p.recentResults || !p.recentResults.length) return '<span class="no-data">-</span>';
        return p.recentResults.map(r => `<span class="form-dot ${r === 'W' ? 'dot-win' : 'dot-loss'}">${r}</span>`).join('');
    }

    getFormLabel(p) {
        if (!p.recentResults || !p.recentResults.length) return { text: 'Chưa có', cls: 'form-none' };
        const rate = p.recentResults.filter(r => r === 'W').length / p.recentResults.length;
        if (rate >= 0.8) return { text: '🔥 Xuất sắc', cls: 'form-excellent' };
        if (rate >= 0.6) return { text: '📈 Tốt', cls: 'form-good' };
        if (rate >= 0.4) return { text: '➡️ Ổn định', cls: 'form-ok' };
        if (rate >= 0.2) return { text: '📉 Kém', cls: 'form-bad' };
        return { text: '❄️ Rất kém', cls: 'form-terrible' };
    }

    getFormIndicator(p) {
        if (!p.recentResults || !p.recentResults.length) return '';
        const rate = p.recentResults.filter(r => r === 'W').length / p.recentResults.length;
        if (rate >= 0.6) return '<span class="form-indicator good">↑</span>';
        if (rate >= 0.4) return '<span class="form-indicator neutral">→</span>';
        return '<span class="form-indicator bad">↓</span>';
    }

    getStreakBadge(p) {
        if (!p.streak || p.streak < 2) return '-';
        return `<span class="streak-badge ${p.streakType === 'W' ? 'streak-win' : 'streak-loss'}">${p.streakType === 'W' ? '🔥' : '❄️'} ${p.streak}</span>`;
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        if (!this.state.matches.length) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Chưa có trận đấu nào được ghi nhận</p></div>';
            return;
        }
        container.innerHTML = this.state.matches.map(m => {
            const isAWin = m.winnerId === m.playerAId;
            const setsStr = m.sets.map(s => `${s.scoreA}-${s.scoreB}`).join(', ');
            const funTags = (m.funHandicaps || []).map(f => `<span class="history-fun-tag">${FUN_HANDICAP_LABELS[f] || f}</span>`).join('');
            return `<div class="history-card">
                <div class="history-date"><i class="fas fa-calendar"></i> ${this.formatDate(m.date)}</div>
                <div class="history-match">
                    <div class="history-player ${isAWin ? 'h-winner' : 'h-loser'}"><span class="h-name">${m.playerAName}</span><span class="h-sets">${m.setsWonA}</span></div>
                    <div class="history-score">${setsStr}</div>
                    <div class="history-player ${!isAWin ? 'h-winner' : 'h-loser'}"><span class="h-sets">${m.setsWonB}</span><span class="h-name">${m.playerBName}</span></div>
                </div>
                ${funTags ? `<div class="history-fun">${funTags}</div>` : ''}
                <div class="history-rating-changes">
                    <span class="${m.ratingChangeA >= 0 ? 'positive' : 'negative'}">${m.playerAName}: ${m.ratingChangeA >= 0 ? '+' : ''}${m.ratingChangeA}</span>
                    <span class="${m.ratingChangeB >= 0 ? 'positive' : 'negative'}">${m.playerBName}: ${m.ratingChangeB >= 0 ? '+' : ''}${m.ratingChangeB}</span>
                </div>
            </div>`;
        }).join('');
    }

    renderLeaderboards() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const yearStart = `${year}-01-01`;
        const monthNames = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

        const ml = document.getElementById('leaderMonthLabel');
        const yl = document.getElementById('leaderYearLabel');
        if (ml) ml.textContent = monthNames[month];
        if (yl) yl.textContent = String(year);

        this._renderLeaderboard('monthlyLeaderboard', this.state.getAccumulatedStats(monthStart));
        this._renderLeaderboard('yearlyLeaderboard', this.state.getAccumulatedStats(yearStart));
    }

    _renderLeaderboard(containerId, stats) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (!stats.length) {
            container.innerHTML = '<div class="lb-empty"><i class="fas fa-minus"></i> Chưa có dữ liệu</div>';
            return;
        }
        container.innerHTML = `<table class="lb-table">
            <thead><tr><th>#</th><th>Tay Vợt</th><th>Trận</th><th>W/L</th><th>Điểm tích lũy</th></tr></thead>
            <tbody>${stats.map((s, i) => {
                const cls = s.totalChange > 0 ? 'positive' : s.totalChange < 0 ? 'negative' : 'neutral';
                const medal = i === 0 ? '<i class="fas fa-trophy" style="color:#ffd700"></i> ' : i === 1 ? '<i class="fas fa-medal" style="color:#c0c0c0"></i> ' : i === 2 ? '<i class="fas fa-award" style="color:#cd7f32"></i> ' : '';
                return `<tr class="${i < 3 ? 'lb-top' : ''}">
                    <td class="lb-rank">${medal}${i + 1}</td>
                    <td class="lb-name">${s.name} <span class="lb-group">${s.group}</span></td>
                    <td class="lb-matches">${s.matches}</td>
                    <td class="lb-wl">${s.wins}W-${s.losses}L</td>
                    <td class="lb-pts ${cls}">${s.totalChange > 0 ? '+' : ''}${s.totalChange}</td>
                </tr>`;
            }).join('')}</tbody></table>`;
    }

    formatDate(d) {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    }
}

// ============================================================
// Initialize
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const state = new AppState();
    const auth = new Auth();
    const ui = new UI(state, auth);

    const viewerId = 'v_' + Math.random().toString(36).slice(2, 10);
    const heartbeatSync = new SyncManager();

    function updateViewerCount(count) {
        const el = document.getElementById('viewerNum');
        if (el) el.textContent = Math.max(1, count || 0);
    }

    function viewerParams() {
        const session = auth.getSession();
        const name = session ? session.displayName : 'Guest';
        return { vid: viewerId, vn: name };
    }

    function sendHeartbeat() {
        if (!heartbeatSync.enabled) return;
        const session = auth.getSession();
        const name = session ? session.displayName : 'Guest';
        heartbeatSync.save({ heartbeat: { id: viewerId, n: name } });
    }

    function refreshFromCloud() {
        if (!sync.enabled) return Promise.resolve();
        const indicator = document.getElementById('syncIndicator');
        if (indicator) indicator.classList.add('syncing');
        return sync.fetchAll(viewerParams()).then(data => {
            if (!data) return;
            state.loadFromCloud(data);
            auth.loadFromCloud(data.users);
            if (data.viewerCount !== undefined) updateViewerCount(data.viewerCount);
            ui.populateSelects();
            ui.render();
            if (auth.isAdmin()) {
                ui.renderAdminHistory();
                ui.renderAdminUsers();
                ui.renderAdminChallenges();
            }
        }).finally(() => {
            if (indicator) indicator.classList.remove('syncing');
        });
    }

    if (sync.enabled) {
        sync.fetchAll(viewerParams()).then(data => {
            if (data) {
                state.loadFromCloud(data);
                auth.loadFromCloud(data.users);
                state.restoreEmails();
                const cloudHasPlayers = data.players && data.players.length;
                if (!cloudHasPlayers && state.players.length > 0) {
                    sync.save({
                        players: state.players,
                        matches: state.matches,
                        users: auth.getUsers(),
                        chat: state.chat,
                        challenges: state.challenges,
                    });
                }
                if (data.viewerCount !== undefined) updateViewerCount(data.viewerCount);
                ui.populateSelects();
                ui.render();
                if (auth.isAdmin()) {
                    ui.renderAdminHistory();
                    ui.renderAdminUsers();
                    ui.renderAdminChallenges();
                }
            }
        });
        sendHeartbeat();
        setInterval(refreshFromCloud, 15000);
        setInterval(sendHeartbeat, 30000);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) { refreshFromCloud(); sendHeartbeat(); }
        });
    }

    const syncBtn = document.getElementById('btnSync');
    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            state._saveCooldown = false;
            refreshFromCloud();
        });
    }
});
