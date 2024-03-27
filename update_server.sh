#!/bin/bash

# Define source and destination information
source_file_list="files.txt"  # Replace with the name of your modified file paths text file

destination_host="10.90.0.45"
destination_user="root"
destination_path="/web/aijobwars.com/"

# Loop through each file in the list and SCP it to the destination
while IFS= read -r file_path; do
    echo scp -r "$file_path" "$destination_user@$destination_host:$destination_path$file_path"
    exit
done < "$source_file_list"
