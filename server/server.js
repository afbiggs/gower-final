const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`A client connected: ${socket.id}`);

    socket.on('set_cut_parameters', (data) => {
        console.log('Cut parameters received:', data);
        io.emit('set_cut_parameters', data);
    });

    socket.on('material_forward_control', (command) => {
        console.log(`Material Forward command received: ${command}`);
        if (command === "ON" || command === "OFF") {
            io.emit('material_forward_control', { materialForward: command });
        } else {
            console.error('Invalid Material Forward command:', command);
        }
    });

    socket.on('manual_shear_control', (command) => {
        console.log(`Manual Shear command received: ${command}`);
        if (command === "ON" || command === "OFF") {
            io.emit('manual_shear_control', { manualShear: command });
        } else {
            console.error('Invalid Manual Shear command:', command);
        }
    });

    socket.on('pause_motor', () => {
        console.log('Pause motor command received.');
        io.emit("motor_command", { motor: "PAUSE" });
    });

    socket.on('resume_motor', () => {
        console.log('Resume motor command received.');
        io.emit("motor_command", { motor: "RESUME" });
    });

    socket.on('e_stop', () => {
        console.log('E-Stop command received.');
        io.emit('e_stop');
    });

    socket.on('reset_e_stop', () => {
        console.log('Reset E-Stop command received.');
        io.emit('reset_e_stop');
    });

    socket.on('update_calibration', (data) => {
        if (
            data &&
            data.calibration &&
            typeof data.calibration.wheelDiameter === 'number' &&
            data.calibration.wheelDiameter > 0 &&
            typeof data.calibration.shearDelay === 'number' &&
            data.calibration.shearDelay > 0
        ) {
            io.emit('update_calibration', { calibration: data.calibration });
            console.log('Calibration updated:', data.calibration);
        } else {
            console.error('Invalid calibration data:', data);
        }
    });
    
    

    // socket.on('update_wheel_diameter', (data) => {
    //     if (data && typeof data.wheelDiameter === 'number' && data.wheelDiameter > 0) {
    //         io.emit('update_wheel_diameter', { wheelDiameter: data.wheelDiameter });
    //     } else {
    //         console.error('Invalid wheel diameter data:', data);
    //     }
    // });

    // socket.on('update_shear_delay', (data) => {
    //     if (data && typeof data.shearDelay === 'number' && data.shearDelay > 0) {
    //         io.emit('update_shear_delay', { shearDelay: data.shearDelay });
    //     } else {
    //         console.error('Invalid shear delay data:', data);
    //     }
    // });

    socket.on('confirm_reset', () => {
        console.log('Confirm reset command received.');
        io.emit('confirm_reset');
    });

    socket.on("cut_status_update", (data) => {
        console.log("Cut status update received:", data);
    
        if (data.inputQuantity !== undefined) {
            inputQuantity = data.inputQuantity; // Update inputQuantity from ESP32
    
            if (inputQuantity > 0) {
                console.log(`Cut completed. Remaining quantity: ${inputQuantity}`);
            }
    
            if (inputQuantity === 0) {
                io.emit("cutting_completed", { 
                    cutCount: data.cutCount || 0, 
                    cutCycleTime: data.cutCycleTime || null 
                });
                console.log("Cutting process completed.");
            }
        }
    });

    // socket.on('cut_status', (data) => {
    //     console.log('Cut status received:', data);
    
    //     // Broadcast the current cut status to all clients
    //     io.emit('cut_status', data);
    
    //     // Check if inputQuantity exists and has reached zero
    //     if (data.inputQuantity !== undefined && data.inputQuantity === 0) {
    //         io.emit('cutting_completed', {
    //             cutCount: data.cutCount || 0, // Include total cuts completed
    //             cutCycleTime: data.cutCycleTime || null, // Optional: Include total cycle time if available
    //         });
    //         console.log('Cutting process completed. Notifying frontend...');
    //     }
    // });

    // socket.on('cut_status', (data) => {
    //     console.log('Cut status received:', data);
    //     io.emit('cut_status', data);
    // });

    socket.on('travel_distance', (data) => {
        console.log('Travel distance received:', data);
        io.emit('travel_distance', data);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

server.listen(4300, () => {
    console.log('Server is running on port 4300');
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
// const port = new SerialPort({ path: '/dev/cu.usbserial-0001', baudRate: 115200 });

// // Use the ReadlineParser to handle incoming serial data
// const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// // Listen for Socket.IO connections
// io.on('connection', (socket) => {
//     console.log('A client connected: ' + socket.id);

//     // Listen for cut parameters from the React client and send to ESP32
//     socket.on('set_cut_parameters', (data) => {
//         console.log('Cut parameters received:', data);
//         const jsonData = JSON.stringify(data) + '\n'; // Add newline to terminate the message
//         io.emit(jsonData, (err) => {
//             if (err) {
//                 console.error('Error writing to serial port:', err.message);
//             } else {
//                 console.log('Cut parameters sent to ESP32:', jsonData);
//             }
//         });
//     });

//     socket.on("confirm_reset", (data) => {
//         console.log("Confirm reset command received from client:", data);
//         const resetCommand = JSON.stringify({ action: "reset" }) + "\n";
//         io.emit(resetCommand, (err) => {
//             if (err) {
//                 console.error("Error writing reset command to ESP32:", err.message);
//             } else {
//                 console.log("Reset command sent to ESP32:", resetCommand);
//             }
//         });
//     });

//     socket.on('material_forward_control', (command) => {
//         console.log(`Material Forward command received: ${command}`);
//         if (command === "ON" || command === "OFF") {
//             io.emit('material_forward_control', { materialForward: command });
//             console.log(`Material Forward command emitted to ESP32: ${command}`);
//         } else {
//             console.error('Invalid Material Forward command received:', command);
//         }
//     });

//     socket.on('manual_shear_control', (command) => {
//         console.log(`Manual shear received: ${command}`);
//         if (command === "ON" || command === "OFF") {
//             io.emit('manual_shear_control', { manualShear: command });
//             console.log(`Manual Shear command emitted to ESP32: ${command}`);
//         } else {
//             console.error('Invalid Manual Shear command received:', command);
//         }
//     });

//    // Handle E-Stop Command
// socket.on("e_stop", () => {
//     console.log("E-Stop Command Received from Client");
//     const eStopCommand = JSON.stringify({ action: "eStop" }) + '\n'; // JSON format
//     io.emit(eStopCommand, (err) => {
//         if (err) {
//             console.error("Failed to send E-Stop command to ESP32:", err.message);
//         } else {
//             console.log("E-Stop command sent to ESP32:", eStopCommand);
//         }
//     });
// });

// // Handle Reset E-Stop Command
// socket.on("reset_e_stop", () => {
//     console.log("Reset E-Stop Command Received from Client");
//     const resetEStopCommand = JSON.stringify({ action: "resetEStop" }) + '\n'; // JSON format
//     io.emit(resetEStopCommand, (err) => {
//         if (err) {
//             console.error("Failed to send Reset E-Stop command to ESP32:", err.message);
//         } else {
//             console.log("Reset E-Stop command sent to ESP32:", resetEStopCommand);
//         }
//     });
// });


//     socket.on('pause_motor', () => {
//         console.log('Pause motor command received.');
//         const pauseCommand = JSON.stringify("motor_command", { motor: "PAUSE" }); + '\n';
//         io.emit(pauseCommand, (err) => {
//             if (err) {
//                 console.error('Error writing pause command to ESP32:', err.message);
//             } else {
//                 console.log('Pause command sent to ESP32:', pauseCommand);
//             }
//         });
//     });

//     socket.on('resume_motor', () => {
//         console.log('Resume motor command received from client');
//         const resumeCommand = JSON.stringify("motor_command", { motor: "RESUME" }); + '\n';
//         io.emit(resumeCommand, (err) => {
//             if (err) {
//                 console.error('Error writing resume command to ESP32:', err.message);
//             } else {
//                 console.log('Resume command sent to ESP32:', resumeCommand);
//             }
//         });
//     });

//     socket.on('update_wheel_diameter', (data) => {
//         console.log('Wheel diameter update received:', data);
//         if (data && typeof data.wheelDiameter === 'number' && data.wheelDiameter > 0) {
//             const command = JSON.stringify({ wheelDiameter: data.wheelDiameter }) + '\n';
//             io.emit(command, (err) => {
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

//     socket.on('disconnect', () => {
//         console.log('Client disconnected: ' + socket.id);
//     });
// });

// // Start the HTTP server
// server.listen(4300, () => {
//     console.log(`Server is running on port 4300`);
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
//         io.emit(jsonData, (err) => {
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
//         io.emit(resetCommand, (err) => {
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
//     io.emit("ESTOP\n", (err) => {
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
//     io.emit("RESET_ESTOP\n", (err) => {
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
//     //         io.emit(`{"materialForward":"${command}"}\n`, (err) => {
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
//         io.emit(pauseCommand, (err) => {
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
//         io.emit(resumeCommand, (err) => {
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
//             io.emit(command, (err) => {
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
