// ============================================================
// Synopsys Badminton Club - Ranking System
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

const K_FACTOR = 32;
const FORM_WINDOW = 5;

// ============================================================
// State Management
// ============================================================
class AppState {
    constructor() {
        this.players = this.loadPlayers();
        this.matches = this.loadMatches();
    }

    loadPlayers() {
        const saved = localStorage.getItem('snps_badminton_players');
        if (saved) return JSON.parse(saved);
        return INITIAL_PLAYERS.map(p => ({
            ...p,
            wins: 0,
            losses: 0,
            recentResults: [],
            streak: 0,
            streakType: null,
            initialRating: p.rating,
        }));
    }

    loadMatches() {
        const saved = localStorage.getItem('snps_badminton_matches');
        return saved ? JSON.parse(saved) : [];
    }

    savePlayers() {
        localStorage.setItem('snps_badminton_players', JSON.stringify(this.players));
    }

    saveMatches() {
        localStorage.setItem('snps_badminton_matches', JSON.stringify(this.matches));
    }

    getPlayer(id) {
        return this.players.find(p => p.id === id);
    }

    getSortedPlayers() {
        return [...this.players].sort((a, b) => b.rating - a.rating);
    }

    getGroups() {
        return [...new Set(this.players.map(p => p.group))].sort();
    }

    calculateElo(ratingA, ratingB, scoreA) {
        const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
        const changeA = Math.round(K_FACTOR * (scoreA - expectedA));
        return changeA;
    }

    recordMatch(playerAId, playerBId, sets, date) {
        const playerA = this.getPlayer(playerAId);
        const playerB = this.getPlayer(playerBId);
        if (!playerA || !playerB) return null;

        let setsWonA = 0, setsWonB = 0;
        sets.forEach(s => {
            if (s.scoreA > s.scoreB) setsWonA++;
            else if (s.scoreB > s.scoreA) setsWonB++;
        });

        const winnerIsA = setsWonA > setsWonB;
        const scoreA = winnerIsA ? 1 : 0;
        const ratingChange = this.calculateElo(playerA.rating, playerB.rating, scoreA);

        const match = {
            id: Date.now(),
            date: date,
            playerAId, playerBId,
            playerAName: playerA.name,
            playerBName: playerB.name,
            sets: sets,
            setsWonA, setsWonB,
            winnerId: winnerIsA ? playerAId : playerBId,
            ratingChangeA: ratingChange,
            ratingChangeB: -ratingChange,
            ratingBeforeA: playerA.rating,
            ratingBeforeB: playerB.rating,
        };

        playerA.rating += ratingChange;
        playerB.rating -= ratingChange;
        playerA.rating = Math.max(100, playerA.rating);
        playerB.rating = Math.max(100, playerB.rating);

        if (winnerIsA) {
            playerA.wins++;
            playerB.losses++;
            playerA.recentResults.push('W');
            playerB.recentResults.push('L');
        } else {
            playerB.wins++;
            playerA.losses++;
            playerA.recentResults.push('L');
            playerB.recentResults.push('W');
        }

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
        if (player.recentResults.length === 0) {
            player.streak = 0;
            player.streakType = null;
            return;
        }
        const last = player.recentResults[player.recentResults.length - 1];
        let count = 0;
        for (let i = player.recentResults.length - 1; i >= 0; i--) {
            if (player.recentResults[i] === last) count++;
            else break;
        }
        player.streak = count;
        player.streakType = last;
    }

    resetData() {
        localStorage.removeItem('snps_badminton_players');
        localStorage.removeItem('snps_badminton_matches');
        this.players = this.loadPlayers();
        this.matches = this.loadMatches();
    }
}

// ============================================================
// UI Controller
// ============================================================
class UI {
    constructor(state) {
        this.state = state;
        this.currentSort = { field: 'rating', dir: 'desc' };
        this.init();
    }

    init() {
        this.bindTabs();
        this.bindFilters();
        this.bindMatchForm();
        this.bindHistory();
        this.bindHandicapCalc();
        this.populateSelects();
        this.render();
        document.getElementById('matchDate').valueAsDate = new Date();
    }

    // --- Tabs ---
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

