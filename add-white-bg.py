from PIL import Image
import os, glob

folder = "public/images/Categorias/Mundial/Camiseta"

for png_path in glob.glob(os.path.join(folder, "*.png")):
    img = Image.open(png_path).convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img)
    bg.convert("RGB").save(png_path.replace(".png", ".jpeg"), "JPEG", quality=95)
    os.remove(png_path)
    print(f"Done: {os.path.basename(png_path)} -> jpeg")

# Remove original jpegs from WhatsApp (with spaces in name)
for jpg in glob.glob(os.path.join(folder, "WhatsApp*.jpeg")):
    pass  # keep the new jpegs

print("All done!")
