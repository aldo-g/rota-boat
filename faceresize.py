from PIL import Image
import os

# Set the directory containing the images
input_dir = "public/images/faces"
output_dir = "public/images/new_faces"
os.makedirs(output_dir, exist_ok=True)

# Set the target size (max width and height)
target_size = (100, 100)  # Maximum dimensions

# Loop through all PNG files and process them
for filename in os.listdir(input_dir):
    if filename.endswith(".png"):
        img_path = os.path.join(input_dir, filename)
        with Image.open(img_path) as img:
            # Convert to RGBA if not already (to handle transparency)
            img = img.convert("RGBA")

            # Get the bounding box of the non-transparent content
            bbox = img.getbbox()  # Automatically detect the bounding box
            if bbox:
                img = img.crop(bbox)  # Crop the image to the bounding box

            # Resize while maintaining aspect ratio
            img.thumbnail(target_size, Image.Resampling.LANCZOS)

            # Create a new image with the target size and a transparent background
            new_img = Image.new("RGBA", target_size, (255, 255, 255, 0))  # Transparent background
            
            # Center the resized image on the new canvas
            x_offset = (target_size[0] - img.size[0]) // 2
            y_offset = (target_size[1] - img.size[1]) // 2
            new_img.paste(img, (x_offset, y_offset), img)  # Preserve transparency

            # Save the resized and centered image
            output_path = os.path.join(output_dir, filename)
            new_img.save(output_path, format="PNG")

print("All images cropped, resized, and saved in:", output_dir)
