from pdf2image import convert_from_path

# Path to your PDF file
pdf_path = "IsPFBBNSRLFeas.pdf"

# Convert PDF to images
images = convert_from_path(pdf_path, dpi=300)  # Higher dpi means higher resolution

# Save each page as a JPG
for i, image in enumerate(images):
    image.save(f"page_{i+1}.jpg", "JPEG")
