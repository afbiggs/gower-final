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
const port = new SerialPort({ path: '/dev/cu.usbserial-0001', baudRate: 115200 });

// Use the ReadlineParser to handle incoming serial data
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A client connected: ' + socket.id);

    // Listen for cut parameters from the React client and send to ESP32
    socket.on('set_cut_parameters', (data) => {
        console.log('Cut parameters received:', data);
        const jsonData = JSON.stringify(data) + '\n'; // Add newline to terminate the message
        port.write(jsonData, (err) => {
            if (err) {
                console.error('Error writing to serial port:', err.message);
            } else {
                console.log('Cut parameters sent to ESP32:', jsonData);
            }
        });
    });

    socket.on("confirm_reset", (data) => {
        console.log("Confirm reset command received from client:", data);
        const resetCommand = JSON.stringify({ action: "reset" }) + "\n";
        port.write(resetCommand, (err) => {
            if (err) {
                console.error("Error writing reset command to ESP32:", err.message);
            } else {
                console.log("Reset command sent to ESP32:", resetCommand);
            }
        });
    });

    socket.on('material_forward_control', (command) => {
        console.log(`Material Forward command received: ${command}`);
        if (command === "ON" || command === "OFF") {
            io.emit('material_forward_control', { materialForward: command });
            console.log(`Material Forward command emitted to ESP32: ${command}`);
        } else {
            console.error('Invalid Material Forward command received:', command);
        }
    });

    socket.on('manual_shear_control', (command) => {
        console.log(`Manual shear received: ${command}`);
        if (command === "ON" || command === "OFF") {
            io.emit('manual_shear_control', { manualShear: command });
            console.log(`Manual Shear command emitted to ESP32: ${command}`);
        } else {
            console.error('Invalid Manual Shear command received:', command);
        }
    });

   // Handle E-Stop Command
socket.on("e_stop", () => {
    console.log("E-Stop Command Received from Client");
    const eStopCommand = JSON.stringify({ action: "eStop" }) + '\n'; // JSON format
    port.write(eStopCommand, (err) => {
        if (err) {
            console.error("Failed to send E-Stop command to ESP32:", err.message);
        } else {
            console.log("E-Stop command sent to ESP32:", eStopCommand);
        }
    });
});

