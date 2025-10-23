// Base class for all UI components with standardized layout system
class ui_component extends events {
    constructor(parent, graphics, layout_config = {}, logger) {
        super();
        this.logger = logger || console;
        this.parent = parent;
        this.graphics = graphics;
        this.ctx = graphics.ctx;
        this.active = true;

        // Layout configuration with sensible defaults
        this.layout = {
            // Positioning mode: "absolute", "relative", "anchored"
            mode: layout_config.mode || "relative",

            // Anchoring: which edges to anchor to parent
            // Can be: "top", "bottom", "left", "right", "center", or combinations like "top-left"
            anchor: {
                x: layout_config.anchor_x || "left",  // "left", "right", "center"
                y: layout_config.anchor_y || "top"     // "top", "bottom", "center"
            },

            // Margins: space outside the component (from parent edges)
            margin: {
                top: layout_config.margin_top || 0,
                right: layout_config.margin_right || 0,
                bottom: layout_config.margin_bottom || 0,
                left: layout_config.margin_left || 0
            },

            // Padding: space inside the component (for content)
            padding: {
                top: layout_config.padding_top || 0,
                right: layout_config.padding_right || 0,
                bottom: layout_config.padding_bottom || 0,
                left: layout_config.padding_left || 0
            },

            // Size mode: "fixed", "dynamic", "fill"
            width_mode: layout_config.width_mode || "fixed",   // "fixed" (px), "fill" (parent - margins), "dynamic" (content)
            height_mode: layout_config.height_mode || "fixed", // "fixed" (px), "fill" (parent - margins), "dynamic" (content)

            // Size values (used when mode is "fixed")
            width: layout_config.width || 100,
            height: layout_config.height || 40,

            // Offset from anchor point (relative positioning)
            offset_x: layout_config.offset_x || 0,
            offset_y: layout_config.offset_y || 0
        };

        // Computed position (absolute coordinates in virtual space)
        this.position = new rect(0, 0, this.layout.width, this.layout.height);

        // Parent's position (for relative positioning)
        this.parent_rect = null;

        // Content area (position minus padding)
        this.content_rect = new rect(0, 0, 0, 0);

        // Children components for event bubbling
        this.children = [];
    }

    /**
     * Calculate absolute position based on parent and layout configuration
     * This is called when parent resizes or layout properties change
     */
    calculate_layout(parent_rect) {
        try {
            if (!parent_rect) {
                this.logger.error("calculate_layout: parent_rect is required");
                return;
            }

            this.parent_rect = parent_rect;

            // 1. Calculate width based on width_mode
            let width = 0;
            switch (this.layout.width_mode) {
                case "fixed":
                    width = this.layout.width;
                    break;
                case "fill":
                    width = parent_rect.width - this.layout.margin.left - this.layout.margin.right;
                    break;
                case "dynamic":
                    // Dynamic sizing will be handled by subclasses (e.g., button measures text)
                    width = this.layout.width; // Use specified width for now
                    break;
            }

            // 2. Calculate height based on height_mode
            let height = 0;
            switch (this.layout.height_mode) {
                case "fixed":
                    height = this.layout.height;
                    break;
                case "fill":
                    height = parent_rect.height - this.layout.margin.top - this.layout.margin.bottom;
                    break;
                case "dynamic":
                    // Dynamic sizing will be handled by subclasses
                    height = this.layout.height; // Use specified height for now
                    break;
            }

            // 3. Calculate X position based on anchor_x
            let x = parent_rect.x;
            switch (this.layout.anchor.x) {
                case "left":
                    x = parent_rect.x + this.layout.margin.left + this.layout.offset_x;
                    break;
                case "right":
                    x = parent_rect.x + parent_rect.width - width - this.layout.margin.right - this.layout.offset_x;
                    break;
                case "center":
                    x = parent_rect.x + (parent_rect.width - width) / 2 + this.layout.offset_x;
                    break;
            }

            // 4. Calculate Y position based on anchor_y
            let y = parent_rect.y;
            switch (this.layout.anchor.y) {
                case "top":
                    y = parent_rect.y + this.layout.margin.top + this.layout.offset_y;
                    break;
                case "bottom":
                    y = parent_rect.y + parent_rect.height - height - this.layout.margin.bottom - this.layout.offset_y;
                    break;
                case "center":
                    y = parent_rect.y + (parent_rect.height - height) / 2 + this.layout.offset_y;
                    break;
            }

            // 5. Update position rect
            this.position.x = Math.round(x);
            this.position.y = Math.round(y);
            this.position.width = Math.round(width);
            this.position.height = Math.round(height);

            // 6. Calculate content rect (position minus padding)
            this.content_rect.x = this.position.x + this.layout.padding.left;
            this.content_rect.y = this.position.y + this.layout.padding.top;
            this.content_rect.width = this.position.width - this.layout.padding.left - this.layout.padding.right;
            this.content_rect.height = this.position.height - this.layout.padding.top - this.layout.padding.bottom;

            // 7. Call resize hook for subclasses
            this.on_layout_calculated();

            // 8. Bubble resize to children
            this.resize_children();

        } catch (error) {
            this.logger.error(`calculate_layout: ${error.message}`);
        }
    }

