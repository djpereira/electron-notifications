const electron = require('electron')

class Notifier {
    constructor() {
        this.queue = []
        if (process.type === 'renderer') {
            this.BrowserWindow = electron.remote.BrowserWindow
        } else {
            this.BrowserWindow = electron.BrowserWindow
        }
        this.interval = setInterval(() => {
            this.tick()
        }, 100)
    }

    notify (title, data) {
        const options = Object.assign({}, data)
        const size = electron.screen.getPrimaryDisplay().workAreaSize;
        const notificationWindow = new this.BrowserWindow({
            width: 440,
            height: 120,
            x: size.width - 440,
            y: 0,
            frame: false,
            transparent: true,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            titleBarStyle: 'hidden',
            show: false,
        })
        this.queue.push({ notificationWindow, title, options })
        return notificationWindow
    }

    tick () {
        if (this.active || this.queue.length === 0) return

        this.active = true

        const notification = this.queue.shift()
        const { notificationWindow, title, options } = notification

        notificationWindow.loadURL('file://' + __dirname + '/assets/notification.html');

        notificationWindow.webContents.on('did-finish-load', function() {
            notificationWindow.show()
            notificationWindow.webContents.send('setup', title, options)
        });

        const timeout = setTimeout(() => {
            notificationWindow.close()
        }, 4000)

        notificationWindow.on('closed', () => {
            this.active = false
            clearTimeout(timeout)
        })
    }
}

module.exports = Notifier