// Handle Reset E-Stop Command
socket.on("reset_e_stop", () => {
    console.log("Reset E-Stop Command Received from Client");
    const resetEStopCommand = JSON.stringify({ action: "resetEStop" }) + '\n'; // JSON format
    port.write(resetEStopCommand, (err) => {
        if (err) {
            console.error("Failed to send Reset E-Stop command to ESP32:", err.message);
        } else {
            console.log("Reset E-Stop command sent to ESP32:", resetEStopCommand);
        }
    });
});


    socket.on('pause_motor', () => {
        console.log('Pause motor command received.');
        const pauseCommand = JSON.stringify({ motor: 'PAUSE' }) + '\n';
        port.write(pauseCommand, (err) => {
            if (err) {
                console.error('Error writing pause command to ESP32:', err.message);
            } else {
                console.log('Pause command sent to ESP32:', pauseCommand);
            }
        });
    });

    socket.on('resume_motor', () => {
        console.log('Resume motor command received from client');
        const resumeCommand = JSON.stringify({ motor: 'RESUME' }) + '\n';
        port.write(resumeCommand, (err) => {
            if (err) {
                console.error('Error writing resume command to ESP32:', err.message);
            } else {
                console.log('Resume command sent to ESP32:', resumeCommand);
            }
        });
    });

    socket.on('update_wheel_diameter', (data) => {
        console.log('Wheel diameter update received:', data);
        if (data && typeof data.wheelDiameter === 'number' && data.wheelDiameter > 0) {
            const command = JSON.stringify({ wheelDiameter: data.wheelDiameter }) + '\n';
            port.write(command, (err) => {
                if (err) {
                    console.error('Error writing wheel diameter to ESP32:', err.message);
                } else {
                    console.log('Wheel diameter sent to ESP32:', command);
                }
            });
        } else {
            console.error('Invalid wheel diameter data:', data);
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

    // Listen for travel distance updates from ESP32
    socket.on('travel_distance', (data) => {
        console.log('Received raw travel_distance data:', data);

        // Check if data is already an object
        if (typeof data === 'object' && data !== null) {
            // Ensure it contains 'travelDistance'
            if (data.travelDistance !== undefined) {
                console.log('Parsed travel distance:', data.travelDistance);

                // Emit the travel distance to React UI or other connected clients
                io.emit('travel_distance', { travelDistance: data.travelDistance });
            } else {
                console.warn('Received data does not include travelDistance:', data);
            }
        } else {
            console.warn('Received non-object data:', data);
        }
    });

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
// const port = new SerialPort({ path: '/dev/cu.usbserial-140', baudRate: 115200 });

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
    
//        // Forward confirm_reset to ESP32
//     socket.on("confirm_reset", (data) => {
//         console.log("Confirm reset command received from client:", data);

//         // Forward reset command to ESP32 via serial port
//         const resetCommand = JSON.stringify({ action: "reset" }) + "\n";
//         port.write(resetCommand, (err) => {
//             if (err) {
//                 console.error("Error writing reset command to ESP32:", err.message);
//             } else {
//                 console.log("Reset command sent to ESP32:", resetCommand);
//             }
//         });
//     });


//     // Listen for Material Forward Button events
// socket.on('material_forward_control', (command) => {
//     console.log(`Material Forward command received: ${command}`);

//     // Validate the command
//     if (command === "ON" || command === "OFF") {
//         // Emit the command to the ESP32 over Socket.IO
//         io.emit('material_forward_control', { materialForward: command });
//         console.log(`Material Forward command emitted to ESP32: ${command}`);
//     } else {
//         console.error('Invalid Material Forward command received:', command);
//     }
// });

//  // Listen for Material Forward Button events
//  socket.on('manual_shear_control', (command) => {
//     console.log(`Manual shear received: ${command}`);

//     // Validate the command
//     if (command === "ON" || command === "OFF") {
//         // Emit the command to the ESP32 over Socket.IO
//         io.emit('manual_shear_control', { manualShear: command });
//         console.log(`Manual Shear command emitted to ESP32: ${command}`);
//     } else {
//         console.error('Invalid Manual Shear command received:', command);
//     }
// });

// // Handle E-Stop Command
// socket.on("e_stop", () => {
//     console.log("E-Stop Command Received from Client");
//     port.write("ESTOP\n", (err) => {
//       if (err) {
//         console.error("Failed to send E-Stop command to ESP32:", err.message);
//       } else {
//         console.log("E-Stop command sent to ESP32");
//       }
//     });
//   });

//   // Handle Reset E-Stop Command
//   socket.on("reset_e_stop", () => {
//     console.log("Reset E-Stop Command Received from Client");
//     port.write("RESET_ESTOP\n", (err) => {
//       if (err) {
//         console.error("Failed to send Reset E-Stop command to ESP32:", err.message);
//       } else {
//         console.log("Reset E-Stop command sent to ESP32");
//       }
//     });
//   });


//     // // Listen for Material Forward Button events
//     // socket.on('material_forward_control', (command) => {
//     //     console.log(`Material Forward command received: ${command}`);

//     //     // Validate and send command to ESP32
//     //     if (command === "ON" || command === "OFF") {
//     //         port.write(`{"materialForward":"${command}"}\n`, (err) => {
//     //             if (err) {
//     //                 console.error('Error writing to serial port:', err.message);
//     //             } else {
//     //                 console.log(`Material Forward command sent to ESP32: ${command}`);
//     //             }
//     //         });
//     //     } else {
//     //         console.error('Invalid Material Forward command received:', command);
//     //     }
//     // });

//     socket.on('pause_motor', () => {
//         console.log('Pause motor command received.');
    
//         // Send pause command to ESP32 directly via serial port
//         const pauseCommand = JSON.stringify({ motor: 'PAUSE' }) + '\n';
//         port.write(pauseCommand, (err) => {
//             if (err) {
//                 console.error('Error writing pause command to ESP32:', err.message);
//             } else {
//                 console.log('Pause command sent to ESP32:', pauseCommand);
//             }
//         });
//     });

//     //Listen for resume_motor from the React UI client
//     socket.on('resume_motor', () => {
//         console.log('Resume motor command received from client');

//         //Send resume command directly to ESP32 through serial port 
//         const resumeCommand = JSON.stringify({motor: 'RESUME' }) + '\n';
//         port.write(resumeCommand, (err) => {
//             if (err) {
//                 console.error('Error writing resume command to ESP32:', err.message);
//             } else {
//                 console.log('Resume command sent to ESP32:', resumeCommand);
//             }
//         });
//     });

//     // Add the wheel circumference listener to the existing Socket.IO setup
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Other listeners...

//     // Listen for wheel circumference updates
//     socket.on('update_wheel_diameter', (data) => {
//         console.log('Wheel diameter update received:', data);

//         // Validate the data
//         if (data && typeof data.wheelDiameter === 'number' && data.wheelDiameter > 0) {
//             const command = JSON.stringify({ wheelDiameter: data.wheelDiameter }) + '\n';

//             // Forward the data to the ESP32 via the serial port
//             port.write(command, (err) => {
//                 if (err) {
//                     console.error('Error writing wheel diameter to ESP32:', err.message);
//                 } else {
//                     console.log('Wheel diameter sent to ESP32:', command);
//                 }
//             });
//         } else {
//             console.error('Invalid wheel diameter data:', data);
//         }
//     });

//     // Handle client disconnection
//     socket.on('disconnect', () => {
//         console.log('Client disconnected: ' + socket.id);
//     });
// });


//     // Listen for 'cut_status' from ESP32 and directly emit to React UI
//     socket.on('cut_status', (data) => {
//         if (data && data.cutCount !== undefined) {
//             console.log('Cut count received:', data);
//             io.emit('cut_status', data); // Send cut count data to React UI
//         } else {
//             console.log('Invalid data received:', data);
//         }
//     });

//     // Listen for travel distance updates from ESP32
//     socket.on('travel_distance', (data) => {
//         console.log('Received raw travel_distance data:', data);

//         // Check if data is already an object
//         if (typeof data === 'object' && data !== null) {
//             // Ensure it contains 'travelDistance'
//             if (data.travelDistance !== undefined) {
//                 console.log('Parsed travel distance:', data.travelDistance);

//                 // Emit the travel distance to React UI or other connected clients
//                 io.emit('travel_distance', { travelDistance: data.travelDistance });
//             } else {
//                 console.warn('Received data does not include travelDistance:', data);
//             }
//         } else {
//             console.warn('Received non-object data:', data);
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
