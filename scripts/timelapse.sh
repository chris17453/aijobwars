#!/bin/bash

# Get the directory of the script
script_dir=$(dirname "$(realpath "$0")")

# Check if the webcam device argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <webcam_device>"
    exit 1
fi

# Webcam device specified as argument
webcam_device="$1"

# Define the interval in seconds
interval=1

# Define the directories to save the images
session=$(date +%Y-%m-%d)
window="3d";
webcam_dir="$script_dir/../timelapse/$session/webcam_images"
window_dir="$script_dir/../timelapse/$session/$window"
# Define the resolution for the webcam
resolution="640x480"

# Create directories if they don't exist
mkdir -p "$webcam_dir"
mkdir -p "$window_dir"

# Initialize counter variables
webcam_counter=0
vscode_counter=0

# Function to capture webcam image
capture_webcam() {
    webcam_counter=$((webcam_counter + 1))
    ffmpeg -f v4l2 -video_size "$resolution" -framerate 30 -i "$webcam_device" -vframes 1 "$webcam_dir/img_$webcam_counter.jpg"
}

# Function to capture Visual Studio Code window
capture_window() {
    window=$1
    vscode_counter=$((vscode_counter + 1))
    import -window "$(xdotool search --name "$window" | head -n 1)" "$window_dir/img_$vscode_counter.png"
}

# Loop to capture images every X seconds
while true; do
    capture_webcam
    capture_window $window
    sleep "$interval"
done
