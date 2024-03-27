import asyncio
import json
import random
import websockets
import math
from .data import ServerData, ClientData, Viewport, Ball

# Instantiate the server data
server_data = ServerData()

async def handle_client(websocket: websockets.WebSocketServerProtocol, path: str):
    print(f"New client connected: {websocket.remote_address}")
    client_id = server_data.get_unique_client_id()
    color=server_data.get_next_color()
    viewport = Viewport(0, 0, 800, 600)
    client_data = ClientData(websocket, viewport, client_id,color)
    server_data.clients[websocket] = client_data
    generate_balls(client_data)

    await send_player_profile(websocket, client_data)

    heartbeat_task = asyncio.create_task(heartbeat(websocket))

    try:

        async for message in websocket:
            data = json.loads(message)
            await handle_message(websocket, data)
    except websockets.exceptions.ConnectionClosed:
        pass  # This will handle normal disconnections and heartbeat-induced ones.
    finally:
        # Handle cleanup after disconnection or heartbeat failure
        print(f"Client disconnected: {websocket.remote_address}")
        await fade_out_balls(client_data)
        del server_data.clients[websocket]
        if not heartbeat_task.done():
            heartbeat_task.cancel()
        try:
            await heartbeat_task  # Ensure any remaining cleanup in the heartbeat task is completed.
        except asyncio.CancelledError:
            pass  # The task was cancelled, ignore this exception.


async def send_player_profile(websocket: websockets.WebSocketServerProtocol, client_data: ClientData):
    # Send initial configuration data to the client
    player_profile = {
        "client_id": client_data.client_id,
        "name": client_data.player_name,  # Include player name in the initial config
        "avatar": client_data.avatar,  # Include player name in the initial config
        "score": client_data.score  ,# Include player name in the initial config
        # Add other player information if needed
    }
    await send_message(websocket, {"type": "playerProfile", "playerProfile": player_profile})


def generate_balls(client_data):
    print("Generating Balls")
    # Generate 10 balls for the client
    
    client_color = client_data.color

    balls = []
    for _ in range(10):
        position = (random.randint(0, 800), random.randint(0, 600))
        radius = random.randint(10, 20)
        velocity = (random.uniform(-1, 1), random.uniform(-1, 1))
        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        ball = Ball(position, radius, velocity, client_color, client_data.client_id)
        balls.append(ball)
    server_data.balls.extend(balls)

async def handle_message(websocket: websockets.WebSocketServerProtocol, data: dict):
    # Handle messages from clients
    client_data = server_data.clients.get(websocket)
    if not client_data:
        print("Unknown client")
        return
    
    message_type = data.get("type")
    if message_type == "requestClientId":
        # Send client ID to the client
        await send_message(websocket, {"type": "client_id", "client_id": client_data.client_id})
    elif message_type == "pushBall":
        # Example: Handling a ball push request
        # Extract ball data from the message and update the server data
        # For now, let's just print the received message
        print("Ball push request:", data)
    elif message_type == "viewportZoom":
        # Example: Handling viewport zoom request
        # Adjust viewport zoom level based on the direction
        # For now, let's just print the received message
        print("Viewport zoom request:", data)
    elif message_type == "viewportMove":
        # Example: Handling viewport move request
        # Adjust viewport position based on the direction
        # For now, let's just print the received message
        print("Viewport move request:", data)
 
    elif message_type == "chatMessage":
        # Assuming the message payload contains 'text' and 'playerName' fields
        message_text = data.get("text")
        player_name = client_data.player_name  # Retrieve the player's name from client_data
        client_id=client_data.client_id
        color=client_data.color
        # Broadcast the message to all connected clients
        await broadcast_message(color,client_id,player_name,message_text)
    
    elif message_type == "screenDimensions":
        # Update viewport dimensions based on screen dimensions from the client
        screen_dimensions = data.get("dimensions")
        if screen_dimensions:
            client_data.viewport.update_dimensions(screen_dimensions["width"], screen_dimensions["height"])
            print("Viewport dimensions updated:", client_data.viewport.get_dimensions())
        else:
            print("Invalid screen dimensions data")
    elif message_type == "heartbeat_ack":
        pass
    else:
        print("Unknown message type")

# Function to broadcast a message to all connected clients
async def broadcast_message(color,client_id:int,player_name:str,message: str):
    for client in server_data.clients.values():
        await send_message(client.websocket, {"type": "chatMessage", 'color':color,'client_id':client_id,'player_name':player_name, "text": message})

