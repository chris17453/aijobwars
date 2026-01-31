// CoordinateTransformer - Centralized coordinate transformation utility
// Handles all conversions between physical (screen) and virtual (game) coordinates

class CoordinateTransformer {
    constructor(viewport) {
        this.viewport = viewport;
    }

    // Convert physical screen coordinates to virtual game coordinates
    // Used for mouse/touch input processing
    physicalToVirtual(physicalX, physicalY) {
        return {
            x: (physicalX - this.viewport.offset.x) / this.viewport.scale.x,
            y: (physicalY - this.viewport.offset.y) / this.viewport.scale.y
        };
    }

    // Convert virtual game coordinates to physical screen coordinates
    // Used for positioning UI elements on screen
    virtualToPhysical(virtualX, virtualY) {
        return {
            x: virtualX * this.viewport.scale.x + this.viewport.offset.x,
            y: virtualY * this.viewport.scale.y + this.viewport.offset.y
        };
    }

    // Apply the viewport transformation to a canvas context
    // Call this once before rendering all virtual-coordinate content
    applyCanvasTransform(ctx) {
        ctx.translate(this.viewport.offset.x, this.viewport.offset.y);
        ctx.scale(this.viewport.scale.x, this.viewport.scale.y);
    }

    // Check if a physical coordinate is within the rendered viewport
    isInsideViewport(physicalX, physicalY) {
        const rendered_x = this.viewport.offset.x;
        const rendered_y = this.viewport.offset.y;
        const rendered_width = this.viewport.rendered.width;
        const rendered_height = this.viewport.rendered.height;

        return physicalX >= rendered_x && 
               physicalX < rendered_x + rendered_width &&
               physicalY >= rendered_y && 
               physicalY < rendered_y + rendered_height;
    }
}
