// Import the required libraries
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport'); // Correct import for SerialPort
const { ReadlineParser } = require('@serialport/parser-readline'); // Correct parser

// Create an Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Attach Socket.IO to the server (before serial port configuration)
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow cross-origin requests
        methods: ["GET", "POST"]
    }
});

// Open the serial port (replace with your port like 'COM3' for Windows or '/dev/ttyUSB0' for Linux/Mac)
const port = new SerialPort({ path: '/dev/cu.usbserial-11401', baudRate: 115200 });

// Use the ReadlineParser to handle incoming serial data
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


parser.on('data', (data) => {
    let cleanData = data.toString().trim(); // Clean up the incoming data (remove any extra spaces or newlines)
    console.log('Raw data received from serial port:', cleanData); // Log raw data

    // let cleanData = data.toString().trim(); // Clean up the incoming data

    // Use a regex to remove non-numeric characters except for periods and minus signs (for negative numbers)
    cleanData = cleanData.replace(/[^0-9.-]/g, '');

    // Check if the cleaned data is a valid number-like string (allows leading zeros)
    if (!isNaN(cleanData) && cleanData !== '') {
        console.log(`Valid Travel Distance: ${cleanData} inches`); // Log the raw distance data
        io.emit('travel_distance', cleanData); // Emit the raw data as a string to retain formatting
    } else {
        console.log('Received invalid data:', cleanData); // Log invalid data for debugging
    }
});



// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A client connected: ' + socket.id);

    // Relay control event (optional)
    socket.on('relay_control', (command) => {
        console.log('Relay control command received: ', command);
        socket.broadcast.emit('relay_control', command);
    });

    // Handle client disconnection (optional)
    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

// Start the HTTP server and listen on port 4100
server.listen(4100, () => {
    console.log(`Server is running on port 4100`);
});



// // Import the required libraries
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const { SerialPort } = require('serialport'); // Correct import for SerialPort
// const { ReadlineParser } = require('@serialport/parser-readline'); // Correct parser

// const app = express();
// const server = http.createServer(app);

// // Open the serial port (replace with your port like 'COM3' for Windows or '/dev/ttyUSB0' for Linux/Mac)
// const port = new SerialPort({ path: '/dev/cu.usbserial-1301', baudRate: 115200 });

// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' })); // Use the ReadlineParser

// // Event listener for serial data (non-blocking)
// // Emit travel distance only if valid numeric data
// parser.on('data', (data) => {
//     const cleanData = data.toString().trim();
//     const travelDistance = parseFloat(cleanData);

//     if (!isNaN(travelDistance)) {
//         console.log(`Valid Travel Distance: ${travelDistance} inches`);
//         io.emit('travel_distance', travelDistance); // Emit travel_distance event
//     } else {
//         console.log('Received invalid data:', cleanData);
//     }
// });

// // Attach Socket.IO to the server
// const io = socketIo(server, {
//     cors: {
//         origin: "*", // Allow cross-origin requests
//         methods: ["GET", "POST"]
//     }
// });

// // Listen for incoming connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Handle relay control event
//     socket.on('relay_control', (command) => {
//         console.log('Relay control command received: ', command);
//         // Broadcast the relay control command to all clients
//         socket.broadcast.emit('relay_control', command);
//     });

//     // // Handle disconnection
//     // socket.on('disconnect', () => {
//     //     console.log('Client disconnected: ' + socket.id);
//     // });
// });

// // Start the server
// server.listen(4100, () => {
//     console.log(`Server is running on port 4100`);
// });