async def send_message(websocket: websockets.WebSocketServerProtocol, data: dict):
    # Check if the WebSocket connection is still open
    if websocket.open:
        # Send message to client
        try:
            await websocket.send(json.dumps(data))
        except Exception as e:
            print(f"Error sending message to client: {e}")
            # Close the WebSocket connection if sending the message fails
            await websocket.close()

async def send_ball_update(websocket: websockets.WebSocketServerProtocol):
    # Send ball update message to client
    balls_data = [{"position": ball.position, "radius": ball.radius, "velocity": ball.velocity, "color": ball.color, "owner_id": ball.owner_id} for ball in server_data.balls]
    await send_message(websocket, {"type": "updateBalls", "balls": balls_data})


async def fade_out_balls(client_data: ClientData):
    for ball in server_data.balls:
        if ball.owner_id == client_data.client_id:
            ball.fading = True
            ball.fade_start_time = asyncio.get_event_loop().time()

async def update_ball_positions():
    while True:
        # Update ball positions
        for i in range(len(server_data.balls)):
            ball = server_data.balls[i]
            # Update ball position based on velocity
            ball.position = (ball.position[0] + ball.velocity[0], ball.position[1] + ball.velocity[1])
            
            # Check collision with world boundaries
            if ball.position[0] - ball.radius <= 0 or ball.position[0] + ball.radius >= server_data.canvas_size[0]:
                ball.velocity = (-ball.velocity[0], ball.velocity[1])  # Reverse x-velocity
            if ball.position[1] - ball.radius <= 0 or ball.position[1] + ball.radius >= server_data.canvas_size[1]:
                ball.velocity = (ball.velocity[0], -ball.velocity[1])  # Reverse y-velocity
            
            # Check collision with other balls
            for j in range(len(server_data.balls)):
                if i != j:
                    other_ball = server_data.balls[j]
                    distance = math.sqrt((ball.position[0] - other_ball.position[0]) ** 2 + (ball.position[1] - other_ball.position[1]) ** 2)
                    if distance <= ball.radius + other_ball.radius:
                        # Collision detected, update velocities (simplified elastic collision)
                        angle = math.atan2(other_ball.position[1] - ball.position[1], other_ball.position[0] - ball.position[0])
                        ball.velocity = (ball.velocity[0] + math.cos(angle), ball.velocity[1] + math.sin(angle))
                        other_ball.velocity = (other_ball.velocity[0] - math.cos(angle), other_ball.velocity[1] - math.sin(angle))
        
        # Send ball positions to clients
        for client_data in server_data.clients.values():
#            print(f"Sending update to {client_data.client_id}")
            await send_message(client_data.websocket, {"type": "update", "balls": [ball.__dict__ for ball in server_data.balls]})
        
        # Wait for 100ms before sending the next update
        await asyncio.sleep(0.1)


async def heartbeat(websocket: websockets.WebSocketServerProtocol):
    while True:
        if websocket.open:
            # Send a ping or heartbeat message to client
            try:
                await websocket.send(json.dumps({"type": "heartbeat"}))
            except Exception as e:
                print(f"Error sending heartbeat: {e}")
                break
        else:
            break
        await asyncio.sleep(1)  # Wait for some time before sending the next heartbeat

async def process_fading_balls():
    while True:
        current_time = asyncio.get_event_loop().time()
        for ball in server_data.balls:
            if ball.fading:
                # Calculate how much time has passed since the fade started
                time_passed = current_time - ball.fade_start_time
                # If the ball is fading, gradually decrease its color
                if time_passed < 5:
                    # Decrease color values by a factor of the time passed, for example
                    decrease_factor = int(255 * (time_passed / 5))
                    new_color = max(0, ball.color[0] - decrease_factor), max(0, ball.color[1] - decrease_factor), max(0, ball.color[2] - decrease_factor)
                    ball.color = new_color
                else:
                    # If 5 seconds have passed, ensure the ball is black
                    ball.color = (0, 0, 0)
        # Remove balls that have turned black
        server_data.balls = [ball for ball in server_data.balls if ball.color != (0, 0, 0)]
        
        await asyncio.sleep(.1)  # Check every second


async def start_server():
    async with websockets.serve(handle_client, "localhost", 6789):
        print("WebSocket server started")
       # Start the task to update ball positions and send updates to clients
        asyncio.create_task(update_ball_positions())
        asyncio.create_task(process_fading_balls())

                
        await asyncio.Future()  # Wait forever


if __name__=="__main__":
    # Start the WebSocket server
    asyncio.run(start_server())
