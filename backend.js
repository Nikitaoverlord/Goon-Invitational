const fs = require('fs')

const express = require("express")
const app = express()

// socket.io setup
const http = require("http")
const server = http.createServer(app)
const { Server } = require('socket.io')
const { profile } = require('console')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

const port = 3008

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/home.html')
})

const users = {} // a dictionary of objects with each key being the socket.id

var eventInfo = JSON.parse(fs.readFileSync(__dirname + '/public/data/events.JSON'))

function updateUsers(){
    io.emit('updated info', (eventInfo))
}

io.on('connection', (socket) => {
    console.log('a user connected')
    users[socket.id] = {}

    io.to(socket.id).emit('info', (eventInfo))

    socket.on('disconnect', (reason) => {
        console.log(reason)
        // delete from users
    })

    socket.on('add athlete', (athlete_info) => {
        let athleteName = athlete_info[0]
        let event = athlete_info[1]

        eventInfo[event].push(athleteName)

        io.emit('add backend athlete', ([athleteName, event, eventInfo[event].length]))
        updateUsers()
    })

    socket.on('remove athlete', (athlete_info) => {
        let athleteName = athlete_info[0]
        let event = athlete_info[1]

        eventInfo[event].splice(eventInfo[event].indexOf(athleteName), 1)

        io.emit('remove backend athlete', ([athleteName, event]))

        updateUsers()
    })
})



setInterval(() => {
    // updating data
    fs.writeFileSync(__dirname + '/public/data/events.json', JSON.stringify(eventInfo))
    ////////////////
}, 1)




server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
  
console.log('server did load')