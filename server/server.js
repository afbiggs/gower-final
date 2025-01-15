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

