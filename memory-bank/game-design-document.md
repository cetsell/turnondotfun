Game Design Document: AI-Powered Real-Time 3D Dating Simulator RPG
1. Introduction
This game is a real-time 3D dating simulator with RPG elements, built using Three.js and powered by Hyperfy. Players navigate a single-level social gathering, interacting with approximately a dozen characters through dialogue-based "battles" to build rapport and level up their character. The initial Minimum Viable Product (MVP) focuses on a streamlined experience with a lobby, basic marketplace, game world, HUD, and interaction mechanics. Characters are hardcoded for the MVP, with future integration of Large Language Models (LLMs) for dynamic responses.
MVP Scope
Single Level: A medium-scale social gathering (e.g., coffee shop, night club) with ~12 characters.

Lobby: Entry point with basic marketplace functionality.

Game World: Powered by Hyperfy, no minimap required.

HUD: Displays player stats and interaction prompts.

Battle System: Social interactions with leveling mechanics.

2. Core Mechanics
2.1 Player Progression
Experience Points (XP): Earned from successful interactions with characters.

Leveling Up: Players accumulate XP to gain levels, improving stats (e.g., humor, charm).

Stat Allocation: Upon leveling, players allocate points to stats of their choice.

Currency: Earned alongside XP, used in the marketplace.

2.2 Stat System
Player Stats: Attributes like humor, intelligence, and charm influence interaction success.

Interaction Outcomes: Success depends on player stats and dialogue choices.

2.3 Social Interactions ("Battle" System)
Initiation: Players approach a character and select an interaction prompt (e.g., "Talk").

Dialogue-Based Battles: Players choose from predefined options (e.g., "Flirt," "Joke").

Success Criteria: Determined by stat comparisons and choices, rewarding XP and currency.

Feedback: Visual indicators (e.g., hearts) show interaction progress.

3. Game World
Description: A single 3D level representing a medium-scale social gathering with ~12 characters milling around.

Setting Options: Coffee shop, museum, night club, or fancy party (MVP selects one).

Navigation:
Mobile: Virtual joysticks for movement and camera control.

Desktop: Keyboard and mouse controls.

No Minimap: Simple layout ensures intuitive navigation without additional UI.

4. User Interface
4.1 Lobby
Purpose: Entry point to the game world and marketplace.

Elements:
Start Game Button: Enters the social gathering world.

Marketplace Button: Accesses the basic shop.

Avatar Customization: Basic options to personalize the player character.

Stats Display: Shows current level and stats.

4.2 Marketplace (MVP)
Functionality: Basic shop within the lobby.

Features:
Item List: Small selection (e.g., 5-10 items like "Witty Tie: +1 Humor").

Purchase Option: Uses in-game currency earned from interactions.

Preview: Displays item effects or appearance.

4.3 HUD (In-Game)
Purpose: Provides real-time information during gameplay.

Elements:
Player Stats: Top left (e.g.,  5,  3).

Level & XP Bar: Tracks progression.

Currency: Top center (e.g.,  50).

Interaction Prompt: Appears near characters (e.g., "Talk to Alex").

Mobile Controls: Virtual joysticks (movement bottom left, camera bottom right).

4.4 Conversation Interface
Activation: Triggered by selecting a character to interact with.

Elements:
Character Dialogue: Displays the character's response.

Player Options: List of dialogue choices (e.g., "Compliment," "Ask a Question").

Progress Indicator: Hearts or meter showing interaction success.

Exit Option: Ends the interaction.

5. Progression System
XP Rewards: Granted for successful interactions, scaling with difficulty or outcome.

Leveling Up: Players allocate a point to a stat (e.g., +1 charm) upon leveling.

Currency: Earned alongside XP, spent in the marketplace for stat boosts or cosmetics.

Upgrade Access: Available in the lobby or via HUD post-level-up.

6. Character System
MVP Design: ~12 hardcoded characters with predefined dialogue trees and stats.

Stats: Basic attributes (e.g., difficulty) influence interaction outcomes.

Future Plan: Integration with LLMs for dynamic, AI-driven responses.

Behavior: Characters mill around the social gathering, available for interaction.

7. Marketplace (MVP)
Scope: Simple shop integrated into the lobby.

Items: Limited selection (e.g., stat-boosting accessories, cosmetic options).

Currency: Earned through interactions, tying progression to purchases.

8. Technical Considerations
Platform: Built with Three.js, powered by Hyperfy for 3D world rendering.

UI: HTML overlays for lobby, HUD, and conversation interfaces.

Controls:
Mobile: Virtual joysticks for movement and camera.

Desktop: Keyboard and mouse.

Single-Player Focus: No multiplayer in MVP.

9. Art and Design
Visual Style: Modern and inviting (warm colors, sleek design).

3D Assets: Characters and environment reflecting the social gathering theme.

UI Design: Clean, readable, with high contrast.

10. Future Expansions
LLM Integration: Dynamic character responses for richer interactions.

Additional Levels: New social settings or story progression.

Marketplace Growth: User-generated content and AI-created assets.

Enhanced Mechanics: Deeper relationship systems or explicit content.

