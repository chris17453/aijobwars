// RenderPipeline - Unified rendering pipeline for consistent frame rendering
// Handles all steps from background to modal rendering with proper state management

class RenderPipeline {
    constructor(graphics, contextManager, coordinateTransformer) {
        this.graphics = graphics;
        this.contextManager = contextManager;
        this.coordinateTransformer = coordinateTransformer;
        this.debugRendering = false;
    }

    // Main render method - orchestrates the entire rendering pipeline
    render(modals, activeModal) {
        const ctx = this.graphics.ctx;
        const viewport = this.graphics.viewport;

        // Step 1: Save initial state
        this.contextManager.save();

        try {
            // Step 2: Clear canvas with base color
            ctx.fillStyle = '#0a1628';
            ctx.fillRect(0, 0, viewport.given.width, viewport.given.height);

            // Step 3: Apply viewport transformation (scale and center)
            this.coordinateTransformer.applyCanvasTransform(ctx);

            // Step 4: Render background from active modal
            if (activeModal && activeModal.background) {
                this.renderBackground(activeModal);
            }

            // Step 5: Render gradient overlay from active modal
            if (activeModal && activeModal.bg_gradient) {
                this.renderGradient(activeModal);
            }

            // Step 6: Render all active modals
            this.renderModals(modals);

        } finally {
            // Step 7: Always restore canvas state
            this.contextManager.restore();

            // Verify context balance
            if (!this.contextManager.isBalanced()) {
                console.error('[RenderPipeline] Context state leak detected!', 
                    this.contextManager.getStats());
            }
        }

        // Step 8: Fill letterbox/pillarbox areas (done after restore, in physical coordinates)
        this.fillLetterbox();
    }

    // Render background image
    renderBackground(modal) {
        const viewport = this.graphics.viewport;
        const bgRect = new rect(0, 0, viewport.virtual.width, viewport.virtual.height);
        
        // Use "cover" mode to fill entire viewport (crop edges if needed)
        this.graphics.sprites.render(modal.background, null, bgRect, 1, "cover");

        if (this.debugRendering) {
            console.log('[RenderPipeline] Rendered background:', modal.background);
        }
    }

    // Render gradient overlay
    renderGradient(modal) {
        const ctx = this.graphics.ctx;
        const viewport = this.graphics.viewport;

        const gradient = ctx.createLinearGradient(0, 0, 0, viewport.virtual.height);
        
        for (let i = 0; i < modal.bg_gradient.length; i++) {
            gradient.addColorStop(modal.bg_gradient[i][0], modal.bg_gradient[i][1]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, viewport.virtual.width, viewport.virtual.height);

        if (this.debugRendering) {
            console.log('[RenderPipeline] Rendered gradient');
        }
    }

    // Render all active modals
    renderModals(modals) {
        let renderedCount = 0;

        modals.forEach((modal, index) => {
            if (modal.active) {
                // Each modal is responsible for its own save/restore
                modal.render();
                renderedCount++;
            }
        });

        if (this.debugRendering) {
            console.log(`[RenderPipeline] Rendered ${renderedCount}/${modals.length} modals`);
        }
    }

    // Fill letterbox/pillarbox areas with edge pixels
    fillLetterbox() {
        const ctx = this.graphics.ctx;
        const viewport = this.graphics.viewport;

        // Check if there's any letterbox space to fill
        const hasHorizontalPadding = viewport.offset.x > 0;
        const hasVerticalPadding = viewport.offset.y > 0;

        if (!hasHorizontalPadding && !hasVerticalPadding) {
            return; // No padding to fill
        }

        // Round to exact pixel boundaries
        const rendered_x = Math.round(viewport.offset.x);
        const rendered_y = Math.round(viewport.offset.y);
        const rendered_width = Math.round(viewport.rendered.width);
        const rendered_height = Math.round(viewport.rendered.height);

        // Fill left pillarbox
        if (hasHorizontalPadding && rendered_x > 0) {
            const edgeData = ctx.getImageData(rendered_x + 1, rendered_y, 1, rendered_height);
            for (let x = 0; x < rendered_x; x++) {
                ctx.putImageData(edgeData, x, rendered_y);
            }
        }

        // Fill right pillarbox
        if (hasHorizontalPadding) {
            const right_edge_x = rendered_x + rendered_width - 1;
            const right_padding_start = rendered_x + rendered_width;
            const right_padding_width = viewport.given.width - right_padding_start;

            if (right_padding_width > 0) {
                const edgeData = ctx.getImageData(right_edge_x, rendered_y, 1, rendered_height);
                for (let x = right_padding_start; x < viewport.given.width; x++) {
                    ctx.putImageData(edgeData, x, rendered_y);
                }
            }
        }

        // Fill top letterbox
        if (hasVerticalPadding && rendered_y > 0) {
            const edgeData = ctx.getImageData(0, rendered_y, viewport.given.width, 1);
            for (let y = 0; y < rendered_y; y++) {
                ctx.putImageData(edgeData, 0, y);
            }
        }

        // Fill bottom letterbox
        if (hasVerticalPadding) {
            const bottom_edge_y = rendered_y + rendered_height - 1;
            const bottom_padding_start = rendered_y + rendered_height;
            const bottom_padding_height = viewport.given.height - bottom_padding_start;

            if (bottom_padding_height > 0) {
                const edgeData = ctx.getImageData(0, bottom_edge_y, viewport.given.width, 1);
                for (let y = bottom_padding_start; y < viewport.given.height; y++) {
                    ctx.putImageData(edgeData, 0, y);
                }
            }
        }

        if (this.debugRendering) {
            console.log('[RenderPipeline] Filled letterbox areas');
        }
    }

    // Enable/disable debug logging
    setDebugMode(enabled) {
        this.debugRendering = enabled;
    }

    // Get rendering statistics
    getStats() {
        return {
            contextStats: this.contextManager.getStats(),
            viewport: this.graphics.viewport
        };
    }
}
