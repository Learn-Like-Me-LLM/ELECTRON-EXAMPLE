// This is a preload script. It runs in a privileged environment before the renderer process's web page is loaded.
// It has access to Node.js APIs and can be used to selectively expose functionalities
// to the renderer process via the `contextBridge` API, enhancing security by not exposing all of Node.js directly.
import { ipcRenderer, contextBridge } from 'electron'

// Exposes a controlled subset of the `ipcRenderer` module to the renderer process.
// This allows the renderer to send and receive messages to/from the main process
// without having full access to the `ipcRenderer` object, which is a security best practice.
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Exposes a custom API `electronAPI` to the renderer process.
contextBridge.exposeInMainWorld('electronAPI', {
  launchCounterUtility: () => ipcRenderer.invoke('launch-counter-utility'),
  launchRngUtility: () => ipcRenderer.invoke('launch-rng-utility')
})

// Exposes specific environment variables to the renderer process.
contextBridge.exposeInMainWorld('env', {
  CUSTOM_ENV_VAR: process.env.CUSTOM_ENV_VAR,
  NODE_ENV: process.env.NODE_ENV,
})

// A utility function that returns a Promise, resolving when the document's readyState
// matches one of the specified conditions (defaulting to 'complete' or 'interactive').
// This is useful for ensuring that DOM manipulations occur only after the DOM is ready.
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

// Provides utility functions for safely appending and removing DOM elements.
// It checks if the child element already exists before performing the operation
// to prevent duplicate appends or errors during removal.
const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

// Creates and manages a loading spinner animation.
// This is used to provide visual feedback to the user while the application is initializing.
// The CSS for the spinner is defined within this function and injected into the document.
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// Initializes the loading spinner: appends it when the DOM is ready.
// It also sets up a mechanism to remove the loading spinner when a specific 'removeLoading' message
// is received via `window.onmessage` or after a timeout (4999ms).
const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
