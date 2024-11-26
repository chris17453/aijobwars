import random
import json

import os



# Define the function for generating a random fantasy-themed name
def generate_random_fantasy_name():
    prefixes = ["Shadow", "Mighty", "Daring", "Ancient", "Crimson", "Eternal", "Glorious", "Fierce", "Legendary", "Mystic"]
    infixes = ["Dragon", "Wolf", "Phoenix", "Lion", "Tiger", "Hawk", "Eagle", "Serpent", "Fox", "Bear"]
    suffixes = ["Warrior", "Mage", "Ranger", "Sorcerer", "Protector", "Assassin", "Hunter", "Knight", "Shaman", "Rogue"]
    parts = [prefixes, infixes, suffixes]
    return ' '.join(random.choice(part) for part in parts)

# Specify directory and file path
directory_path = "html/static/json/"

file_path = os.path.join(directory_path, "highscores.json")

# Ensure the directory exists
os.makedirs(directory_path, exist_ok=True)

# Generate 50 random fantasy-themed names with associated scores
fantasy_names_scores = [{"name": generate_random_fantasy_name(), "score": random.randint(500, 10000)} for i in range(50)]

fantasy_names_scores .append({"name": "Chris Watkins", "score": random.randint(500, 10000)});
# Sort the list by score in descending order
fantasy_names_scores_sorted = sorted(fantasy_names_scores, key=lambda x: x['score'], reverse=True)

# Rank the names from 1 to 50
for rank, entry in enumerate(fantasy_names_scores_sorted, 1):
    entry['rank'] = rank

# Save to the JSON file
with open(file_path, "w") as json_file:
    json.dump(fantasy_names_scores_sorted, json_file, indent=4)



