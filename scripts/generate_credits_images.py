#!/usr/bin/env python3
"""
Generate images for Code of Dreams credits using Replicate API
Reads prompts from imag.yaml and generates images
"""

import os
import yaml
import replicate
import requests
import argparse
from pathlib import Path
import time

def parse_yaml_prompts(yaml_file):
    """Parse the YAML file to extract image prompts and negative prompt"""
    with open(yaml_file, 'r') as f:
        data = yaml.safe_load(f)

    images = []
    negative_prompt = None

    # Iterate through all sections in order
    flux_prompts = data.get('flux_prompts', {})

    # Extract negative prompt if present
    if 'negative_prompt' in flux_prompts:
        negative_prompt = flux_prompts['negative_prompt']

    # Sort sections by name to ensure consistent ordering
    for section_name in sorted(flux_prompts.keys()):
        # Skip the negative_prompt key
        if section_name == 'negative_prompt':
            continue

        section_data = flux_prompts[section_name]

        if 'images' in section_data:
            timeline = section_data.get('timeline', 'Unknown')
            lyrics = section_data.get('lyrics', '')
            style_constants = section_data.get('style_constants', [])

            # Build style suffix from constants
            style_suffix = ', '.join(style_constants) if style_constants else ''

            for img in section_data['images']:
                # Append style constants to description
                full_description = img['description']
                if style_suffix:
                    full_description = f"{img['description']}, {style_suffix}"

                images.append({
                    'number': img['number'],
                    'description': full_description,
                    'section': section_name,
                    'timeline': timeline,
                    'lyrics': lyrics
                })

    # Sort by image number to ensure correct order
    images.sort(key=lambda x: x['number'])

    return images, negative_prompt

def generate_image(prompt, scene_num, output_dir, section=None, model="black-forest-labs/flux-dev",
                   prompt_upsampling=False, safety_tolerance=2, seed=None, negative_prompt=None):
    """Generate image using Replicate API"""
    print(f"\n{'='*60}")
    if section:
        print(f"Image {scene_num} ({section})")
    else:
        print(f"Image {scene_num}")
    print(f"Prompt: {prompt[:80]}...")
    if negative_prompt:
        print(f"Negative: {negative_prompt[:60]}...")
    print(f"{'='*60}")

    try:
        input_params = {
            "prompt": prompt,
            "aspect_ratio": "16:9",
            "output_format": "webp",
            "output_quality": 90,
            "safety_tolerance": safety_tolerance,
            "prompt_upsampling": prompt_upsampling,
            "num_inference_steps": 28,
            "guidance_scale": 3.5
        }

        # Add negative prompt if specified
        if negative_prompt:
            input_params["negative_prompt"] = negative_prompt

        # Only add seed if specified
        if seed is not None:
            input_params["seed"] = seed

        output = replicate.run(model, input=input_params)

        # Get the image URL from output
        if isinstance(output, list) and len(output) > 0:
            image_url = output[0]
        else:
            image_url = output

        # Download the image
        response = requests.get(image_url)
        response.raise_for_status()

        # Save the image
        filename = f"{scene_num}.webp"
        filepath = output_dir / filename

        with open(filepath, 'wb') as f:
            f.write(response.content)

        print(f"✓ Saved: {filepath}")
        return True

    except Exception as e:
        print(f"✗ Error generating scene {scene_num}: {e}")
        return False

