class ScoreEventBus extends events {
    constructor(run_metadata = {}) {
        super();
        this.run_metadata = run_metadata;
    }

    set_run_metadata(meta) {
        this.run_metadata = meta || {};
    }

    emit_score(event) {
        const payload = Object.assign({ ts: Date.now() }, this.run_metadata || {}, event || {});
        this.emit('score', payload);
    }
}
