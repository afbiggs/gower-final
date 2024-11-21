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
const port = new SerialPort({ path: '/dev/cu.usbserial-2140', baudRate: 115200 });

// Use the ReadlineParser to handle incoming serial data
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A client connected: ' + socket.id);

    // Listen for cut parameters from the React client and send to ESP32
    socket.on('set_cut_parameters', (data) => {
        console.log('Cut parameters received:', data);
    
        // Send parameters as JSON string to the ESP32
        const jsonData = JSON.stringify(data) + '\n'; // Add newline to terminate the message
        port.write(jsonData, (err) => {
            if (err) {
                console.error('Error writing to serial port:', err.message);
            } else {
                console.log('Cut parameters sent to ESP32:', jsonData);
            }
        });
    });

    // Listen for Material Forward Button events
    socket.on('material_forward_control', (command) => {
        console.log(`Material Forward command received: ${command}`);

        // Validate and send command to ESP32
        if (command === "ON" || command === "OFF") {
            port.write(`{"materialForward":"${command}"}\n`, (err) => {
                if (err) {
                    console.error('Error writing to serial port:', err.message);
                } else {
                    console.log(`Material Forward command sent to ESP32: ${command}`);
                }
            });
        } else {
            console.error('Invalid Material Forward command received:', command);
        }
    });

    // Listen for Manual Shear Button events
    socket.on('manual_shear_control', (command) => {
        console.log(`Manual Shear command received: ${command}`);

        // Validate and send command to ESP32
        if (command === "ON" || command === "OFF") {
            port.write(`{"manualShear":"${command}"}\n`, (err) => {
                if (err) {
                    console.error('Error writing to serial port:', err.message);
                } else {
                    console.log(`Manual Shear command sent to ESP32: ${command}`);
                }
            });
        } else {
            console.error('Invalid Manual Shear command received:', command);
        }
    });

    // Listen for 'cut_status' from ESP32 and directly emit to React UI
    socket.on('cut_status', (data) => {
        if (data && data.cutCount !== undefined) {
            console.log('Cut count received:', data);
            io.emit('cut_status', data); // Send cut count data to React UI
        } else {
            console.log('Invalid data received:', data);
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

// Start the HTTP server
server.listen(4300, () => {
    console.log(`Server is running on port 4300`);
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
// const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Listen for cut parameters from the React client and send to ESP32

//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received:', data);
    
//         // Send parameters as JSON string to the ESP32
//         const jsonData = JSON.stringify(data) + '\n'; // Add newline to terminate the message
//         port.write(jsonData, (err) => {
//             if (err) {
//                 console.error('Error writing to serial port:', err.message);
//             } else {
//                 console.log('Cut parameters sent to ESP32:', jsonData);
//             }
//         });
//     });
    
    

//     // socket.on('set_cut_parameters', (data) => {
//     //     console.log('Cut parameters received:', data);
//     //     port.write(JSON.stringify(data) + '\n'); // Send parameters as JSON to ESP32
//     // });

//     // Listen for 'cut_status' from ESP32 and directly emit to React UI
//     socket.on('cut_status', (data) => {
//         // `data` is already an object; no need for JSON.parse
//         if (data && data.cutCount !== undefined) {
//             console.log('Cut count received:', data);
//             io.emit('cut_status', data); // Send cut count data to React UI
//         } else {
//             console.log('Invalid data received:', data);
//         }
//     });

//     // Handle client disconnection
//     socket.on('disconnect', () => {
//         console.log('Client disconnected: ' + socket.id);
//     });
// });

// // Start the HTTP server
// server.listen(4300, () => {
//     console.log(`Server is running on port 4300`);
// });










// // Import required libraries
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

// // Open the serial port (adjust the path as needed)
// const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Handle incoming data from ESP32
// parser.on('data', (data) => {
//     let cleanData = data.toString().trim();
//     console.log('Received from ESP32:', cleanData);

//     if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
//         try {
//             const parsedData = JSON.parse(cleanData);
//             if (parsedData.cutCount !== undefined) {
//                 io.emit('cut_status', parsedData); // Send to all clients
//                 console.log('Emitted cut_status:', parsedData);
//             }
//         } catch (error) {
//             console.log('Error parsing JSON:', error.message, 'Data received:', cleanData);
//         }
//     } else {
//         console.log('Non-JSON data received:', cleanData);
//     }
// });


// // parser.on('data', (data) => {
// //     let cleanData = data.toString().trim();
// //     console.log('Received from ESP32:', cleanData);

// //     // Attempt to parse JSON data only if it's a valid JSON object
// //     if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
// //         try {
// //             const parsedData = JSON.parse(cleanData);
// //             if (parsedData.cutCount !== undefined) {
// //                 console.log('Cut count parsed successfully:', parsedData.cutCount);
// //                 io.emit('cut_status', { cutCount: parsedData.cutCount }); // Send cut count to all clients
// //             } else {
// //                 console.warn('Received valid JSON but no cutCount key:', parsedData);
// //             }
// //         } catch (error) {
// //             console.error('Error parsing JSON:', error.message, 'Data received:', cleanData);
// //         }
// //     } else {
// //         console.log('Non-JSON data received:', cleanData);
// //     }
// // });

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Listen for cut parameters from the React client and forward to ESP32
//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received from UI:', data);

//         // Properly structure and forward the JSON data to the ESP32
//         const cutParameters = {
//             cutLength: data.cutLength,
//             cutQuantity: data.cutQuantity
//         };

//         const jsonString = JSON.stringify(cutParameters);

//         port.write(jsonString + '\n', (err) => {
//             if (err) {
//                 console.error('Error writing to serial port:', err.message);
//             } else {
//                 console.log('Cut parameters sent to ESP32:', jsonString);
//             }
//         });
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





// // Import required libraries
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

// // Open the serial port (adjust the path as needed)
// const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Handle incoming data from ESP32
// parser.on('data', (data) => {
//     let cleanData = data.toString().trim();
//     console.log('Received from ESP32:', cleanData);

//     // Attempt to parse JSON data only if it's a valid JSON object
//     if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
//         try {
//             const parsedData = JSON.parse(cleanData);
//             if (parsedData.cutCount !== undefined) {
//                 io.emit('cut_status', parsedData); // Send to all clients
//             }
//         } catch (error) {
//             console.log('Error parsing JSON:', error.message, 'Data received:', cleanData);
//         }
//     } else {
//         console.log('Non-JSON data received:', cleanData);
//     }
// });

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Listen for cut parameters from the React client and forward to ESP32
//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received from UI:', data);

//         // Properly structure and forward the JSON data to the ESP32
//         const cutParameters = {
//             cutLength: data.cutLength,
//             cutQuantity: data.cutQuantity
//         };

//         const jsonString = JSON.stringify(cutParameters);

//         port.write(jsonString + '\n', (err) => {
//             if (err) {
//                 console.error('Error writing to serial port:', err.message);
//             } else {
//                 console.log('Cut parameters sent to ESP32:', jsonString);
//             }
//         });
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






// // Import required libraries
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

// // Open the serial port (adjust the path as needed)
// const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Handle incoming data from ESP32
// parser.on('data', (data) => {
//     let cleanData = data.toString().trim();
//     console.log('Received from ESP32:', cleanData);

//     // Attempt to parse JSON data only if it's a valid JSON object
//     if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
//         try {
//             const parsedData = JSON.parse(cleanData);
//             if (parsedData.cutCount !== undefined) {
//                 io.emit('cut_status', parsedData); // Send to all clients
//             }
//         } catch (error) {
//             console.log('Error parsing JSON:', error, 'Data received:', cleanData);
//         }
//     } else {
//         console.log('Non-JSON data received:', cleanData);
//     }
// });

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);


//     // Listen for cut parameters from the React client and forward to ESP32
// socket.on('set_cut_parameters', (data) => {
//     console.log('Cut parameters received from UI:', data);

//     // Properly structure and forward the JSON data to the ESP32
//     const cutParameters = {
//         cutLength: data.cutLength,
//         cutQuantity: data.cutQuantity
//     };

//     const jsonString = JSON.stringify(cutParameters);
//     port.write(jsonString + '\n'); // Send JSON string to ESP32 over the serial port

//     console.log('Cut parameters sent to ESP32:', jsonString);
// });


// //     // Listen for cut parameters from the React client
// // socket.on('set_cut_parameters', (data) => {
// //     console.log('Cut parameters received from UI:', data);

// //     // Map React keys to ESP32 keys
// //     const jsonData = {
// //         cutLength: data.inputLength, // Map inputLength to cutLength
// //         cutQuantity: data.inputQuantity // Map inputQuantity to cutQuantity
// //     };

// //     // Write JSON data to the ESP32 over the serial port
// //     port.write(JSON.stringify(jsonData) + '\n', (err) => {
// //         if (err) {
// //             console.error('Error writing to serial port:', err.message);
// //         } else {
// //             console.log('Cut parameters sent to ESP32:', jsonData);
// //         }
// //     });
// // });

//     // Handle cut status received from ESP32
//     socket.on('cut_status', (data) => {
//         console.log('Cut status received from ESP32:', data);
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








// // Import required libraries
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

// // Open the serial port (adjust the path as needed)
// const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Handle data received from ESP32
// parser.on('data', (data) => {
//     let cleanData = data.toString().trim();
//     console.log('Received from ESP32:', cleanData);

//     // Attempt to parse JSON data only if it's a valid JSON object
//     if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
//         try {
//             const parsedData = JSON.parse(cleanData);
//             if (parsedData.cutCount !== undefined) {
//                 console.log('Cut status received from ESP32:', parsedData);
//                 // Emit the data to React UI
//                 io.emit('cut_status', { cutCount: parsedData.cutCount });
//             }
//         } catch (error) {
//             console.log('Error parsing JSON:', error.message, 'Data received:', cleanData);
//         }
//     } else {
//         console.log('Non-JSON data received:', cleanData);
//     }
// });

// // parser.on('data', (data) => {
// //     let cleanData = data.toString().trim();
// //     console.log('Received from ESP32:', cleanData);

// //     // Attempt to parse JSON data only if it's a valid JSON object
// //     if (cleanData.startsWith('{') && cleanData.endsWith('}')) {
// //         try {
// //             const parsedData = JSON.parse(cleanData);
// //             if (parsedData.cutCount !== undefined) {
// //                 io.emit('cut_status', parsedData); // Send to all clients
// //             }
// //         } catch (error) {
// //             console.log('Error parsing JSON:', error, 'Data received:', cleanData);
// //         }
// //     } else {
// //         console.log('Non-JSON data received:', cleanData);
// //     }
// // });

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Listen for cut parameters from the React client and forward to ESP32
//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received from UI:', data);
//         port.write(JSON.stringify(data) + '\n'); // Send parameters as JSON to ESP32
//     });

//     socket.on('cut_status', (data) => {
//         console.log('Cut status received from ESP32:', data);
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
// const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

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
//     const cleanData = data.toString().trim();
//     console.log('Raw data received from serial port:', cleanData);

//     // Ignore non-JSON messages
//     if (!cleanData.startsWith('{') && !cleanData.startsWith('[')) {
//         console.log('Ignored non-JSON data:', cleanData);
//         return;
//     }

//     const parsedData = safeJsonParse(cleanData);

//     // Check if parsed data contains expected properties
//     if (parsedData && parsedData.cutCount !== undefined) {
//         console.log('Valid cut data received:', parsedData);
//         io.emit('cut_status', parsedData); // Emit parsed cut count to all clients
//     } else {
//         console.log('Received valid JSON but without expected properties:', parsedData);
//     }
// });

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Listen for cut parameters (length and quantity) from the React client
//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received:', data);

//         // Send parameters as JSON to ESP32
//         const jsonData = JSON.stringify(data) + '\n';
//         port.write(jsonData);
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
// const port = new SerialPort({ path: '/dev/cu.usbserial-1401', baudRate: 115200 });

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

// // Function to handle cut parameters and other communication with ESP32
// function handleCutParameters(socket, data) {
//     console.log('Sending cut parameters to ESP32:', data);
//     const jsonData = JSON.stringify(data) + '\n';
//     port.write(jsonData);  // Send parameters as JSON to ESP32
// }

// // Handle incoming data from the serial port
// parser.on('data', (data) => {
//     let cleanData = data.toString().trim(); // Clean up the incoming data
//     console.log('Raw data received from serial port:', cleanData);

//     // Ignore non-JSON debug messages from Socket.IO (e.g., those that start with [SIoC])
//     if (cleanData.startsWith('[SIoC]') || !cleanData.startsWith('{') && !cleanData.startsWith('[')) {
//         console.log('Ignored non-JSON data:', cleanData);
//         return;
//     }

//     const parsedData = safeJsonParse(cleanData);

//    // Check if parsed data contains expected properties and emit to clients
//    if (parsedData && parsedData.cutCount !== undefined) {
//     console.log('Valid cut data received:', parsedData);
//     io.emit('cut_status', parsedData); // Emit parsed data to clients
// } else {
//     console.log('Received valid JSON but without expected properties:', parsedData);
// }
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




