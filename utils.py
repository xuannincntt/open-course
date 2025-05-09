import os
import re

def extract_public_id(image_url):
    # Tách phần sau /upload/
    match = re.search(r'/upload/(?:v\d+/)?(.+)$', image_url)
    if not match:
        raise ValueError("Invalid Cloudinary URL format")
    
    # Lấy folder + filename.ext
    path_with_ext = match.group(1)  # 'folder/image.jpg'
    filename_with_ext = os.path.basename(path_with_ext)  # 'image.jpg'
    folder = os.path.dirname(path_with_ext)  # 'folder'
    filename, _ = os.path.splitext(filename_with_ext)  # 'image'
    
    if folder:
        return f"{folder}/{filename}"
    else:
        return filename
