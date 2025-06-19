#!/bin/bash

# Install required tools
sudo apt-get update
sudo apt-get install -y jq

# Set Azure Storage credentials
storage_account="$AZURE_STORAGE_ACCOUNT"
container_name="$AZURE_STORAGE_CONTAINER"
sas_token="$AZURE_STORAGE_SAS_TOKEN"

# Build the frontend
cd front-end
echo "Installing frontend dependencies..."
npm install --silent

echo "Building frontend..."
npm run build
cd ..

# Set the build output directory
build_folder="front-end/out"

# Upload files to Azure Storage with proper URL encoding
find "$build_folder" -type f | while read -r file_path; do
    if [ -f "$file_path" ]; then
        # Get relative path
        relative_path=${file_path#$build_folder/}
        
        # URL encode the path
        encoded_path=$(printf '%s' "$relative_path" | jq -s -R -r @uri)
        
        # Construct Blob URL
        blob_url="https://$storage_account.blob.core.windows.net/$container_name/$encoded_path?$sas_token"
        
        # Determine content type
        extension="${file_path##*.}"
        case "$extension" in
            css) content_type="text/css" ;;
            js) content_type="application/javascript" ;;
            html) content_type="text/html" ;;
            json) content_type="application/json" ;;
            png) content_type="image/png" ;;
            jpg|jpeg) content_type="image/jpeg" ;;
            svg) content_type="image/svg+xml" ;;
            *) content_type=$(file -b --mime-type "$file_path") ;;
        esac
        
        # Upload with proper content type
        echo "Uploading: $relative_path"
        curl -X PUT -T "$file_path" -H "x-ms-blob-type: BlockBlob" -H "x-ms-blob-cache-control: no-cache" -H "Content-Type: $content_type" "$blob_url"
        echo ""
    fi
done

echo "Frontend deployment complete!"