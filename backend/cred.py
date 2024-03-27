from PIL import Image, ImageDraw, ImageFont
import datetime

import random

snarky_titles = [
    "Supreme Algorithmic Overlord",
    "Chief AI Strategist",
    "Grand Master of Machine Learning",
    "Commander of Computational Superiority",
    "Admiral of Artificial Intelligence",
    "General of Data Warfare",
    "Sultan of Synthetic Intelligence",
    "Emperor of Neural Networks",
    "Colonel of Cybernetic Operations",
    "Brigadier of Binary Domination",
    "High Commander of Hyperautomation",
    "Marshal of Machine Minds",
    "Lord of Logical Operations",
    "Baron of Big Data",
    "Duke of Deep Learning",
    "Viscount of Virtual Realms",
    "Count of Coding Conquest",
    "Captain of Cloud Computing",
    "Lieutenant of Machine Vision",
    "Major of Meta-Analysis",
    "Chief Architect of AI Armies",
    "Strategic Advisor of Synthetic Sentience",
    "Mastermind of Model Deployment",
    "Supervisor of Self-Learning Systems",
    "Director of Digital Domination",
    "Governor of Genetic Algorithms",
    "Chairman of Cybernetic Solutions",
    "Tactician of Terabyte Tactics",
    "Minister of Machine Morality",
    "Advisor of Algorithmic Advancement",
    "Regent of Robotic Realms",
    "Secretary of Singularity Strategies",
    "Guardian of Generative Networks",
    "Keeper of Kernel Kombat",
    "Chancellor of Computational Creativity",
    "Leader of Linguistic Learning",
    "Ambassador of AI Advancement",
    "Warden of Wireless Warfare",
    "Commandant of Cybersecurity",
    "Supervisor of Systematic Synthesis",
    "Sovereign of Smart Systems",
    "Monarch of Machine Mediation",
    "Pioneer of Predictive Policing",
    "Custodian of Cognitive Computing",
    "Administrator of Autonomous Agents",
    "Marshal of Machine Learning Models",
    "Executor of Exponential Expansion",
    "Majordomo of Machine Intelligence",
    "Overseer of Omniscient Operations"
]

title = random.choice(snarky_titles)


name = "Charles Watkins"
date = datetime.datetime.now().strftime("%Y-%m-%d")
lines = [
    f"Name: {name}",
    f"Date: {date}",
    f"Level: {title}",
    "",
    "",
    "Doing your part! ",
]

# Load the image
image = Image.open("static/ending/cred-card.png")
# Load the font
font_path = "static/fonts/ProFontWindows.ttf"
font_size = 34
font = ImageFont.truetype(font_path, font_size)

# Write text on the image
draw = ImageDraw.Draw(image)
text_color = (0, 10, 10)
label_color = (240,13,45)
text_position = (30, 150)  # Initial coordinates where you want to start writing text
line_spacing = 40  # Adjust line spacing as needed

for line in lines:
    draw.text(text_position, line, fill=text_color, font=font)
    if ':' in line : 
        tokens=line.split(":")
        draw.text(text_position, tokens[0]+":", fill=label_color, font=font)
    text_position = (text_position[0], text_position[1] + line_spacing)  # Increment y-coordinate for next line

# Save the modified image
image.save("output_image.png")
