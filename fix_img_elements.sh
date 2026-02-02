#!/bin/bash

# Files with img elements that need to be replaced
files=(
    "components/resume/templates/creative-template.tsx"
    "components/resume/templates/dublin-template.tsx"
    "components/resume/templates/executive-template.tsx"
    "components/resume/templates/iconic-template.tsx"
    "components/resume/templates/infographic-template.tsx"
    "components/resume/templates/minimalist-template.tsx"
    "components/resume/templates/technical-template.tsx"
    "components/resume/templates/timeline-template.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing $file..."
        
        # Add Image import if not already present
        if ! grep -q "import Image from \"next/image\"" "$file"; then
            sed -i '' '1a\
import Image from "next/image";
' "$file"
        fi
        
        # Replace <img> with <Image>
        # This is a simple replacement - may need manual adjustment for complex cases
        sed -i '' 's|<img|<Image|g' "$file"
        sed -i '' 's|</img>|</Image>|g' "$file"
        
        # Add width, height, and unoptimized props to Image elements
        # This is a rough replacement that may need manual cleanup
        sed -i '' 's|src=\([^>]*\)|src=\1 width={96} height={96} unoptimized|g' "$file"
        
        echo "Updated $file"
    fi
done

echo "Batch processing complete. Manual review recommended for complex cases."