def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Generate images from YAML prompts using Replicate')
    parser.add_argument('--prompt-upsampling', action='store_true',
                        help='Enable automatic prompt enhancement for more creative generation')
    parser.add_argument('--safety-tolerance', type=int, default=2, choices=range(1, 7),
                        help='Safety tolerance (1=most strict, 6=most permissive, default=2)')
    parser.add_argument('--seed', type=int, default=None,
                        help='Random seed for reproducible generation')
    parser.add_argument('--output-dir', type=str, default=None,
                        help='Custom output directory')
    parser.add_argument('--sections', type=str, default=None,
                        help='Comma-separated list of sections to generate (e.g., section_1,section_3). Default: all sections')
    parser.add_argument('--range', type=str, default=None,
                        help='Range of image numbers to generate (e.g., 1-10 or 5-15). Default: all images')
    parser.add_argument('--numbers', type=str, default=None,
                        help='Specific image numbers to generate (e.g., 5 or 1,5,12,23). Default: all images')
    parser.add_argument('--negative-prompt', type=str, default=None,
                        help='Override negative prompt from YAML file')
    parser.add_argument('--no-negative', action='store_true',
                        help='Disable negative prompt entirely')
    args = parser.parse_args()

    # Setup paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    yaml_file = project_root / "imag.yaml"

    if args.output_dir:
        output_dir = Path(args.output_dir)
    else:
        output_dir = project_root / "html/static/asset_packages/default/storyboard/credits/images_new"

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Check for API token
    if not os.getenv('REPLICATE_API_TOKEN'):
        print("ERROR: REPLICATE_API_TOKEN not found in environment")
        return 1

    print(f"Reading prompts from: {yaml_file}")
    print(f"Output directory: {output_dir}")

    # Parse prompts and get negative prompt from YAML
    images, yaml_negative_prompt = parse_yaml_prompts(yaml_file)

    # Determine which negative prompt to use (priority: --no-negative > --negative-prompt > YAML)
    if args.no_negative:
        negative_prompt = None
    elif args.negative_prompt:
        negative_prompt = args.negative_prompt
    else:
        negative_prompt = yaml_negative_prompt

    print(f"Settings:")
    print(f"  - Model: black-forest-labs/flux-dev")
    print(f"  - Prompt upsampling: {args.prompt_upsampling}")
    print(f"  - Safety tolerance: {args.safety_tolerance}")
    print(f"  - Seed: {args.seed if args.seed else 'Random'}")
    print(f"  - Negative prompt: {'Enabled (from YAML)' if negative_prompt and not args.negative_prompt else 'Enabled (custom)' if negative_prompt else 'Disabled'}")
    if negative_prompt:
        print(f"    {negative_prompt[:100]}...")

    # Filter by sections if specified
    if args.sections:
        requested_sections = [s.strip() for s in args.sections.split(',')]
        images = [img for img in images if img['section'] in requested_sections]
        print(f"Filtering to sections: {', '.join(requested_sections)}")

    # Filter by range if specified
    if args.range:
        try:
            start, end = map(int, args.range.split('-'))
            images = [img for img in images if start <= img['number'] <= end]
            print(f"Filtering to image range: {start}-{end}")
        except ValueError:
            print(f"ERROR: Invalid range format '{args.range}'. Use format: start-end (e.g., 1-10)")
            return 1

    # Filter by specific numbers if specified
    if args.numbers:
        try:
            requested_numbers = [int(n.strip()) for n in args.numbers.split(',')]
            images = [img for img in images if img['number'] in requested_numbers]
            print(f"Filtering to specific images: {', '.join(map(str, requested_numbers))}")
        except ValueError:
            print(f"ERROR: Invalid numbers format '{args.numbers}'. Use format: 5 or 1,5,12,23")
            return 1

    print(f"\nFound {len(images)} images to generate")

    if len(images) == 0:
        print("No images match the specified filters!")
        return 1

    # Generate images
    successful = 0
    failed = 0

    for img in images:
        success = generate_image(
            img['description'],
            img['number'],
            output_dir,
            section=img.get('section'),
            prompt_upsampling=args.prompt_upsampling,
            safety_tolerance=args.safety_tolerance,
            seed=args.seed,
            negative_prompt=negative_prompt
        )
        if success:
            successful += 1
        else:
            failed += 1

        # Rate limiting - small delay between requests
        time.sleep(1)

    # Summary
    print(f"\n{'='*60}")
    print(f"Generation Complete!")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"{'='*60}")

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())
