// ============================================================
// Synopsys Ping Pong VN07 Club - Ranking System
// ============================================================

// ============================================================
// Google Sheets Sync Configuration
// ============================================================
// Paste your Google Apps Script Web App URL here after deployment:
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbw1cGWs7gJrljP-e2AbtnhW9DIhhU-SF13T28OEY5Ft0Njqfzo_A_alDc4yUuLP6US0/exec';

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

    async fetchAll() {
        if (!this.enabled) return null;
        try {
            const res = await fetch(this.apiUrl + '?t=' + Date.now(), { redirect: 'follow' });
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
    { id: 1,  name: "Nguyễn Thế Sự",        group: "Field", email: "thesu@synopsys.com",    rating: 800 },
    { id: 2,  name: "Do Nguyen Hoang Vu",    group: "Field", email: "hoangvu@synopsys.com",  rating: 820 },
    { id: 3,  name: "Pham Thieu Khang",      group: "PV",    email: "thiepham@synopsys.com", rating: 990 },
    { id: 4,  name: "Hoàng Quốc Khánh",      group: "PD",    email: "qhoang@synopsys.com",   rating: 700 },
    { id: 5,  name: "Nam Nguyen",             group: "Field", email: "namn@synopsys.com",     rating: 770 },
    { id: 6,  name: "Huynh Nguyen",           group: "SSG",   email: "vanhuynh@synopsys.com", rating: 760 },
    { id: 7,  name: "Huy Hoang",              group: "SSG",   email: "huyh@synopsys.com",     rating: 770 },
    { id: 8,  name: "Nghia Huynh",            group: "AE",    email: "lhuynh@synopsys.com",   rating: 600 },
    { id: 9,  name: "Hùng Nguyễn",            group: "AE",    email: "minguyen@synopsys.com", rating: 500 },
    { id: 10, name: "Tú Bùi",                 group: "AE",    email: "tubui@synopsys.com",    rating: 500 },
    { id: 11, name: "Khang Nguyễn",           group: "AE",    email: "phanvi@synopsys.com",   rating: 750 },
    { id: 12, name: "Phu-Qui Pham",           group: "AE",    email: "phuqui@synopsys.com",   rating: 400 },
    { id: 13, name: "Chồng Nhật Cường",       group: "IPG",   email: "nchong@synopsys.com",   rating: 790 },
    { id: 14, name: "Las Tran",               group: "AE",    email: "baonhung@synopsys.com", rating: 500 },
    { id: 15, name: "Harry Luong",            group: "SSG",   email: "hluong@synopsys.com",   rating: 700 },
    { id: 16, name: "Thuc Nguyen",            group: "CSG",   email: "thuc@synopsys.com",     rating: 650 },
    { id: 17, name: "Khanh Nguyen",           group: "SSG",   email: "thiki@synopsys.com",    rating: 400 },
    { id: 18, name: "Nguyen Ngoc Tien",       group: "CSG",   email: "ngoctien@synopsys.com", rating: 650 },
    { id: 19, name: "Le Ngoc Thao",           group: "CSG",   email: "thaol@synopsys.com",    rating: 750 },
    { id: 20, name: "Tyluke",                 group: "IPG",   email: "dinhty@synopsys.com",   rating: 760 },
    { id: 21, name: "Kyrene Gay Paglumotan",  group: "TPG",   email: "paglu@synopsys.com",    rating: 650 },
    { id: 22, name: "Võ Quang Thanh Nghĩa",   group: "Field", email: "qvo@synopsys.com",      rating: 600 },
    { id: 23, name: "Vo Ngoc Hieu",           group: "SSG",   email: "ngochieu@synopsys.com", rating: 500 },
    { id: 24, name: "Ngo Tran Viet Khai",     group: "SSG",   email: "trngo@synopsys.com",    rating: 500 },
    { id: 25, name: "Thinh Ta",               group: "Field", email: "qta@synopsys.com",      rating: 790 },
    { id: 26, name: "Nguyễn Kim Anh",         group: "Field", email: "nguyenj@synopsys.com",  rating: 600 },
    { id: 27, name: "Trần Thanh Liêm",        group: "SSG",   email: "thanhl@synopsys.com",   rating: 500 },
    { id: 28, name: "Châu Pham",              group: "CSG",   email: "chaupham@synopsys.com", rating: 400 },
    { id: 29, name: "Tân Nguyễn",             group: "CSG",   email: "hoangtan@synopsys.com", rating: 500 },
    { id: 30, name: "Hanh Pham",              group: "CSG",   email: "hieuhanh@synopsys.com", rating: 400 },
    { id: 31, name: "Cuong Truong",           group: "CSG",   email: "ctruong@synopsys.com",  rating: 500 },
    { id: 32, name: "Qui Nguyen",             group: "CSG",   email: "thanhqui@synopsys.com", rating: 600 },
    { id: 33, name: "Dương Chí Tông",         group: "SSG",   email: "chitong@synopsys.com",  rating: 700 },
    { id: 34, name: "Jane Nguyen",            group: "Field", email: "chitong@synopsys.com",  rating: 700 },
    { id: 35, name: "Huy Nguyen",             group: "TPG",   email: "duchuyn@synopsys.com",  rating: 500 },
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
// Auth System
// ============================================================
class Auth {
    constructor() {
        this._users = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'users') || '[]');
        this._ensureAdmin();
    }

    loadFromCloud(users) {
        if (Array.isArray(users) && users.length) {
            this._users = users;
            localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(this._users));
            this._ensureAdmin();
        }
    }

    _ensureAdmin() {
        if (!this._users.find(u => u.username === 'admin')) {
            this._users.push({ username: 'admin', password: 'Pass1234', displayName: 'Admin', role: 'admin' });
            this._saveUsers();
        }
    }

    _saveUsers() {
        localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(this._users));
        sync.save({ users: this._users });
    }

    getUsers() { return this._users; }

    login(username, password) {
        const user = this._users.find(u => u.username === username && u.password === password);
        if (!user) return null;
        sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
        return user;
    }

    loginGuest() {
        const guest = { username: '__guest__', displayName: 'Guest', role: 'guest' };
        sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(guest));
        return guest;
    }

    register(username, password, displayName) {
        if (this._users.find(u => u.username === username)) return { error: 'Tên đăng nhập đã tồn tại!' };
        const user = { username, password, displayName, role: 'user', registeredAt: new Date().toISOString() };
        this._users.push(user);
        this._saveUsers();
        sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(user));
        return user;
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
    }

    loadFromCloud(data) {
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
        return p;
    }

    _normalizePlayers(players) {
        return players.map(p => this._normalizePlayer(p));
    }

    getPlayer(id) { return this.players.find(p => p.id === id); }

    getSortedPlayers() { return [...this.players].sort((a, b) => b.rating - a.rating); }

    getGroups() { return [...new Set(this.players.map(p => p.group))].sort(); }

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

        document.getElementById('loginForm').addEventListener('submit', e => {
            e.preventDefault();
            const user = this.auth.login(
                document.getElementById('loginUser').value.trim(),
                document.getElementById('loginPass').value
            );
            if (user) this.enterApp(user);
            else document.getElementById('loginError').textContent = 'Sai tên đăng nhập hoặc mật khẩu!';
        });

        document.getElementById('registerForm').addEventListener('submit', e => {
            e.preventDefault();
            const pass = document.getElementById('regPass').value;
            const confirm = document.getElementById('regPassConfirm').value;
            if (pass !== confirm) { document.getElementById('regError').textContent = 'Mật khẩu xác nhận không khớp!'; return; }
            const result = this.auth.register(
                document.getElementById('regUser').value.trim(),
                pass,
                document.getElementById('regDisplayName').value.trim()
            );
            if (result.error) document.getElementById('regError').textContent = result.error;
            else this.enterApp(result);
        });

        const session = this.auth.getSession();
        if (session) this.enterApp(session);
    }

    enterApp(user) {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('appMain').style.display = 'block';
        document.getElementById('userName').textContent = user.displayName;

        const isAdmin = user.role === 'admin';
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
        if (isAdmin) document.getElementById('adminTag').style.display = '';

        document.getElementById('btnLogout').addEventListener('click', () => {
            this.auth.logout();
            location.reload();
        });

        this.initApp();
    }

    initApp() {
        this.bindTabs();
        this.bindFilters();
        this.bindMatchForm();
        this.bindHistory();
        this.bindHandicapCalc();
        this.bindAdmin();
        this.bindAnnounce();
        this.populateSelects();
        this.render();
        document.getElementById('matchDate').valueAsDate = new Date();
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
    }

    renderAdminUsers() {
        const container = document.getElementById('adminUsersList');
        if (!container) return;
        const users = this.auth.getUsers();
        if (!users.length) {
            container.innerHTML = '<p class="admin-note">Chưa có tài khoản nào.</p>';
            return;
        }
        const roleLabels = { admin: 'Admin', user: 'User' };
        container.innerHTML = `
            <table class="admin-users-table">
                <thead><tr><th>Username</th><th>Tên hiển thị</th><th>Vai trò</th><th>Ngày ĐK</th><th></th></tr></thead>
                <tbody>${users.map(u => `
                    <tr>
                        <td><code>${u.username}</code></td>
                        <td>${u.displayName || '-'}</td>
                        <td><span class="role-badge role-${u.role}">${roleLabels[u.role] || u.role}</span></td>
                        <td class="date-col">${u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('vi-VN') : '-'}</td>
                        <td>${u.username !== 'admin' ? `<button class="btn-delete-user" data-username="${u.username}" title="Xóa tài khoản"><i class="fas fa-trash"></i></button>` : ''}</td>
                    </tr>`).join('')}
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
        document.getElementById('rankingBody').innerHTML = players.map(p => {
            const rank = allSorted.findIndex(x => x.id === p.id) + 1;
            const form = this.getFormDots(p);
            const formLabel = this.getFormLabel(p);
            const delta = p.lastDelta || 0;
            const cls = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';
            const total = p.wins + p.losses;
            const wr = total > 0 ? Math.round(p.wins / total * 100) : 0;
            return `<tr class="${rank <= 3 ? 'top-rank rank-' + rank : ''}">
                <td class="col-rank"><span class="rank-number">${rank}</span></td>
                <td class="col-name"><div class="player-info"><div class="player-avatar">${p.name.charAt(0)}</div><div><div class="player-name-text">${p.name}</div></div></div></td>
                <td class="col-group"><span class="group-badge badge-${p.group.toLowerCase()}">${p.group}</span></td>
                <td class="col-email">${p.email}</td>
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

    function refreshFromCloud() {
        if (!sync.enabled || state._saveCooldown) return Promise.resolve();
        const indicator = document.getElementById('syncIndicator');
        if (indicator) indicator.classList.add('syncing');
        return sync.fetchAll().then(data => {
            if (!data) return;
            state.loadFromCloud(data);
            auth.loadFromCloud(data.users);
            ui.populateSelects();
            ui.render();
            if (auth.isAdmin()) {
                ui.renderAdminHistory();
                ui.renderAdminUsers();
            }
        }).finally(() => {
            if (indicator) indicator.classList.remove('syncing');
        });
    }

    if (sync.enabled) {
        sync.fetchAll().then(data => {
            if (data) {
                const cloudHasData = data.players && data.players.length;
                const localHasData = state.players.length > 0;
                if (cloudHasData) {
                    state.loadFromCloud(data);
                    auth.loadFromCloud(data.users);
                } else if (localHasData) {
                    sync.save({
                        players: state.players,
                        matches: state.matches,
                        users: auth.getUsers(),
                    });
                }
                ui.populateSelects();
                ui.render();
                if (auth.isAdmin()) {
                    ui.renderAdminHistory();
                    ui.renderAdminUsers();
                }
            }
        });
        setInterval(refreshFromCloud, 30000);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) refreshFromCloud();
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
