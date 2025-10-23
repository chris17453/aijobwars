class window_manager extends events{
    constructor(elements) {
      super();
      this.canvas = document.getElementById(elements.canvasId);
      this.ctx = this.canvas.getContext('2d');

      this.graphics = new graphics(this.canvas, this.ctx); //drawing the main level logic
      this.audio_manager = new audio_manager();
      this.modals = [];
      this.active_modal=null;
      this.boss_mode_activated = false;

      this.kb = new key_states();

      // Set initial canvas size
      this.graphics.recalc_canvas();

      // DEBUG: Frame stepping mode - disabled by default (F12 to toggle, F11 to step)
      this.debug_frame_step = false;
      this.debug_render_next_frame = false;
      this.debug_frame_count = 0;

      window.addEventListener('keydown', (event) => {
          this.kb.down(event.key);
          this.kb.event(event)

          // F12 = Toggle frame stepping mode
          if (event.key === 'F12') {
              this.debug_frame_step = !this.debug_frame_step;
              console.log('[DEBUG] Frame stepping:', this.debug_frame_step ? 'ENABLED - Press F11 to render next frame' : 'DISABLED');
              event.preventDefault();
              return;
          }

          // F11 = Render next frame (when in frame step mode)
          if (event.key === 'F11') {
              if (this.debug_frame_step) {
                  this.debug_render_next_frame = true;
                  console.log('[DEBUG] ========== RENDERING FRAME', ++this.debug_frame_count, '==========');
              }
              event.preventDefault();
              return;
          }

          // Forward keyboard events to active modal's keyboard state
          if (this.active_modal && this.active_modal.update_keyboard_state) {
              this.active_modal.update_keyboard_state(event.key, true);
          }

          switch (event.key) {
              case 'F5': break;
              default: event.preventDefault();
          }

      });

      window.addEventListener('keyup', (event) => {
          this.kb.up(event.key);
          this.kb.event(event)

          // Forward keyboard events to active modal's keyboard state
          if (this.active_modal && this.active_modal.update_keyboard_state) {
              this.active_modal.update_keyboard_state(event.key, false);
          }

          switch (event.key) {
              case 'F5': break;
              case 'F11': break;
              case 'F12': break;
              default: event.preventDefault();
          }
      });

      // Track orientation for detecting changes
      this.last_orientation = null;
      this.last_canvas_dimensions = null;

      // Window resize listener - resize ALL modals on every resize
      window.addEventListener('resize', () => {
          if (!this.graphics || !this.graphics.viewport) return;

          // Recalculate canvas and viewport on resize
          this.graphics.recalc_canvas();

          // Check if dimensions actually changed
          const dimensions_key = `${this.graphics.canvas.width}x${this.graphics.canvas.height}`;
          const dimensions_changed = this.last_canvas_dimensions !== dimensions_key;

          // ONLY update modals if dimensions actually changed since last resize
          if (!dimensions_changed) {
              return;
          }

          this.last_canvas_dimensions = dimensions_key;

          // Check if orientation changed
          const current_orientation = this.graphics.viewport.isPortrait() ? 'portrait' : 'landscape';
          const orientationChanged = this.last_orientation !== null && this.last_orientation !== current_orientation;

          if (orientationChanged) {
              console.log(`[Orientation] Changed from ${this.last_orientation} to ${current_orientation}`);
          }

          // Update ALL modals on EVERY resize (not just orientation changes)
          this.modals.forEach(modal => {
              // Reload backgrounds if orientation changed
              if (orientationChanged && modal.background) {
                  // Extract the base name (remove _portrait or _landscape suffix)
                  let baseName = modal.background;
                  if (baseName.endsWith('_portrait') || baseName.endsWith('_landscape')) {
                      baseName = baseName.replace(/_portrait$|_landscape$/, '');
                  }

                  // Re-apply the background (which will auto-add the correct suffix)
                  modal.set_background(baseName);
              }

              // ALWAYS update dimensions on resize
              if (modal.update_dimensions_for_orientation && typeof modal.update_dimensions_for_orientation === 'function') {
                  modal.update_dimensions_for_orientation();
              } else {
                  // Fallback: just call resize if no custom update method
                  if (modal.resize && typeof modal.resize === 'function') {
                      modal.resize();
                  }
              }
          });

          this.last_orientation = current_orientation;
      });

      setInterval(() => {
          // Skip rendering if in frame step mode and F11 wasn't pressed
          if (this.debug_frame_step && !this.debug_render_next_frame) {
              return;
          }
          this.debug_render_next_frame = false; // Reset after rendering one frame

          // DO NOT call recalc_canvas every frame - it triggers resize events!
          // Canvas dimensions are set in the window resize listener
          if (this.has_windows() > 0) {
              this.handle_keys();
              this.render();
          }
        },1000 / 24);
    }



    has_windows(){
        if( this.modals.length>0) return true;
        return false;
    }
    add(modal_instance){
      modal_instance.init(this);
      modal_instance.layout();
      this.insert_model(modal_instance);
      
    }


    create_modal(title,text, position,cancel = false, ok = true,close=false) {
      //console.log("Creating Modal");
      const modal_instance = new modal(this,this.graphics, position, title, text, cancel, ok,close);
      return this.insert_model(modal_instance);
    }
    
    insert_model(modal_instance){
      // Listen for the 'close' event to remove the modal
      modal_instance.on('close', () => {
        this.close_modal(modal_instance);
      });

      // Deactivate all modals EXCEPT those marked as always_active (like title_screen)
      this.modals.forEach(modal=> {
        if (!modal.always_active) {
          modal.set_active(false);
        }
      });
      this.modals.push(modal_instance);
      //console.log("Window Manager: Active instance");

      this.active_modal=modal_instance
      return modal_instance;
    }
  
    close_modal(modal_instance) {
      //console.log("Window Manager: Close Modal");
      const index = this.modals.indexOf(modal_instance);
      if (index > -1) {
        this.modals.splice(index, 1); // Remove the modal from the array
        // Additional cleanup if necessary
      }

      // CRITICAL: Clear active_modal immediately to prevent render calls on deleted modal
      this.active_modal = null;

      if(this.modals.length>0) {
        let last_modal= this.modals[this.modals.length - 1];
        last_modal.set_active(true);
        this.active_modal=last_modal;
      }
    }
    handle_keys(){
      // Handle global boss mode (Tab key only)
      if (this.kb.just_stopped('Tab')) {
        if (this.boss_mode_activated) {
          this.boss_mode_off();
        } else {
          this.boss_mode_on();
        }
        return; // Don't pass Tab to modals
      }

      // If boss mode is active, ESC exits it
      if (this.kb.just_stopped('Escape') && this.boss_mode_activated) {
        this.boss_mode_off();
        return; // Don't pass to modal
      }

      // Let active modal process its own keyboard events
      if (this.active_modal && !this.boss_mode_activated) {
        this.active_modal.handle_keys();
      }
    }

    boss_mode_on(){
      document.getElementById('game').style.display = 'none';
      document.getElementById('boss_mode').style.display = 'block';
      this.boss_mode_activated = true;

      // Pause all audio
      if (this.audio_manager) {
        this.audio_manager.sound_off();
      }
    }

    boss_mode_off(){
      document.getElementById('game').style.display = 'block';
      document.getElementById('boss_mode').style.display = 'none';
      this.boss_mode_activated = false;

      // Resume audio
      if (this.audio_manager) {
        this.audio_manager.sound_on();
      }
    }
    resize(){
      for(let i=0;i<this.modals.length;i++) this.modals[i].resize();
    }

    render() {
        if (this.modals.length > 0) {
          // DEBUG: Track save/restore balance
          const initialSaveCount = this.graphics.ctx._saveCount || 0;

          // Save the current canvas state
          this.graphics.ctx.save();
          this.graphics.ctx._saveCount = (this.graphics.ctx._saveCount || 0) + 1;

          // ALWAYS render base gradient background FIRST (before any transformations)
          // Fill the ENTIRE canvas, not just the viewport
          const baseGradient = this.graphics.ctx.createLinearGradient(0, 0, 0, this.graphics.viewport.given.height);
          baseGradient.addColorStop(0, '#0a1628');    // Dark blue top
          baseGradient.addColorStop(0.5, '#06292e');  // Teal middle (existing body bg)
          baseGradient.addColorStop(1, '#0d1b2a');    // Dark blue bottom
          this.graphics.ctx.fillStyle = baseGradient;
          this.graphics.ctx.fillRect(0, 0, this.graphics.viewport.given.width, this.graphics.viewport.given.height);

          // Apply viewport scaling and centering transformation
          // This makes everything drawn in virtual coordinates automatically scale to physical pixels
          const scale = this.graphics.viewport.scale;
          const viewport = this.graphics.viewport;

          // Calculate the actual rendered size after scaling
          const renderedWidth = viewport.virtual.width * scale.x;
          const renderedHeight = viewport.virtual.height * scale.y;

          // Calculate offset to center the viewport in the canvas
          const offsetX = (viewport.given.width - renderedWidth) / 2;
          const offsetY = (viewport.given.height - renderedHeight) / 2;

          // Apply translation to center, then scale
          this.graphics.ctx.translate(offsetX, offsetY);
          this.graphics.ctx.scale(scale.x, scale.y);

          // Now everything is drawn in virtual coordinate space (1920x1080)
          // and automatically scaled and centered to fit the canvas

          // Render background from active modal (if exists)
          if (this.active_modal && this.active_modal.background){
              const bgRect = new rect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);
              // Use "cover" mode to fill entire viewport (crop edges if needed)
              this.graphics.sprites.render(this.active_modal.background, null, bgRect, 1, "cover");
            }

          // Then render gradient overlay from active modal (if exists)
          if (this.active_modal && this.active_modal.bg_gradient) {
            var gradient = this.graphics.ctx.createLinearGradient(0, 0, 0, this.graphics.viewport.virtual.height);
            for(let i=0;i<this.active_modal.bg_gradient.length;i++)
              gradient.addColorStop(this.active_modal.bg_gradient[i][0],this.active_modal.bg_gradient[i][1]);

            // Draw gradient with proper transparency support
            this.graphics.ctx.fillStyle = gradient;
            this.graphics.ctx.fillRect(0, 0, this.graphics.viewport.virtual.width, this.graphics.viewport.virtual.height);
          }

          // Render ALL active modals (title screen, then menu, etc.)
          this.modals.forEach((modal, index) => {
            if (modal.active) {
              modal.render();
            }
          });

          // Restore the canvas state (removes the scale transformation)
          this.graphics.ctx.restore();
          this.graphics.ctx._saveCount = (this.graphics.ctx._saveCount || 1) - 1;

          // DEBUG: Verify save/restore balance
          const finalSaveCount = this.graphics.ctx._saveCount || 0;
          if (finalSaveCount !== initialSaveCount) {
            console.error(`[CTX LEAK] Save/restore mismatch! Initial: ${initialSaveCount}, Final: ${finalSaveCount}`);
          }
        }
    }
  }

  