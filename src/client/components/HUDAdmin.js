import { supabase } from '../lib/supabase';

export class HUDAdmin {
    constructor(container) {
        this.container = container || document.createElement('div');
        this.container.className = 'hud-admin';
        this.render();
        this.loadElements();
    }

    async loadElements() {
        try {
            const { data: elements, error } = await supabase
                .from('hud_elements')
                .select('*');
            
            if (error) throw error;
            
            this.renderElements(elements);
        } catch (error) {
            console.error('Failed to load HUD elements:', error);
        }
    }

    async createElement(element) {
        try {
            const { data, error } = await supabase
                .from('hud_elements')
                .insert([element])
                .select()
                .single();

            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Failed to create element:', error);
            throw error;
        }
    }

    async updateElement(id, updates) {
        try {
            const { data, error } = await supabase
                .from('hud_elements')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Failed to update element:', error);
            throw error;
        }
    }

    async deleteElement(id) {
        try {
            const { error } = await supabase
                .from('hud_elements')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Failed to delete element:', error);
            throw error;
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="hud-editor">
                <h1>HUD Element Manager</h1>
                <div>
                    <button id="createNew">Add New Element</button>
                </div>
                <div class="element-list" id="elementList"></div>
            </div>
        `;

        this.container.querySelector('#createNew').onclick = () => this.handleCreate();
    }

    renderElements(elements) {
        const list = this.container.querySelector('#elementList');
        list.innerHTML = elements.map(element => `
            <div class="element-card" data-id="${element.id}">
                <h3>${element.name}</h3>
                <p>Type: ${element.type}</p>
                <div class="element-actions">
                    <button onclick="handleEdit('${element.id}')">Edit</button>
                    <button onclick="handleDelete('${element.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    async handleCreate() {
        const name = prompt('Enter element name:');
        if (name) {
            await this.createElement({
                name,
                type: 'text',
                config: {
                    style: {
                        position: 'absolute',
                        top: '10px',
                        left: '10px'
                    },
                    content: name
                }
            });
            await this.loadElements();
        }
    }

    async handleEdit(id) {
        const { data: element } = await supabase
            .from('hud_elements')
            .select()
            .eq('id', id)
            .single();

        if (element) {
            const newName = prompt('Enter new name:', element.name);
            if (newName) {
                await this.updateElement(id, {
                    ...element,
                    name: newName,
                    config: {
                        ...element.config,
                        content: newName
                    }
                });
                await this.loadElements();
            }
        }
    }

    async handleDelete(id) {
        if (confirm('Are you sure you want to delete this element?')) {
            await this.deleteElement(id);
            await this.loadElements();
        }
    }
}

// Add some basic styles
const style = document.createElement('style');
style.textContent = `
    .hud-admin {
        font-family: Arial, sans-serif;
        padding: 20px;
    }
    .hud-editor {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .element-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    .element-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
        border: 1px solid #dee2e6;
    }
    .element-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    button {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    button:hover {
        background: #0056b3;
    }
`;
document.head.appendChild(style);
