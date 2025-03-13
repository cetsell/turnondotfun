import { Game } from './game.js';

class CharacterBuilder {
    constructor() {
        this.game = new Game('character-preview', true);
        this.options = {};
        this.currentSelections = {};
        this.currentColors = {};
        this.colorOptions = {
            head: ['#000000', '#8B4513', '#FFD700', '#A9A9A9', '#9CFF6D', '#FF886D', '#F8DA57', '#6DC2FF'],
            eyes: ['green', 'brown', 'pink', 'black'] // Make sure these match your PNG file names
        };
        this.loadCustomizationOptions();
        this.setupColorPickers();
    }

    async loadCustomizationOptions() {
        console.log('Starting to load customization options...');
        try {
            this.options = JSON.parse(document.getElementById('character-options').textContent);
            console.log('Customization options loaded successfully.');
            
            for (const [category, items] of Object.entries(this.options)) {
                this.populateSelect(category, items);
            }

            this.setupEventListeners();
            
            // Wait for the core VRM to load before updating dropdowns
            await this.game.loadCoreVRM();
            this.updateDropdownsFromCharacter();
        } catch (error) {
            console.error('Error loading customization options:', error);
        }
    }

    populateSelect(category, items) {
        console.log(`Populating select for category: ${category}`);
        const select = document.getElementById(category);
        if (!select) {
            console.error(`Select element for category ${category} not found.`);
            return;
        }

        select.innerHTML = ''; // Clear existing options

        // Add 'None' option
        const noneOption = document.createElement('option');
        noneOption.value = 'none';
        noneOption.textContent = 'None';
        select.appendChild(noneOption);

        items.forEach((item) => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item.split('.')[0].replace(/_/g, ' ');
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.currentSelections[e.target.id] = e.target.value;
                console.log(`Selection changed for ${e.target.id} to ${e.target.value}`);
                this.updateCharacter();
            });
        });
    }

    setupColorPickers() {
        for (const [category, colors] of Object.entries(this.colorOptions)) {
            const colorPickerContainer = document.getElementById(`${category}-color-picker`);
            console.log('Setting up color picker for', category, colorPickerContainer);
            if (colorPickerContainer) {
                colors.forEach(color => {
                    const colorButton = document.createElement('button');
                    if (category === 'eyes') {
                        colorButton.textContent = color;
                        colorButton.style.backgroundColor = '#f0f0f0';
                    } else {
                        colorButton.style.backgroundColor = color;
                    }
                    colorButton.classList.add('color-option', 'btn', 'btn-sm');
                    colorButton.addEventListener('click', () => this.changeComponentColor(category, color));
                    colorPickerContainer.appendChild(colorButton);
                });
            } else {
                console.error(`Color picker container for ${category} not found`);
            }
        }
    }

    changeComponentColor(category, color) {
        console.log(`Changing ${category} color to ${color}`);
        this.currentColors[category] = color;
        if (category === 'eyes') {
            this.game.changeEyeColor(color);
        } else {
            this.game.changeComponentColor(category, color);
        }
        // Force an update of the character
        this.updateCharacter();
    }

    updateCharacter() {
        console.log('Updating character with current selections:', this.currentSelections);
        const componentsToUpdate = {};
        for (const [category, value] of Object.entries(this.currentSelections)) {
            componentsToUpdate[category] = value;
        }
        this.game.updateCharacterComponents(componentsToUpdate, this.currentColors);
    }

    updateDropdownsFromCharacter() {
        console.log('Updating dropdowns from character components');
        const components = this.game.getCharacterComponents();
        for (const [category, file] of Object.entries(components)) {
            const select = document.getElementById(category);
            if (select) {
                select.value = file || 'none';
                this.currentSelections[category] = file || 'none';
            }
        }
    }
}

// Initialize the character builder when the DOM is ready
document.addEventListener('DOMContentLoaded', () => new CharacterBuilder());