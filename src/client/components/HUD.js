import { supabase } from '../lib/supabase';

export class HUD {
    constructor() {
        this.elements = new Map();
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        document.body.appendChild(this.container);
        
        // Subscribe to real-time updates
        this.subscribeToUpdates();
    }

    async subscribeToUpdates() {
        const subscription = supabase
            .channel('hud_elements')
            .on('postgres_changes', 
                {
                    event: '*',
                    schema: 'public',
                    table: 'hud_elements'
                },
                (payload) => {
                    switch (payload.eventType) {
                        case 'INSERT':
                            this.createElement(payload.new);
                            break;
                        case 'UPDATE':
                            this.updateElement(payload.new.id, payload.new);
                            break;
                        case 'DELETE':
                            this.removeElement(payload.old.id);
                            break;
                    }
                }
            )
            .subscribe();
    }

    async loadElements() {
        try {
            const { data: elements, error } = await supabase
                .from('hud_elements')
                .select('*');
            
            if (error) throw error;
            
            elements.forEach(element => this.createElement(element));
        } catch (error) {
            console.error('Failed to load HUD elements:', error);
        }
    }

    createElement(config) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.pointerEvents = 'auto';
        
        // Apply element config
        if (config.config) {
            Object.assign(element.style, config.config.style || {});
            element.innerHTML = config.config.content || config.name;
        }

        this.elements.set(config.id, element);
        this.container.appendChild(element);
        return element;
    }

    async updateElement(id, updates) {
        const element = this.elements.get(id);
        if (element && updates.config) {
            Object.assign(element.style, updates.config.style || {});
            if (updates.config.content) {
                element.innerHTML = updates.config.content;
            }
        }
    }

    async removeElement(id) {
        const element = this.elements.get(id);
        if (element) {
            element.remove();
            this.elements.delete(id);
        }
    }
}

// Export a singleton instance
export const hudManager = new HUD();
