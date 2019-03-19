const fs = require('fs');
const path = require('path')
const { app, BrowserWindow,Menu,Tray,ipcMain } = require('electron');

function WidgetForSaving(x, y, width,height,name,url) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.name = name;
  this.url = url;
}

let tray = null;
let WidgetsWindows = [];
let Settings = null;


function removeItem(array, item){
    for(var i in array){
        if(array[i]==item){
            array.splice(i,1);
            break;
        }
    }
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

function UnlockAllWidgets() {
	WidgetsWindows.forEach(element => {
		element.webContents.send('LockWidget', 0);
		element.setIgnoreMouseEvents(false);
	});
};

function LockAllWidgets() {
	WidgetsWindows.forEach(element => {
		element.webContents.send('LockWidget', 1);
		element.setIgnoreMouseEvents(true);
	});
};


function OpenSettingsWidgets() {
	if(Settings === null){
	Settings = new BrowserWindow({
    width: 800,
    height: 600,
	icon: path.join(__dirname, 'icon.ico'),
	opacity: 1,
	frame: false,
  });

  // and load the settings of the app.
	Settings.loadURL(`file://${__dirname}/settings.html`);

  // Open the DevTools.
  //Settings.webContents.openDevTools();
console.log(Settings.id);
  // Emitted when the window is closed.
  Settings.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    Settings = null;
  });
	}
  else
  Settings.focus();
};


ipcMain.on('CreateWindow', (event, arg) => {
	CreateWidget(arg.name,arg.url);
	
})

ipcMain.on('GetAllWidgets', (event, arg) => {
	event.sender.send('ReturnAllWidgets', WidgetsWindows);
})

ipcMain.on('Save', (event, arg) => {
	SaveWidgets();
})


ipcMain.on('Load', (event, arg) => {
	
	WidgetsWindows.forEach(element => {
		element.close();
	});
	
	let rawdata = fs.readFileSync('Save.txt');  
	let student = JSON.parse(rawdata);  
	student.forEach(element => {
	console.log(element);  
	LoadWidgets(element.name,element.url,element.x,element.y,element.height,element.width)
	});
	//LoadWidgets();
})

ipcMain.on('Delete', (event, arg) => {
	DeleteWidgets(arg);
})


const initiateTray = () => {
	tray = new Tray(__dirname+'./icon.ico')
	const contextMenu = Menu.buildFromTemplate([
    { label: 'Lock All Widgets', type: 'normal', click() {LockAllWidgets();}},
    { label: 'Unlock All Widgets', type: 'normal', click() {UnlockAllWidgets();}},
    { label: 'seperator', type: 'separator' },
    { label: 'Settings', type: 'normal', click() {OpenSettingsWidgets();}},
    { label: 'seperator', type: 'separator' },
    { label: 'Exit', type: 'normal', click() {app.quit()}}
  ])
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
  
OpenSettingsWidgets();
};

function CreateWidget(name,url) {
  // Create the browser window.
  var CurrentWidget;
  CurrentWidget = new BrowserWindow({
    width: 800,
    height: 600,
	skipTaskbar: true,
	nodeIntegration:false,
	transparent: true,
	title: name,
	backgroundColor: '#00000000',
	opacity: 1,
	alwaysOnTop: true,
	frame: false,
  });
  CurrentWidget.ids = CurrentWidget.id;
  CurrentWidget.name = name;
  CurrentWidget.url = url;
  
  WidgetsWindows.push(CurrentWidget);
  // and load the settings of the app.
  var urls = `file://${__dirname}/widget.html`;
  var widgeturl = url;
  var res = urls.concat(`??`,widgeturl);
  CurrentWidget.loadURL(res);

  // Open the DevTools.
 // CurrentWidget.webContents.openDevTools();
  if(Settings != null)
  Settings.webContents.send('ReturnAllWidgets', WidgetsWindows);
  // Emitted when the window is closed.
  CurrentWidget.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
	//var test = WidgetsWindows.findIndex(CurrentWidget);
	for( var i = 0; i < WidgetsWindows.length; i++){ 
	   if ( WidgetsWindows[i] === CurrentWidget) {
		 WidgetsWindows.splice(i, 1); 
	   }
	}
    CurrentWidget = null;
  if(Settings != null)
  Settings.webContents.send('ReturnAllWidgets', WidgetsWindows);
  });
};

function DeleteWidgets(id)
{
	BrowserWindow.fromId(id).close();
}

function SaveWidgets()
{
	var SaveFile = [];
	WidgetsWindows.forEach(element => {
		var Widget = new WidgetForSaving(element.getBounds().x,element.getBounds().y,element.getBounds().width,element.getBounds().height,element.name,element.url);
		console.log(Widget);
		SaveFile.push(Widget);
	});

	fs.writeFile("Save.txt", JSON.stringify(SaveFile), function(err, data) {
	if (err) console.log(err);
	console.log("Successfully Written to File.");
	});
}

function LoadWidgets(name,url,x,y,height,width) {
  // Create the browser window.
  var CurrentWidget;

  CurrentWidget = new BrowserWindow({
	x: x,
	y: y,
    width: width,
    height: height,
	skipTaskbar: true,
	nodeIntegration:false,
	transparent: true,
	title: name,
	backgroundColor: '#00000000',
	opacity: 1,
	alwaysOnTop: true,
	frame: false,
  });
  CurrentWidget.ids = CurrentWidget.id;
  CurrentWidget.name = name;
  CurrentWidget.url = url;
  
  WidgetsWindows.push(CurrentWidget);
  // and load the settings of the app.
  var urls = `file://${__dirname}/widget.html`;
  var widgeturl = url;
  var res = urls.concat(`??`,widgeturl);
  CurrentWidget.loadURL(res);

  // Open the DevTools.
  //CurrentWidget.webContents.openDevTools();
  if(Settings != null)
  Settings.webContents.send('ReturnAllWidgets', WidgetsWindows);
  // Emitted when the window is closed.
  CurrentWidget.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
	//var test = WidgetsWindows.findIndex(CurrentWidget);
	for( var i = 0; i < WidgetsWindows.length; i++){ 
	   if ( WidgetsWindows[i] === CurrentWidget) {
		 WidgetsWindows.splice(i, 1); 
	   }
	}
    CurrentWidget = null;
  if(Settings != null)
  Settings.webContents.send('ReturnAllWidgets', WidgetsWindows);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initiateTray);
app.on('window-all-closed', e => e.preventDefault() );
/*
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
*/
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function intervalFunc()
{
	WidgetsWindows.forEach(element => {
		element.moveTop();
		element.setAlwaysOnTop(true);
	});
}

setInterval(intervalFunc, 1500);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
