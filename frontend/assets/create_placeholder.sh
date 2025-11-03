#!/bin/bash
# Create minimal placeholder images using ImageMagick or fallback to base64 PNG

# Try ImageMagick first
if command -v convert &> /dev/null; then
  # Create 1024x1024 icon (blue background, white text)
  convert -size 1024x1024 xc:'#2196F3' -pointsize 400 -fill white -gravity center -annotate +0+0 'ASPA' icon.png
  
  # Create splash screen (same as icon for now)
  convert -size 1024x1024 xc:'#2196F3' splash.png
  
  # Create adaptive icon
  convert -size 512x512 xc:'#2196F3' -pointsize 200 -fill white -gravity center -annotate +0+0 'ASPA' adaptive-icon.png
  
  # Create favicon
  convert -size 64x64 xc:'#2196F3' favicon.png
  
  echo "Assets created successfully"
else
  echo "ImageMagick not found. Install with: brew install imagemagick"
  echo "Or download placeholder images manually"
fi
