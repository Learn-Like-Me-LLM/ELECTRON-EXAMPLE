# Debugging

## Debugging Scenarios

1. **Renderer Process Debugging**: Using built-in Chrome DevTools
2. **Main Process Debugging**: Using VSCode debugger with launch.json configuration
3. **Utility Process Debugging**: Debugging forked utility processes with launch.json configuration

## 1. Renderer Process Debugging

The renderer process handles UI and frontend logic. Use built-in Chrome DevTools for debugging React components, CSS, and client-side JavaScript.

### Steps:
1. Start development:
   ```bash
   make dev
   ```

2. Open the Electron app - DevTools will be available via:
   - **Keyboard shortcut**: `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

## 2. Main Process Debugging

### Prerequisites:
- Verify `.vscode/launch.json` configuration

### Steps:
1. **Prepare the debug environment**:
   ```bash
   make debug
   ```

   This will:
   - Start only the renderer process in development mode
   - Wait for Vite dev server to be ready on http://localhost:5173

2. **Set breakpoints**:
   - Open main process files in `electron/main/`
   - Click in the gutter next to line numbers to set breakpoints
   - Breakpoints will pause execution when hit

3. **Build main process for debugging**:

  > [!IMPORTANT]
  > 
  > This is done automatically in this project through step 4

   ```bash
   npm run debug:build:main
   ```

   This creates debug builds with sourcemaps in `dist-electron/main/`

4. **Start debugging in VSCode**:
   - Go to **Run and Debug** panel (`Cmd+Shift+D`)
   - Select **"DEBUG MAIN PROCESS"** from the dropdown
   - Click the **play button** or press `F5`

## 3. Utility Process Debugging

> [!WARNING]
> 
> There is a race condition between triggering the utility process (spawning the new process) and attaching the VSCode debugger. You might want to add a 5-second timeout to give yourself time to complete steps 3 & 4 in quick succession.

1. **Start main process debugging**:
   ```bash
   make debug
   ```

2. **Set breakpoints** in `electron/main/utilityCounter.ts`

3. **Trigger utility process creation** (in your app):
   - Execute the action that spawns the utility process

4. **Attach VSCode debugger**:
   - Go to **Run and Debug** panel
   - Select **"DEBUG COUNTER UTILITY PROCESS"**
   - Click the **play button** to attach to port 9230