    /**
     * Hook for subclasses to override - called after layout is calculated
     */
    on_layout_calculated() {
        // Subclasses can override this
    }

    /**
     * Resize this component (triggered by parent)
     * This is the external API that parent components call
     */
    resize(parent_rect) {
        try {
            this.calculate_layout(parent_rect);
            this.emit('resize', { component: this, position: this.position });
        } catch (error) {
            this.logger.error(`resize: ${error.message}`);
        }
    }

    /**
     * Bubble resize event to all children
     */
    resize_children() {
        try {
            // Pass our content_rect as the parent_rect for children
            // (so children are positioned relative to our content area, not including padding)
            this.children.forEach(child => {
                if (child && child.resize && typeof child.resize === 'function') {
                    child.resize(this.content_rect);
                }
            });
        } catch (error) {
            this.logger.error(`resize_children: ${error.message}`);
        }
    }

    /**
     * Add a child component
     */
    add_child(child) {
        try {
            if (child) {
                this.children.push(child);
                // Initial layout for the child
                if (this.content_rect) {
                    child.calculate_layout(this.content_rect);
                }
            }
        } catch (error) {
            this.logger.error(`add_child: ${error.message}`);
        }
    }

    /**
     * Remove a child component
     */
    remove_child(child) {
        try {
            const index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
            }
        } catch (error) {
            this.logger.error(`remove_child: ${error.message}`);
        }
    }

    /**
     * Check if a point (in physical pixels) is inside this component
     */
    is_inside(mouse_x, mouse_y) {
        try {
            if (!this.active || !this.position) return false;

            // Transform mouse coordinates from physical to virtual space
            const viewport = this.graphics.viewport;
            const scale = viewport.scale;
            const renderedWidth = viewport.virtual.width * scale.x;
            const renderedHeight = viewport.virtual.height * scale.y;
            const offsetX = (viewport.given.width - renderedWidth) / 2;
            const offsetY = (viewport.given.height - renderedHeight) / 2;
            const virtual_mouse_x = (mouse_x - offsetX) / scale.x;
            const virtual_mouse_y = (mouse_y - offsetY) / scale.y;

            // Check collision in virtual coordinate space
            return virtual_mouse_x >= this.position.x &&
                   virtual_mouse_x <= this.position.x + this.position.width &&
                   virtual_mouse_y >= this.position.y &&
                   virtual_mouse_y <= this.position.y + this.position.height;
        } catch (error) {
            this.logger.error(`is_inside: ${error.message}`);
            return false;
        }
    }

    /**
     * Update layout properties and recalculate
     */
    update_layout(new_config) {
        try {
            // Merge new config into existing layout
            Object.assign(this.layout, new_config);

            // Recalculate if we have a parent rect
            if (this.parent_rect) {
                this.calculate_layout(this.parent_rect);
            }
        } catch (error) {
            this.logger.error(`update_layout: ${error.message}`);
        }
    }

    /**
     * Set active state
     */
    set_active(active) {
        try {
            this.active = active;
            // Propagate to children
            this.children.forEach(child => {
                if (child && child.set_active && typeof child.set_active === 'function') {
                    child.set_active(active);
                }
            });
        } catch (error) {
            this.logger.error(`set_active: ${error.message}`);
        }
    }

    /**
     * Render - subclasses should override
     */
    render() {
        // Subclasses override this
    }

    /**
     * Cleanup
     */
    delete() {
        try {
            this.active = false;

            // Delete all children
            this.children.forEach(child => {
                if (child && child.delete && typeof child.delete === 'function') {
                    child.delete();
                }
            });
            this.children = [];

            // Clear references
            delete this.parent;
            delete this.graphics;
            delete this.ctx;
            delete this.layout;
            delete this.position;
            delete this.parent_rect;
            delete this.content_rect;
        } catch (error) {
            this.logger.error(`delete: ${error.message}`);
        }
    }

    /**
     * Helper: Sanitize paths for security
     */
    sanitize_path(path) {
        if (typeof path !== 'string') {
            throw new Error("Invalid path type");
        }
        return path.replace(/[<>"'`;]/g, '');
    }
}
