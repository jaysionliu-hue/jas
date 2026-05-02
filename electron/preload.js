const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  createProject: (data) => ipcRenderer.invoke('create-project', data),
  readProject: (path) => ipcRenderer.invoke('read-project', path),
  saveFile: (path, content) => ipcRenderer.invoke('save-file', path, content),
  readFile: (path) => ipcRenderer.invoke('read-file', path)
});
