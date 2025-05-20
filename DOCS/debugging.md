# Debugging

## VSCode (_.vscode/launch.json_)

1. Add breakpoint(s) in VSCode gutter

2. Start the application in debug mode:
   - run the `debug` command from your `makefile`:
     ```bash
     make debug
     ```
   - This command starts the Vite development server (for the renderer process) and prepares the main process for debugging.

3. Run the `MAIN PROCESS` through the VSCode Debugger:
   - Go to the "Run and Debug" panel in VSCode (the play button icon with a bug).
   - Select the `DEBUG MAIN PROCESS` configuration from the dropdown.
   - Click the green play button to start debugging.

4. Use the application

5. Step Through Breakpoint(s) / Code

**Controls**

## External Debugging Tools

...TBD...