/**
 * Base class for all UI components
 * Handles parent-child relationships and coordinate transformations
 * All UI elements should extend this to ensure consistent behavior
 */
class ui_component extends events {
    constructor(parent, graphics, position) {
        super();
        this.parent = parent;
        this.graphics = graphics;
        this.position = position;  // Relative position within parent
        this.anchor_position = null;  // Calculated absolute position of parent
        this.children = [];
        this.visible = true;
        this.active = true;
    }

    /**
     * Add a child component
     */
    add_child(child) {
        if (!this.children.includes(child)) {
            this.children.push(child);
            child.parent = this;
        }
    }

    /**
     * Remove a child component
     */
    remove_child(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    /**
     * Get absolute position by adding relative position to anchor position
     * This is the core coordinate transform that makes everything work
     */
    get_absolute_position() {
        let absolute_position = this.position.clone();
        if (this.anchor_position) {
            absolute_position.add(this.anchor_position);
        }
        return absolute_position;
    }

    /**
     * Update anchor position (called by parent when it moves/resizes)
     */
    resize(anchor_position) {
        this.anchor_position = anchor_position;

        // Update all children with our absolute position as their anchor
        const our_absolute = this.get_absolute_position();
        for (let child of this.children) {
            if (child.resize) {
                child.resize(our_absolute);
            }
        }
    }

    /**
     * Update this component and all children
     * Override this in subclasses to add custom update logic
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update all children
        for (let child of this.children) {
            if (child.update) {
                child.update(deltaTime);
            }
        }
    }

    /**
     * Render this component and all children
     * Override render_self() in subclasses for custom rendering
     */
    render() {
        if (!this.visible || !this.active) return;

        // Render this component first
        this.render_self();

        // Then render all children
        for (let child of this.children) {
            if (child.render) {
                child.render();
            }
        }
    }

    /**
     * Override this to render the component itself
     * Default: do nothing
     */
    render_self() {
        // Override in subclass
    }

    /**
     * Set visibility
     */
    set_visible(visible) {
        this.visible = visible;
    }

    /**
     * Set active state
     */
    set_active(active) {
        this.active = active;
        for (let child of this.children) {
            if (child.set_active) {
                child.set_active(active);
            }
        }
    }

    /**
     * Cleanup
     */
    delete() {
        // Destroy all children
        for (let child of this.children) {
            if (child.delete) {
                child.delete();
            }
        }
        this.children = [];
        this.parent = null;
    }
}
