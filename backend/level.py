import json
import random

def load_level(filename):
    with open(filename, 'r') as f:
        return json.load(f)


def save_level_to_json(level_data, json_filename):
    with open(json_filename, 'w') as f:
        json.dump(level_data, f)



def make_level(filename, width, height, pages, background="BG_URL.png", speed=10, ship="player", level="Level Name", track="track.mp3"):
    # Generating a simple level design for a 2D scroller game
    derbis=['p', # pdf
            'e', # email
            'c', # phone call
            'w', # webex
            't', # teams
            'z', # zoom
            ]

    # Level design with player (P), enemies (E), and obstacles (O)
    level_design = []
    # Top row (sky)
    rows=[]
    for page in range(pages):
        for _ in range(height-3):  # Adjusted to leave space for last 3 lines
            enemies = random.randint(0, 3)
            row = "." + " " * (width - enemies) +"."
            for _ in range(enemies):
                position = random.randint(0, width)
                new_char = derbis[random.randint(0, len(derbis) - 1)]
                row = row[:position] + new_char + row[position:]
            rows.append(row)

        # Adding 3 empty lines
        for _ in range(3):
            rows.append("." + " " * (width) + ".")

        # Add player character ('P') in the middle of the last row of each page
        last_row_index = len(rows)-1
        last_row = list(rows[last_row_index])
        middle_index = width // 2
        last_row[middle_index] = 'P'
        rows[last_row_index] = ''.join(last_row)

    # Saving to a text file
    with open(filename, "w") as file:
        # Writing additional information to the file
        file.write(f"Name: {level}\n")
        file.write(f"Columns: {width}\n")
        file.write(f"Height: {height}\n")
        file.write(f"Pages: {pages}\n")
        file.write(f"Rows: {len(rows)}\n")
        file.write(f"Music: {track}\n")
        file.write(f"Background: {background}\n")
        file.write(f"Speed: {speed}\n")
        file.write(f"Ship: {ship}\n")
        file.write("-----\n")

        for row in rows:
            file.write(row + "\n")



def load_level(filename):
    level_data = {}
    rows = []

    with open(filename, "r") as file:
        lines = file.readlines()

        # Extracting additional information
        for line in lines:
            if line.strip() == "-----":
                break
            key, value = line.strip().split(": ")
            level_data[key.lower()] = value  # Convert key to lowercase
          
        # Extracting level design
        for line in lines[len(level_data) + 1:]:
            rows.append(line.strip())
        level_data['level']=rows
    return level_data

level="html/static/levels/level.txt"
json_file="html/static/levels/level.json"
make_level(level,40,25,10, background="static/scene/space1.png", speed=10, ship="player", level="Get Linked", track="static/audio/cliploop.mp3")
data=load_level(level)
save_level_to_json(data,json_file)