    // --- Filters & Sort ---
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
                if (this.currentSort.field === field) {
                    this.currentSort.dir = this.currentSort.dir === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort = { field, dir: field === 'name' ? 'asc' : 'desc' };
                }
                this.renderTable();
            });
        });
    }

    // --- Match Form ---
    bindMatchForm() {
        const playerA = document.getElementById('playerA');
        const playerB = document.getElementById('playerB');
        const submitBtn = document.getElementById('submitMatch');

        const updatePreview = () => {
            this.updatePlayerPreview('previewA', playerA.value);
            this.updatePlayerPreview('previewB', playerB.value);
            this.updateMatchSummary();
            this.validateMatchForm();
        };

        playerA.addEventListener('change', updatePreview);
        playerB.addEventListener('change', updatePreview);

        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('input', () => {
                this.updateMatchSummary();
                this.validateMatchForm();
            });
        });

        submitBtn.addEventListener('click', () => this.submitMatch());
    }

    bindHistory() {
        document.getElementById('clearHistory').addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử và đặt lại điểm?')) {
                this.state.resetData();
                this.render();
                this.showToast('Đã đặt lại dữ liệu', 'info');
            }
        });
    }

    bindHandicapCalc() {
        const hA = document.getElementById('handicapPlayerA');
        const hB = document.getElementById('handicapPlayerB');
        const update = () => this.updateHandicapResult();
        hA.addEventListener('change', update);
        hB.addEventListener('change', update);
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

        if (!aId || !bId || aId === bId) { result.style.display = 'none'; return; }

        const pA = this.state.getPlayer(aId);
        const pB = this.state.getPlayer(bId);
        const diff = Math.abs(pA.rating - pB.rating);
        const stronger = pA.rating >= pB.rating ? pA : pB;
        const weaker = pA.rating >= pB.rating ? pB : pA;
        const h = this.getHandicap(diff);

        const funSuggestions = [];
        if (diff >= 200) funSuggestions.push('🤚 Thử kèo Tay Trái!');
        if (diff >= 150) funSuggestions.push('🎯 Thử kèo Nửa Bàn!');
        if (diff >= 300) funSuggestions.push('👥 Thử kèo 1 vs 2!');
        if (diff >= 100) funSuggestions.push('💪 Thử kèo Plank cho vui!');

        result.innerHTML = `
            <div class="handicap-result-card">
                <div class="hrc-players">
                    <div class="hrc-player hrc-stronger">
                        <div class="hrc-label">Người chấp</div>
                        <div class="hrc-name">${stronger.name}</div>
                        <div class="hrc-rating">${stronger.rating} pts</div>
                    </div>
                    <div class="hrc-arrow">
                        <i class="fas fa-arrow-right"></i>
                        <div class="hrc-diff">Chênh ${diff} điểm</div>
                    </div>
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
                    <div class="hrc-note">${stronger.name} bắt đầu mỗi set với 0 điểm, ${weaker.name} được ${h.sets.join('-')} điểm trước.</div>
                </div>
                ${funSuggestions.length > 0 ? `
                <div class="hrc-fun">
                    <div class="hrc-fun-label">Gợi ý kèo vui:</div>
                    ${funSuggestions.map(s => `<span class="hrc-fun-tag">${s}</span>`).join('')}
                </div>` : ''}
            </div>
        `;
        result.style.display = 'block';
    }

    populateSelects() {
        const sorted = this.state.getSortedPlayers();
        ['playerA', 'playerB', 'handicapPlayerA', 'handicapPlayerB'].forEach(selId => {
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
        container.innerHTML = `
            <div class="preview-card">
                <div class="preview-name">${p.name}</div>
                <div class="preview-details">
                    <span class="preview-rating">${p.rating} pts</span>
                    <span class="preview-group badge-${p.group.toLowerCase()}">${p.group}</span>
                </div>
                <div class="preview-record">${p.wins}W - ${p.losses}L ${form}</div>
            </div>
        `;
    }

    updateMatchSummary() {
        const aId = parseInt(document.getElementById('playerA').value);
        const bId = parseInt(document.getElementById('playerB').value);
        const summary = document.getElementById('matchSummary');

        if (!aId || !bId || aId === bId) { summary.style.display = 'none'; return; }

        const sets = this.getSetScores();
        const validSets = sets.filter(s => s.scoreA > 0 || s.scoreB > 0);
        if (validSets.length === 0) { summary.style.display = 'none'; return; }

        const pA = this.state.getPlayer(aId);
        const pB = this.state.getPlayer(bId);
        let setsA = 0, setsB = 0;
        validSets.forEach(s => {
            if (s.scoreA > s.scoreB) setsA++;
            else if (s.scoreB > s.scoreA) setsB++;
        });

        const winnerIsA = setsA > setsB;
        const change = this.state.calculateElo(pA.rating, pB.rating, winnerIsA ? 1 : 0);

        const content = document.getElementById('summaryContent');
        content.innerHTML = `
            <div class="summary-row">
                <div class="summary-player ${winnerIsA ? 'winner' : 'loser'}">
                    <span class="summary-name">${pA.name}</span>
                    <span class="summary-sets">${setsA} set</span>
                    <span class="summary-delta ${change >= 0 ? 'positive' : 'negative'}">
                        ${change >= 0 ? '+' : ''}${change} pts
                    </span>
                    <span class="summary-new">${pA.rating + change}</span>
                </div>
                <div class="summary-vs">vs</div>
                <div class="summary-player ${!winnerIsA ? 'winner' : 'loser'}">
                    <span class="summary-name">${pB.name}</span>
                    <span class="summary-sets">${setsB} set</span>
                    <span class="summary-delta ${-change >= 0 ? 'positive' : 'negative'}">
                        ${-change >= 0 ? '+' : ''}${-change} pts
                    </span>
                    <span class="summary-new">${pB.rating - change}</span>
                </div>
            </div>
        `;
        summary.style.display = 'block';
    }

    getSetScores() {
        const sets = [];
        document.querySelectorAll('.set-row').forEach(row => {
            sets.push({
                scoreA: parseInt(row.querySelector('.score-a').value) || 0,
                scoreB: parseInt(row.querySelector('.score-b').value) || 0,
            });
        });
        return sets;
    }

    validateMatchForm() {
        const aId = document.getElementById('playerA').value;
        const bId = document.getElementById('playerB').value;
        const sets = this.getSetScores();
        const validSets = sets.filter(s => s.scoreA > 0 || s.scoreB > 0);
        const hasWinner = validSets.some(s => s.scoreA !== s.scoreB);

        const valid = aId && bId && aId !== bId && validSets.length > 0 && hasWinner;
        document.getElementById('submitMatch').disabled = !valid;
    }

    submitMatch() {
        const aId = parseInt(document.getElementById('playerA').value);
        const bId = parseInt(document.getElementById('playerB').value);
        const sets = this.getSetScores().filter(s => s.scoreA > 0 || s.scoreB > 0);
        const date = document.getElementById('matchDate').value;

        const match = this.state.recordMatch(aId, bId, sets, date);
        if (!match) { this.showToast('Lỗi khi lưu kết quả!', 'error'); return; }

        const winner = match.winnerId === aId ? match.playerAName : match.playerBName;
        this.showToast(`Đã lưu! ${winner} thắng!`, 'success');

        document.getElementById('playerA').value = '';
        document.getElementById('playerB').value = '';
        document.getElementById('previewA').innerHTML = '';
        document.getElementById('previewB').innerHTML = '';
        document.getElementById('matchSummary').style.display = 'none';
        document.querySelectorAll('.score-input').forEach(i => i.value = '');
        document.getElementById('submitMatch').disabled = true;

        this.populateSelects();
        this.render();
    }

    // --- Rendering ---
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
        const elements = [
            document.getElementById('top1'),
            document.getElementById('top2'),
            document.getElementById('top3'),
        ];
        top.forEach((p, i) => {
            if (!elements[i]) return;
            elements[i].querySelector('.top-name').textContent = p.name;
            elements[i].querySelector('.top-rating').textContent = p.rating + ' pts';
        });
    }

    renderTable() {
        const search = document.getElementById('searchPlayer').value.toLowerCase();
        const group = document.getElementById('filterGroup').value;

        let players = this.state.getSortedPlayers();

        if (search) {
            players = players.filter(p =>
                p.name.toLowerCase().includes(search) ||
                p.email.toLowerCase().includes(search)
            );
        }
        if (group !== 'all') {
            players = players.filter(p => p.group === group);
        }

        const { field, dir } = this.currentSort;
        players.sort((a, b) => {
            let va, vb;
            switch (field) {
                case 'name':  va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
                case 'group': va = a.group; vb = b.group; break;
                case 'rating': va = a.rating; vb = b.rating; break;
                default: va = a.rating; vb = b.rating;
            }
            if (va < vb) return dir === 'asc' ? -1 : 1;
            if (va > vb) return dir === 'asc' ? 1 : -1;
            return 0;
        });

        const allSorted = this.state.getSortedPlayers();

        const tbody = document.getElementById('rankingBody');
        tbody.innerHTML = players.map(p => {
            const globalRank = allSorted.findIndex(x => x.id === p.id) + 1;
            const form = this.getFormDots(p);
            const formLabel = this.getFormLabel(p);
            const ratingDelta = p.rating - p.initialRating;
            const deltaClass = ratingDelta > 0 ? 'positive' : ratingDelta < 0 ? 'negative' : 'neutral';
            const deltaStr = ratingDelta > 0 ? `+${ratingDelta}` : `${ratingDelta}`;
            const streakStr = this.getStreakBadge(p);
            const total = p.wins + p.losses;
            const winRate = total > 0 ? Math.round(p.wins / total * 100) : 0;

            return `
                <tr class="${globalRank <= 3 ? 'top-rank rank-' + globalRank : ''}">
                    <td class="col-rank">
                        <span class="rank-number">${globalRank}</span>
                    </td>
                    <td class="col-name">
                        <div class="player-info">
                            <div class="player-avatar">${p.name.charAt(0)}</div>
                            <div>
                                <div class="player-name-text">${p.name}</div>
                            </div>
                        </div>
                    </td>
                    <td class="col-group">
                        <span class="group-badge badge-${p.group.toLowerCase()}">${p.group}</span>
                    </td>
                    <td class="col-email">${p.email}</td>
                    <td class="col-rating">
                        <div class="rating-display">
                            <span class="rating-value">${p.rating}</span>
                            <span class="rating-delta ${deltaClass}">${deltaStr}</span>
                        </div>
                    </td>
                    <td class="col-form">
                        <div class="form-display">
                            <div class="form-dots">${form}</div>
                            <span class="form-label ${formLabel.cls}">${formLabel.text}</span>
                        </div>
                    </td>
                    <td class="col-record">
                        <div class="record-display">
                            <span>${p.wins}W - ${p.losses}L</span>
                            ${total > 0 ? `<div class="win-rate-bar"><div class="win-rate-fill" style="width:${winRate}%"></div></div>` : ''}
                        </div>
                    </td>
                    <td class="col-streak">${streakStr}</td>
                </tr>
            `;
        }).join('');
    }

    getFormDots(player) {
        if (!player.recentResults || player.recentResults.length === 0) {
            return '<span class="no-data">-</span>';
        }
        return player.recentResults.map(r =>
            `<span class="form-dot ${r === 'W' ? 'dot-win' : 'dot-loss'}">${r}</span>`
        ).join('');
    }

    getFormLabel(player) {
        if (!player.recentResults || player.recentResults.length === 0) {
            return { text: 'Chưa có', cls: 'form-none' };
        }
        const wins = player.recentResults.filter(r => r === 'W').length;
        const total = player.recentResults.length;
        const rate = wins / total;

        if (rate >= 0.8) return { text: '🔥 Xuất sắc', cls: 'form-excellent' };
        if (rate >= 0.6) return { text: '📈 Tốt', cls: 'form-good' };
        if (rate >= 0.4) return { text: '➡️ Ổn định', cls: 'form-ok' };
        if (rate >= 0.2) return { text: '📉 Kém', cls: 'form-bad' };
        return { text: '❄️ Rất kém', cls: 'form-terrible' };
    }

    getFormIndicator(player) {
        if (!player.recentResults || player.recentResults.length === 0) return '';
        const wins = player.recentResults.filter(r => r === 'W').length;
        const total = player.recentResults.length;
        const rate = wins / total;
        if (rate >= 0.6) return '<span class="form-indicator good">↑</span>';
        if (rate >= 0.4) return '<span class="form-indicator neutral">→</span>';
        return '<span class="form-indicator bad">↓</span>';
    }

    getStreakBadge(player) {
        if (!player.streak || player.streak < 2) return '-';
        const type = player.streakType === 'W' ? 'streak-win' : 'streak-loss';
        const icon = player.streakType === 'W' ? '🔥' : '❄️';
        return `<span class="streak-badge ${type}">${icon} ${player.streak}</span>`;
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        if (this.state.matches.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Chưa có trận đấu nào được ghi nhận</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.matches.map(m => {
            const isAWinner = m.winnerId === m.playerAId;
            const setsStr = m.sets.map(s => `${s.scoreA}-${s.scoreB}`).join(', ');
            return `
                <div class="history-card">
                    <div class="history-date">
                        <i class="fas fa-calendar"></i> ${this.formatDate(m.date)}
                    </div>
                    <div class="history-match">
                        <div class="history-player ${isAWinner ? 'h-winner' : 'h-loser'}">
                            <span class="h-name">${m.playerAName}</span>
                            <span class="h-sets">${m.setsWonA}</span>
                        </div>
                        <div class="history-score">${setsStr}</div>
                        <div class="history-player ${!isAWinner ? 'h-winner' : 'h-loser'}">
                            <span class="h-sets">${m.setsWonB}</span>
                            <span class="h-name">${m.playerBName}</span>
                        </div>
                    </div>
                    <div class="history-rating-changes">
                        <span class="${m.ratingChangeA >= 0 ? 'positive' : 'negative'}">
                            ${m.playerAName}: ${m.ratingChangeA >= 0 ? '+' : ''}${m.ratingChangeA}
                        </span>
                        <span class="${m.ratingChangeB >= 0 ? 'positive' : 'negative'}">
                            ${m.playerBName}: ${m.ratingChangeB >= 0 ? '+' : ''}${m.ratingChangeB}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
        toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ============================================================
// Initialize
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const state = new AppState();
    new UI(state);
});
