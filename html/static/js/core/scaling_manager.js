// ScalingManager - Unified scaling calculations for viewport
// Single source of truth for all scaling operations

class ScalingManager {
    constructor(virtualWidth, virtualHeight) {
        this.virtual = {
            width: virtualWidth,
            height: virtualHeight
        };
        
        this.physical = {
            width: 0,
            height: 0
        };
        
        this.scale = {
            x: 1,
            y: 1
        };
        
        this.offset = {
            x: 0,
            y: 0
        };
        
        this.rendered = {
            width: 0,
            height: 0
        };
    }

    // Calculate scaling for given physical dimensions
    calculate(physicalWidth, physicalHeight) {
        this.physical.width = Math.floor(physicalWidth);
        this.physical.height = Math.floor(physicalHeight);

        // Calculate uniform scale to fit virtual viewport into physical space
        // Use minimum scale factor to ensure entire viewport is visible (letterbox if needed)
        const scaleX = this.physical.width / this.virtual.width;
        const scaleY = this.physical.height / this.virtual.height;
        const uniformScale = Math.min(scaleX, scaleY);

        // Apply uniform scaling to maintain aspect ratio
        this.scale.x = uniformScale;
        this.scale.y = uniformScale;

        // Calculate actual rendered dimensions
        this.rendered.width = this.virtual.width * this.scale.x;
        this.rendered.height = this.virtual.height * this.scale.y;

        // Calculate centering offset (letterbox/pillarbox positioning)
        this.offset.x = (this.physical.width - this.rendered.width) / 2;
        this.offset.y = (this.physical.height - this.rendered.height) / 2;
    }

    // Get the uniform scale factor
    getUniformScale() {
        return this.scale.x;
    }

    // Check if letterboxing or pillarboxing is active
    hasLetterbox() {
        return this.offset.x > 0 || this.offset.y > 0;
    }

    // Get letterbox type
    getLetterboxType() {
        if (this.offset.x > 0 && this.offset.y === 0) {
            return 'pillarbox'; // Vertical bars on sides
        } else if (this.offset.y > 0 && this.offset.x === 0) {
            return 'letterbox'; // Horizontal bars on top/bottom
        } else if (this.offset.x === 0 && this.offset.y === 0) {
            return 'none';
        }
        return 'both'; // Unusual case
    }

    // Check if in portrait orientation
    isPortrait() {
        return this.physical.height > this.physical.width;
    }

    // Check if in landscape orientation
    isLandscape() {
        return this.physical.width > this.physical.height;
    }

    // Get aspect ratio of physical display
    getPhysicalAspectRatio() {
        return this.physical.width / this.physical.height;
    }

    // Get aspect ratio of virtual viewport
    getVirtualAspectRatio() {
        return this.virtual.width / this.virtual.height;
    }

    // Get scaling information for debugging
    getDebugInfo() {
        return {
            virtual: `${this.virtual.width}x${this.virtual.height}`,
            physical: `${this.physical.width}x${this.physical.height}`,
            scale: this.scale.x.toFixed(3),
            rendered: `${Math.round(this.rendered.width)}x${Math.round(this.rendered.height)}`,
            offset: `${Math.round(this.offset.x)}, ${Math.round(this.offset.y)}`,
            letterbox: this.getLetterboxType(),
            orientation: this.isPortrait() ? 'portrait' : 'landscape'
        };
    }
}
