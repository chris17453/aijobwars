#!/bin/bash
SCENE_WEB_PATH="static/storyboard/intro"
SCENE_LOCAL_PATH="html/$SCENE_WEB_PATH"

# Define the function to extract components
extract_components() {
    filename="$1"
    # Remove the extension
    filename_no_ext=$(echo "$filename" | cut -d '.' -f 1)
    # Check if filename contains a hyphen
    if echo "$filename_no_ext" | grep -q '-'; then
        # Extract components using cut
        scene=$(echo "$filename_no_ext" | cut -d '-' -f 2)
        part=$(echo "$filename_no_ext" | cut -d '-' -f 3)
        # If part is empty, populate it with 1
        if [ -z "$part" ]; then
            part=1
        fi
    else
        # If filename does not contain a hyphen, assume scene is the entire filename (without extension)
        scene="$filename_no_ext"
        # Part is 1
        part=1
    fi
    # Return the extracted components separated by a space
    echo "$scene $part"
}

# List files in the tracks directory
track_files=$(ls -v $SCENE_LOCAL_PATH/tracks/)

# Declare an empty associative array to store the track results by scene
declare -A track_scenes
declare -A track_time
# Declare variable to keep track of cumulative duration
cumulative_duration=0

# Loop through each track file
duration=0
for track_file in $track_files; do
    # Call the function to extract components
    components=$(extract_components "$track_file")
    # Split the components into variables
    read -r scene part <<< "$components"
    # Calculate the duration of the track
    # Add the track file to the corresponding scene with the cumulative timestamp
    
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$SCENE_LOCAL_PATH/tracks/$track_file")
    track_scenes[$scene]+="{\"path\":\"$SCENE_WEB_PATH/tracks/$track_file\",\"timestamp\":$cumulative_duration,\"length\":$duration},"
    
    track_time[$scene-$part]=$cumulative_duration
    
    # Add the duration to the cumulative duration
    cumulative_duration=$(echo "$cumulative_duration + $duration" + 1 | bc)

done

# List files in the images directory
image_files=$(ls -v $SCENE_LOCAL_PATH/wide/)

# Declare an empty associative array to store the image results by scene
declare -A image_scenes

# Loop through each image file
for image_file in $image_files; do
    # Call the function to extract components
    components=$(extract_components "$image_file")
    # Split the components into variables
    read -r scene part <<< "$components"
    # Add the image file to the corresponding scene with the scene timestamp
    image_scenes[$scene]+="{\"path\":\"$SCENE_WEB_PATH/wide/$image_file\",\"timestamp\":${track_time[$scene-1]}},"
done
# Print the JSON array
echo "["
# Loop through each scene
for scene_number in "${!track_scenes[@]}"; do
    echo "    {"
    echo "        \"slide\": $scene_number,"
    echo "        \"images\": ["
    # Print images for the scene
    echo -n "${image_scenes[$scene_number]}" | sed 's/,$//'
    echo "        ],"
    echo "        \"audio\": ["
    # Print tracks for the scene
    echo -n "${track_scenes[$scene_number]}" | sed 's/,$//'
    echo "        ]"
    echo "    },"
done | sed '$s/,$//'
echo "]"
