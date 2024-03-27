
import random 
from typing import Dict, List, Tuple
from websockets import WebSocketServerProtocol

class Ball:
    def __init__(self, position: Tuple[int, int], radius: int, velocity: Tuple[float, float], color: Tuple[int, int, int], owner_id: int):
        self.position = position  # (x, y) coordinates
        self.radius = radius
        self.velocity = velocity  # (velocity_x, velocity_y)
        self.color = color  # RGB color tuple (R, G, B)
        self.owner_id = owner_id  # Unique identifier for the ball's owner
        self.fading = False
        self.fade_start_time=None


class Viewport:
    def __init__(self, top: int, left: int, right: int, bottom: int):
        self.top = top
        self.left = left
        self.right = right
        self.bottom = bottom

    def update_dimensions(self, width: int, height: int):
        # Update the viewport dimensions
        self.right = self.left + width
        self.bottom = self.top + height
    
    def get_dimensions(self) -> Tuple[int, int, int, int]:

        # Return the dimensions of the viewport
        return self.top, self.left, self.right, self.bottom        
    def within_bounds(self, position: Tuple[int, int]) -> bool:
        x, y = position
        return self.left <= x <= self.right and self.top <= y <= self.bottom

class ClientData:
    def __init__(self, websocket: WebSocketServerProtocol, viewport: Viewport, client_id: int,color:int,player_name=None):
        self.websocket = websocket
        self.viewport = viewport  # The client's current viewport
        self.client_id = client_id  # The client's ID
        self.color = color
        self.player_name = player_name or  self.generate_random_name()
        self.email = None
        self.score = None
        avatar=random.randint(1,5)
        self.avatar= f"static/avatars/avatar{avatar}.png"

    def generate_random_name(self):
        prefixes = ["Shadow", "Mighty", "Daring", "Ancient", "Crimson", "Eternal", "Glorious", "Fierce", "Legendary", "Mystic"]
        infixes = ["Dragon", "Wolf", "Pheonix", "Lion", "Tiger", "Hawk", "Eagle", "Serpent", "Fox", "Bear"]
        suffixes = ["Warrior", "Mage", "Ranger", "Sorcerer", "Protector", "Assassin", "Hunter", "Knight", "Shaman", "Rogue"]
        parts=[prefixes,infixes,suffixes]
        return ''.join(random.choice(part) for part in parts)        
    

class ServerData:
    def __init__(self):
        self.clients: Dict[WebSocketServerProtocol, ClientData] = {}  # Maps WebSocket connections to client data
        self.canvas_size: Tuple[int, int] = (800, 600)  # Initial canvas size (width, height)
        self.balls: List[Ball] = []  # List of all balls in the game
        self.next_ball_id: int = 0  # To assign unique IDs to balls
        self.next_client_id: int = 1  # Start client IDs at 1

        # Example colors (You might want to have a larger, more diverse set)
        self.colors = [
                (255, 0, 0),       # Red
                (0, 255, 0),       # Lime
                (0, 0, 255),       # Blue
                (255, 255, 0),     # Yellow
                (0, 255, 255),     # Cyan / Aqua
                (255, 0, 255),     # Magenta / Fuchsia
                (192, 192, 192),   # Silver
                (128, 0, 0),       # Maroon
                (128, 128, 0),     # Olive
                (0, 128, 0),       # Green
                (128, 0, 128),     # Purple
                (0, 128, 128),     # Teal
                (0, 0, 128),       # Navy
                (255, 165, 0),     # Orange
                (255, 105, 180),   # Hot Pink
                (75, 0, 130),      # Indigo
                (240, 128, 128),   # Light Coral
                (72, 209, 204),    # Medium Turquoise
                (147, 112, 219),   # Medium Purple
                (255, 192, 203),   # Pink
                (154, 205, 50),    # Yellow Green
                (255, 215, 0),     # Gold
                (0, 191, 255),     # Deep Sky Blue
                (218, 165, 32),    # Golden Rod
                (64, 224, 208)     # Turquoise
            ]
        self.color_index = 0

    def get_next_color(self):
        color = self.colors[self.color_index % len(self.colors)]
        self.color_index += 1
        return color
    
    def get_unique_client_id(self) -> int:
        """
        Returns a unique client ID and increments the internal counter.
        """
        client_id = self.next_client_id
        self.next_client_id += 1
        return client_id        

   