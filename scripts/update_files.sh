#!/bin/bash

# Directory to search
directory="./html/static"
base="./html"

# Output file
output_file="files.txt"

# Clear existing content of the output file
> "$output_file"

# Find all PNG, WEBP, and JPG files in the directory and subdirectories
find "$directory" -type f \( -name "*.png" -o -name "*.webp" -o -name "*.js" \) >> "$output_file"
find "$base" -type f \( -name "*.html"  \) >> "$output_file"

echo "File list generated successfully."
