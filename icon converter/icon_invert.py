from PIL import Image, ImageOps

# Load the image
input_path = "./kaggle-icon.png"
output_path = "./kaggle_split_64x128.png"

# Open and resize to 64x64
img = Image.open(input_path).convert("RGBA").resize((64, 64))

# Replace alpha with white
background = Image.new("RGB", img.size, (255, 255, 255))
background.paste(img, mask=img.split()[3])

# Invert the white-based version
inverted = ImageOps.invert(background)

# Create new 64x128 image
result = Image.new("RGB", (64, 128), (255, 255, 255))
result.paste(background, (0, 0))
result.paste(inverted, (0, 64))

# Save output
result.save(output_path)
output_path
