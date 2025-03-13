Implementation Plan: AI-Powered Real-Time 3D Dating Simulator RPG (Base Game)
This plan outlines the steps to create the base game for the MVP, ensuring a functional core experience. It focuses on essential features like scene setup, player movement, basic interactions, and a simple progression system.

Step 1: Set Up Project Structure [COMPLETE]
Instruction: Create a new project directory and initialize a React application with TypeScript support. Install key dependencies for 3D rendering and UI, such as Three.js, React Three Fiber, and a basic styling library (e.g., CSS or styled-components).

Test: Run the project using npm start (or equivalent) and verify that a blank React app launches in the browser without errors.

Step 2: Create Lobby Scene [COMPLETE]
Instruction: Create a Lobby component in the src/scenes folder. Set up a basic 3D scene with a simple background, such as a solid color or gradient, using React Three Fiber.

Test: Load the lobby scene in the browser. Confirm the background renders correctly and the scene responds to basic camera movement (e.g., mouse drag).

Step 3: Add Start Game Button to Lobby [COMPLETE]
Instruction: Add a 2D HTML overlay to the Lobby component with a "Start Game" button. Position it centrally and make it visually distinct (e.g., bold text, contrasting color).

Test: Verify the button appears in the lobby scene. Click it and ensure it logs a message to the console (e.g., "Game started").

Step 4: Implement Basic Avatar Preview in Lobby [COMPLETE]
Instruction: Add a simple 3D avatar model to the lobby scene, such as a cube or a free character model from an online source. Position it in the center of the scene.

Test: Reload the lobby scene and confirm the avatar model appears, is correctly positioned, and renders without distortion.

Step 5: Create Game World Scene [COMPLETE]
Instruction: Create a GameWorld component in the src/scenes folder. Build a basic 3D environment (e.g., a flat floor with four walls) to represent a social gathering space.

Test: Load the game world scene manually. Verify the environment renders and the camera can move around it using mouse input.

Step 6: Add Player Controls to Game World [COMPLETE]
Instruction: Implement basic player movement in the game world using keyboard inputs (e.g., WASD for movement, mouse for camera rotation).

Test: Enter the game world, use the controls to move the camera, and ensure movement is smooth and doesn't pass through walls.

Step 7: Integrate Lobby and Game World [COMPLETE]
Instruction: Modify the "Start Game" button in the lobby to switch the active scene from the lobby to the game world.

Test: Click "Start Game" in the lobby. Confirm the scene transitions to the game world and player controls function as expected.

Step 8: Add HUD to Game World [IN PROGRESS]
Instruction: Add a 2D HTML overlay to the GameWorld component for a heads-up display (HUD). Include placeholders for stats (e.g., "Energy: 0") and currency (e.g., "Coins: 0").

Test: Load the game world and verify the HUD appears on-screen with the placeholder text visible and correctly positioned.

Step 9: Implement Virtual Joysticks for Mobile [NOT STARTED]
Instruction: Add touch-based virtual joysticks to the HUD for mobile control, using a simple layout (e.g., left joystick for movement, right for camera).

Test: Test on a mobile device or emulator. Confirm the joysticks appear and allow movement and camera control in the game world.

Step 10: Add Placeholder Characters to Game World [NOT STARTED]
Instruction: Place 10–12 static 3D character models in the game world, positioned naturally around the environment (e.g., standing in small groups).

Test: Load the game world and ensure all characters render correctly, are visible, and don't overlap with the environment.

Step 11: Implement Interaction Prompt [NOT STARTED]
Instruction: Add logic to show a prompt (e.g., "Talk to [Character]") on the HUD when the player moves within a set distance of a character.

Test: Approach a character in the game world. Verify the prompt appears when close and disappears when moving away.

Step 12: Create Conversation Interface [NOT STARTED]
Instruction: Design a 2D overlay for conversations, triggered by selecting the interaction prompt. Include a dialogue box with two placeholder options (e.g., "Hi!" and "Bye").

Test: Trigger the prompt, select it, and confirm the dialogue box appears with options. Ensure it can be closed by selecting an option.

Step 13: Implement Basic Dialogue Flow [NOT STARTED]
Instruction: Hardcode a simple dialogue response for one character. For example, selecting "Hi!" shows "Hello there!" and ends the conversation.

Test: Start a conversation, choose "Hi!," and verify the character's response appears before the dialogue box closes.

Step 14: Add Player Stats System [NOT STARTED]
Instruction: Create a basic stats system with two attributes (e.g., charm and wit) set to initial values (e.g., 1 each). Update the HUD to display these stats.

Test: Load the game world and confirm the HUD shows the correct initial stats (e.g., "Charm: 1, Wit: 1").

Step 15: Implement Stat Influence on Dialogue [NOT STARTED]
Instruction: Adjust the dialogue flow so the character's response varies based on a stat (e.g., high charm yields "You're charming!" vs. "Eh, hi.").

Test: Manually set the charm stat to a high value, start a conversation, and confirm the response reflects the stat.

Step 16: Add XP and Leveling System [NOT STARTED]
Instruction: Add an XP system where completing a conversation grants 10 XP. Level up the player at 20 XP (e.g., increase level from 1 to 2).

Test: Complete a conversation, check that XP increases by 10, and confirm a level-up occurs at 20 XP (e.g., log "Level 2" to console).

Step 17: Implement Stat Point Allocation [NOT STARTED]
Instruction: After a level-up, display a simple menu in the HUD to add 1 point to either charm or wit.

Test: Trigger a level-up, allocate a point to charm, and verify the HUD updates (e.g., "Charm: 2").

Step 18: Add Currency System [NOT STARTED]
Instruction: Implement a currency system (e.g., coins). Award 5 coins after a successful conversation and update the HUD to reflect the total.

Test: Finish a conversation, confirm 5 coins are added, and check that the HUD shows the updated coin total.

Step 19: Create Basic Marketplace in Lobby [NOT STARTED]
Instruction: Add a "Shop" button in the lobby that opens a 2D overlay listing two items (e.g., "Funny Hat: 10 coins, +1 Wit").

Test: Click the "Shop" button, ensure the overlay appears, and verify the items and their costs are displayed.

Step 20: Implement Item Purchase [NOT STARTED]
Instruction: Enable purchasing an item from the shop. Deduct the coin cost and apply the effect (e.g., +1 wit) upon purchase.

Test: Buy the "Funny Hat," confirm 10 coins are subtracted, and check that wit increases in the HUD.

Step 21: Add Avatar Customization [COMPLETE]
Instruction: Add a "Customize" button in the lobby that opens a menu to change one avatar feature (e.g., shirt color: red or blue).

Test: Change the shirt color to blue, confirm the avatar updates in the lobby and persists in the game world.

Step 22: Implement Exit to Lobby [COMPLETE]
Instruction: Add an "Exit" button to the game world HUD that switches the scene back to the lobby.

Test: Click "Exit" in the game world and verify the lobby scene loads correctly.

Step 23: Polish and Bug Fixes [NOT STARTED]
Instruction: Test the full game flow (lobby → game world → conversation → shop → customization → exit). Fix any bugs or inconsistencies.

Test: Play through the entire sequence and confirm a smooth, error-free experience.

