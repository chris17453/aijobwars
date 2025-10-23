/**
 * Asset Loader - Loads and manages asset packages via ASSETS.json manifest
 * Allows easy swapping of asset packages for localization, themes, etc.
 */
class asset_loader extends events {
    constructor() {
        super();
        this.manifest = null;
        this.package_name = null;
        this.package_version = null;
        this.loaded = false;
    }

    /**
     * Load the asset manifest from ASSETS.json
     * @returns {Promise} Resolves when manifest is loaded
     */
    async load_manifest(manifest_path = 'static/ASSETS.json') {
        try {
            const response = await fetch(manifest_path);
            if (!response.ok) {
                throw new Error(`Failed to load manifest: ${response.status}`);
            }

            this.manifest = await response.json();
            this.package_name = this.manifest.package_name;
            this.package_version = this.manifest.package_version;
            this.loaded = true;

            console.log(`[AssetLoader] Loaded package: ${this.package_name} v${this.package_version}`);
            this.emit('loaded', { package: this.package_name, version: this.package_version });

            return this.manifest;
        } catch (error) {
            console.error('[AssetLoader] Failed to load manifest:', error);
            throw error;
        }
    }

    /**
     * Get a nested property from the assets object using dot notation
     * @param {string} path - Dot-separated path (e.g., "ui.spritesheets.ui1", "ships.player")
     * @returns {any} The value at that path, or null if not found
     */
    get(path) {
        if (!this.loaded || !this.manifest) {
            console.warn('[AssetLoader] Manifest not loaded yet');
            return null;
        }

        const parts = path.split('.');
        let current = this.manifest.assets;

        for (const part of parts) {
            if (current[part] === undefined) {
                console.warn(`[AssetLoader] Path not found: ${path}`);
                return null;
            }
            current = current[part];
        }

        return current;
    }

    /**
     * Flatten all asset paths into a single array (useful for preloading)
     * @returns {Array<string>}
     */
    get_all_assets() {
        if (!this.loaded || !this.manifest) {
            return [];
        }

        const all_assets = [];

        const flatten = (obj) => {
            if (typeof obj === 'string') {
                all_assets.push(obj);
            } else if (Array.isArray(obj)) {
                obj.forEach(item => flatten(item));
            } else if (typeof obj === 'object' && obj !== null) {
                Object.values(obj).forEach(value => flatten(value));
            }
        };

        flatten(this.manifest.assets);
        return all_assets;
    }

    /**
     * Get package information
     * @returns {Object}
     */
    get_package_info() {
        return {
            name: this.package_name,
            version: this.package_version,
            description: this.manifest?.description || ''
        };
    }
}
