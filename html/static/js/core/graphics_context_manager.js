// GraphicsContextManager - Canvas context state management with leak detection
// Wraps canvas context save/restore to track and prevent state leaks

class GraphicsContextManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.saveCount = 0;
        this.maxSaveCount = 0;
        this.leakWarningThreshold = 10; // Warn if we get this many nested saves
    }

    // Save the current canvas state
    save() {
        this.ctx.save();
        this.saveCount++;
        
        if (this.saveCount > this.maxSaveCount) {
            this.maxSaveCount = this.saveCount;
        }

        // Warn about potential leaks
        if (this.saveCount >= this.leakWarningThreshold) {
            console.warn(`[GraphicsContextManager] Deep save stack: ${this.saveCount} levels - potential memory leak`);
        }
    }

    // Restore the previous canvas state
    restore() {
        if (this.saveCount <= 0) {
            console.error('[GraphicsContextManager] Unbalanced restore() - no matching save()');
            return false;
        }

        this.ctx.restore();
        this.saveCount--;
        return true;
    }

    // Check if save/restore are balanced
    isBalanced() {
        return this.saveCount === 0;
    }

    // Get current depth of save stack
    getSaveDepth() {
        return this.saveCount;
    }

    // Reset and warn if unbalanced
    reset() {
        if (this.saveCount !== 0) {
            console.warn(`[GraphicsContextManager] Forcing reset with ${this.saveCount} unbalanced save(s)`);
            
            // Restore all to get back to base state
            while (this.saveCount > 0) {
                this.ctx.restore();
                this.saveCount--;
            }
        }
    }

    // Get statistics about context usage
    getStats() {
        return {
            currentDepth: this.saveCount,
            maxDepth: this.maxSaveCount,
            balanced: this.isBalanced()
        };
    }
}
