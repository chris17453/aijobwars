class GameClient {
    constructor(serverUrl, initialWidth = 800, initialHeight = 600) {
        this.serverUrl = serverUrl;
        this.client_id = null;
        this.websocket = null;
        this.isConnected = false;
        this.balls = []; // Store balls data
        this.player = { 
            name:'',
            avatar:'',
            score:0,
            client_id:0,


        }; // Key: client_id, Value: player data including avatar

        // Load player and token from cookies if available
        const playerCookie = this.getCookie('player');
        const tokenCookie = this.getCookie('token');
        if (playerCookie && tokenCookie) {
            this.player = JSON.parse(playerCookie);
            this.token = tokenCookie;
        }

        this.chatMessages = []; // Store received chat messages        
        this.screenDimensions = { width: initialWidth, height: initialHeight };  // Initial screen dimensions
        this.eventHandlers = {
            'textMessageReceived': [],
            'playerUpdateReceived': []
        };
    }

    connect() {
        let connectionAttempts = 0;
        const maxConnectionAttempts = 0;
        const connectionTimeout = 1000; // 10 seconds
        let connectionTimer;
    
        const connectWebSocket = () => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                console.log('WebSocket connection is already open.');
                return;
            }
    
            if (maxConnectionAttempts > 0 && connectionAttempts >= maxConnectionAttempts) {
                console.error('Maximum connection attempts reached. Unable to connect.');
                return;
            }
    
            // Close and nullify the existing WebSocket instance if it exists
            if (this.websocket) {
                this.websocket.onerror = null;
                this.websocket.onclose = null;
                this.websocket.close();
                this.websocket = null;
            }
    
            this.websocket = new WebSocket(this.serverUrl);
            
            this.websocket.onopen = () => {
                console.log('Connected to the server.');
                this.isConnected = true;
                // Request the client ID or any initial setup information
                this.sendMessage({type: 'requestClientId'});
                // Reset connection attempts on successful connection
                connectionAttempts = 0;
            };
    
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'client_id':
                        this.client_id = data.client_id;
                        console.log(`Client ID received: ${this.client_id}`);
                        break;
                    case 'update':
                        this.handlePositionalUpdate(data);
                        break;
                    case 'playerProfile':
                        this.handlePlayerProfileUpdate(data);
                        break;
                    case 'chatMessage':
                        this.handleChatMessage(data);
                        break;
                    case 'updateBalls':
                        // Handle update balls message
                        this. balls = data.balls;
                        console.log("Received updated balls:", this.balls);
                        break;
                    case 'heartbeat':
                        this.websocket.send(JSON.stringify({ type: 'heartbeat_ack' }));
                        break;
                    default:
                        console.log('Unknown message type:', data.type);
                }
            };
    
            this.websocket.onerror = (event) => {
                console.error('WebSocket error:', event);
                // Close and nullify the WebSocket instance
                if (this.websocket) {
                    this.websocket.onerror = null;
                    this.websocket.onclose = null;
                    this.websocket.close();
                    this.websocket = null;
                }
                // Increment connection attempts
                connectionAttempts++;
                // Attempt reconnection after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };
    
            this.websocket.onclose = () => {
                console.log('Disconnected from the server.');
                this.isConnected = false;
                // Close and nullify the WebSocket instance
                if (this.websocket) {
                    this.websocket.onerror = null;
                    this.websocket.onclose = null;
                    this.websocket.close();
                    this.websocket = null;
                }
                // Increment connection attempts
                connectionAttempts++;
                // Attempt reconnection after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };
        };
    
        // Set a timeout for initial connection attempt
        connectionTimer = setTimeout(() => {
            if (!this.isConnected) {
                console.error('Connection attempt timed out. Retrying...');
                // Close and nullify the WebSocket instance
                if (this.websocket) {
                    this.websocket.onerror = null;
                    this.websocket.onclose = null;
                    this.websocket.close();
                    this.websocket = null;
                }
                connectWebSocket();
            }
        }, connectionTimeout);
    
        // Initial connection attempt
        connectWebSocket();
    }
    
    

    // Function to set a cookie
    setCookie(name, value, expiryDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
        const cookieValue = `${name}=${value};expires=${expiryDate.toUTCString()};path=/`;
        document.cookie = cookieValue;
    }

    // Function to get a cookie value by name
    getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(cookieName)) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return null;
    }

    sendMessage(message) {
        if (this.isConnected && this.websocket) {
            this.websocket.send(JSON.stringify(message));
        //} else {
        //    console.error('Cannot send message, not connected to the server.');
        }
    }

    handlePositionalUpdate(data) {
        // Assuming data.balls is an array of ball objects
        this.balls = data.balls;
        //console.log('Positional update received and stored:', data.balls);
    }

    handlePlayerProfileUpdate(data) {
        // Assuming data.player contains the player's client_id and profile information
        this.player.name= data.playerProfile.name;
        this.player.avatar= data.playerProfile.avatar;
        this.player.score= data.playerProfile.score;
        this.player.client_id= data.playerProfile.client_id
        this.triggerEvent('playerUpdateReceived', data.playerProfile);
    }

    handleChatMessage(data) {
        // Assuming data.message contains the chat message details
        this.chatMessages.push({'text':data.text,'client_id':data.client_id,'player_name':data.player_name,'color':data.color});
        this.triggerEvent('textMessageReceived', data);
        console.log('Chat message received:', data.text);
    }

    sendChatMessage(text) {
        this.sendMessage({
            type: 'chatMessage',
            client_id: this.client_id,
            text: text
        });
    }

    on(eventType, handler) {
        if (this.eventHandlers.hasOwnProperty(eventType)) {
            this.eventHandlers[eventType].push(handler);
        } else {
            console.error(`Invalid event type: ${eventType}`);
        }
    }

    triggerEvent(eventType, eventData) {
        if (this.eventHandlers.hasOwnProperty(eventType)) {
            this.eventHandlers[eventType].forEach(handler => handler(eventData));
        } else {
            console.error(`Invalid event type: ${eventType}`);
        }
    }


    getBalls() {
        // Method to retrieve the current balls' positions
        return this.balls;
    }

    getPlayerProfile() {
        return this.player;
    }

    pushBall(vector, weight, speed) {
        this.sendMessage({
            type: 'pushBall',
            client_id: this.client_id,
            vector: vector,
            weight: weight,
            speed: speed
        });
    }

    viewportZoom(direction) {
        this.sendMessage({
            type: 'viewportZoom',
            client_id: this.client_id,
            direction: direction  // "in" for zoom in, "out" for zoom out
        });
    }

    viewportMove(direction) {
        this.sendMessage({
            type: 'viewportMove',
            client_id: this.client_id,
            direction: direction  // "left", "right", "up", or "down"
        });
    }
    

    getChatMessages() {
        return this.chatMessages;
    }    

    async sendScreenDimensions() {
        // Send screen dimensions to the server
        await this.sendMessage({ type: "screenDimensions", dimensions: this.screenDimensions });
    }    

    updateScreenDimensions(dimensions) {
        this.screenDimensions = dimensions;
        this.sendScreenDimensions();
    }
}

// Example usage:
// const gameClient = new GameClient('ws://localhost:6789');
// gameClient.connect();
