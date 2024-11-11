// Import the required libraries
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Create an Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Attach Socket.IO to the server with CORS settings
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Open the serial port (adjust the path as needed, e.g., 'COM3' on Windows or '/dev/ttyUSB0' on Linux/Mac)
const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

// Use the ReadlineParser to handle incoming serial data
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Function to parse JSON data safely
function safeJsonParse(line) {
    try {
        return JSON.parse(line);
    } catch (error) {
        console.log('Error parsing JSON:', error, 'Received line:', line);
        return null;
    }
}

// Handle incoming data from the serial port
parser.on('data', (data) => {
    let cleanData = data.toString().trim(); // Clean up the incoming data
    console.log('Raw data received from serial port:', cleanData);

    // Ignore non-JSON debug messages from Socket.IO (e.g., those that start with [SIoC])
    if (cleanData.startsWith('[SIoC]') || !cleanData.startsWith('{') && !cleanData.startsWith('[')) {
        console.log('Ignored non-JSON data:', cleanData);
        return;
    }

    const parsedData = safeJsonParse(cleanData);

   // Check if parsed data contains expected properties and emit to clients
   if (parsedData && parsedData.cutCount !== undefined) {
    console.log('Valid cut data received:', parsedData);
    io.emit('cut_status', parsedData); // Emit parsed data to clients
} else {
    console.log('Received valid JSON but without expected properties:', parsedData);
}
});


// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A client connected: ' + socket.id);

    // Listen for relay control commands from the client
    socket.on('relay_control', (command) => {
        console.log('Relay control command received:', command);
        port.write(command + '\n'); // Send command to Arduino
        socket.broadcast.emit('relay_control', command); // Broadcast to other clients
    });

    // Listen for cut parameters (length and quantity) from the React client
    socket.on('set_cut_parameters', (data) => {
        console.log('Cut parameters received:', data);
        port.write(JSON.stringify(data) + '\n'); // Send parameters as JSON to Arduino
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

// Start the HTTP server
server.listen(4100, () => {
    console.log(`Server is running on port 4100`);
});


// // Import the required libraries
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const { SerialPort } = require('serialport');
// const { ReadlineParser } = require('@serialport/parser-readline');

// // Create an Express app and HTTP server
// const app = express();
// const server = http.createServer(app);

// // Attach Socket.IO to the server with CORS settings
// const io = socketIo(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });

// // Open the serial port (adjust the path as needed, e.g., 'COM3' on Windows or '/dev/ttyUSB0' on Linux/Mac)
// const port = new SerialPort({ path: '/dev/cu.usbserial-1301', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Function to parse JSON data safely
// function safeJsonParse(line) {
//     try {
//         return JSON.parse(line);
//     } catch (error) {
//         console.log('Error parsing JSON:', error, 'Received line:', line);
//         return null;
//     }
// }

// // Handle incoming data from the serial port
// parser.on('data', (data) => {
//     let cleanData = data.toString().trim(); // Clean up the incoming data
//     console.log('Raw data received from serial port:', cleanData);

//     // Only attempt JSON parsing if the data appears to be JSON (starts with { or [)
//     if (cleanData.startsWith('{') || cleanData.startsWith('[')) {
//         const parsedData = safeJsonParse(cleanData);

//         // Check if parsed data is an object with expected properties
//         if (parsedData && parsedData.cutCount !== undefined) {
//             io.emit('cut_status', parsedData); // Emit parsed data to clients
//         } else {
//             console.log('Received valid JSON but without expected properties:', parsedData);
//         }
//     } else {
//         // Fallback for simple numeric data, such as travel distance
//         cleanData = cleanData.replace(/[^0-9.-]/g, '');
//         if (!isNaN(cleanData) && cleanData !== '') {
//             io.emit('travel_distance', cleanData); // Emit cleaned numeric data
//         } else {
//             console.log('Received non-JSON or invalid data:', cleanData); // Log invalid data for debugging
//         }
//     }
// });

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Listen for relay control commands from the client
//     socket.on('relay_control', (command) => {
//         console.log('Relay control command received:', command);
//         port.write(command + '\n'); // Send command to Arduino
//         socket.broadcast.emit('relay_control', command); // Broadcast to other clients
//     });

//     // Listen for cut parameters (length and quantity) from the React client
//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received:', data);
//         port.write(JSON.stringify(data) + '\n'); // Send parameters as JSON to Arduino
//     });

//     // Handle client disconnection
//     socket.on('disconnect', () => {
//         console.log('Client disconnected: ' + socket.id);
//     });
// });

// // Start the HTTP server
// server.listen(4100, () => {
//     console.log(`Server is running on port 4100`);
// });





// // Import the required libraries
// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const { SerialPort } = require('serialport'); // Correct import for SerialPort
// const { ReadlineParser } = require('@serialport/parser-readline'); // Correct parser

// // Create an Express app and HTTP server
// const app = express();
// const server = http.createServer(app);

// // Attach Socket.IO to the server (before serial port configuration)
// const io = socketIo(server, {
//     cors: {
//         origin: "*", // Allow cross-origin requests
//         methods: ["GET", "POST"]
//     }
// });

// // Open the serial port (replace with your port like 'COM3' for Windows or '/dev/ttyUSB0' for Linux/Mac)
// const port = new SerialPort({ path: '/dev/cu.usbserial-1301', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Handle data received from the serial port
// parser.on('data', (data) => {
//     let cleanData = data.toString().trim(); // Clean up the incoming data (remove any extra spaces or newlines)
//     console.log('Raw data received from serial port:', cleanData); // Log raw data

//     // Use a regex to remove non-numeric characters except for periods and minus signs (for negative numbers)
//     cleanData = cleanData.replace(/[^0-9.-]/g, '');

//     // Check if the cleaned data is a valid number-like string (allows leading zeros)
//     if (!isNaN(cleanData) && cleanData !== '') {
//         console.log(`Valid Travel Distance: ${cleanData} inches`); // Log the raw distance data
//         io.emit('travel_distance', cleanData); // Emit the raw data as a string to retain formatting
//     } else {
//         console.log('Received invalid data:', cleanData); // Log invalid data for debugging
//     }
// });

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Relay control event (optional)
//     socket.on('relay_control', (command) => {
//         console.log('Relay control command received: ', command);
//         port.write(command + '\n'); // Write the command to the serial port
//         socket.broadcast.emit('relay_control', command);
//     });

//     //Handle cut parameters (length and quantity) from the react client 
//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received: ', data);
//         port.write(JSON.stringify(data) + '\n'); // Send parameters to ESP32 as JSON string
//     });

//     parser.on('data', (line) => {
//         const status = JSON.parse(line); // Parse JSON without catch error handling
//         if (status && status.cutCount !== undefined) {
//             io.emit('cut_status', status); // Broadcast cut status
//         }
//     });

// //     //Emit cut status updates recieved from the ESP32 to all clients
// //     parser.on('data', (line) => {
// //         try {
// //             const status = JSON.parse(line);
// //             if (status && status.cutCount !== undefined) {
// //                 io.emit('cut_status', status);  // Emit cut status 
// //             }
// //         } catch (error) {
// //             console.log('Error parsing cut status:', error);
// //         }
// // });

// // Handle client disconnection (optional)
// socket.on('disconnect', () => {
//     console.log('Client disconnected: ' + socket.id);
//     });
// });

// // Start the HTTP server and listen on port 4100
// server.listen(4100, () => {
//     console.log(`Server is running on port 4100`);
// });



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

//     // Handle disconnection
//     socket.on('disconnect', () => {
//         console.log('Client disconnected: ' + socket.id);
//     });
// });

// // Start the server
// server.listen(4100, () => {
//     console.log(`Server is running on port 4100`);
// });




