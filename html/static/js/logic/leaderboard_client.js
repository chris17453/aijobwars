class LeaderboardClient {
    constructor(namespace = 'global') {
        this.namespace = namespace;
    }

    _key() {
        return `aijobwars_leaderboard_${this.namespace}`;
    }

    submit(scorePayload) {
        try {
            const raw = localStorage.getItem(this._key());
            const scores = raw ? JSON.parse(raw) : [];
            scores.push(scorePayload);
            scores.sort((a, b) => b.score - a.score);
            localStorage.setItem(this._key(), JSON.stringify(scores.slice(0, 50)));
        } catch (e) {
            console.warn('[LeaderboardClient] Failed to submit score', e);
        }
    }

    fetch() {
        try {
            const raw = localStorage.getItem(this._key());
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('[LeaderboardClient] Failed to fetch scores', e);
            return [];
        }
    }
}
