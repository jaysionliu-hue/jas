const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: '墨境·高概念网文AI创作引擎',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
}

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('create-project', async (event, data) => {
  try {
    const { name, platform, genre, projectPath, concept } = data;
    const fullPath = path.join(projectPath || app.getPath('documents'), name);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    const project = {
      name,
      platform,
      genre,
      concept,
      createdAt: new Date().toISOString(),
      currentVolume: 1,
      currentChapter: 1
    };

    const configPath = path.join(fullPath, 'project.json');
    fs.writeFileSync(configPath, JSON.stringify(project, null, 2), 'utf-8');

    return { success: true, project: { ...project, path: fullPath } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-project', async (event, projectPath) => {
  try {
    const configPath = path.join(projectPath, 'project.json');
    if (!fs.existsSync(configPath)) {
      return { success: false, error: '项目不存在' };
    }
    const content = fs.readFileSync(configPath, 'utf-8');
    return { success: true, project: { ...JSON.parse(content), path: projectPath } };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
