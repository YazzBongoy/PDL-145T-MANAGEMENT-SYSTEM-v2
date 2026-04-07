#!/bin/bash

# normalize_headings.sh
# Script to normalize heading levels in markdown files during concatenation
# Usage: ./normalize_headings.sh [input_file] [output_file] [method]
# Methods: sed, pandoc

set -e

# Default values
INPUT_FILE=""
OUTPUT_FILE=""
METHOD="sed"

# Function to display usage
usage() {
    echo "Usage: $0 [options] input_file output_file"
    echo ""
    echo "Options:"
    echo "  -m, --method METHOD   Method to use for normalization (sed|pandoc)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Methods:"
    echo "  sed    - Use sed command to demote headings (default)"
    echo "  pandoc - Use pandoc with --shift-heading-level-by=1"
    echo ""
    echo "Examples:"
    echo "  $0 input.md output.md"
    echo "  $0 --method pandoc input.md output.md"
    echo "  $0 -m sed input.md output.md"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--method)
            METHOD="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            if [ -z "$INPUT_FILE" ]; then
                INPUT_FILE="$1"
            elif [ -z "$OUTPUT_FILE" ]; then
                OUTPUT_FILE="$1"
            else
                echo "Error: Too many arguments"
                usage
            fi
            shift
            ;;
    esac
done

# Validate arguments
if [ -z "$INPUT_FILE" ] || [ -z "$OUTPUT_FILE" ]; then
    echo "Error: Input and output files are required"
    usage
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' does not exist"
    exit 1
fi

# Validate method
if [ "$METHOD" != "sed" ] && [ "$METHOD" != "pandoc" ]; then
    echo "Error: Method must be 'sed' or 'pandoc'"
    exit 1
fi

# Function to normalize headings using sed
normalize_with_sed() {
    local input="$1"
    local output="$2"
    
    echo "Normalizing headings using sed..."
    
    # Use sed to demote all headings by one level
    # This regex matches lines starting with # and adds another #
    sed -E 's/^(#{1,5})([^#])/##\1\2/g' "$input" > "$output"
    
    echo "✅ Successfully normalized headings with sed"
}

# Function to normalize headings using pandoc
normalize_with_pandoc() {
    local input="$1"
    local output="$2"
    
    echo "Normalizing headings using pandoc..."
    
    # Check if pandoc is available
    if ! command -v pandoc &> /dev/null; then
        echo "Error: pandoc is not installed or not in PATH"
        echo "Please install pandoc: https://pandoc.org/installing.html"
        exit 1
    fi
    
    # Use pandoc to shift heading levels by 1
    pandoc --shift-heading-level-by=1 "$input" -o "$output"
    
    echo "✅ Successfully normalized headings with pandoc"
}

# Function to concatenate multiple files with heading normalization
concatenate_files() {
    local files=("$@")
    local output_file="${files[-1]}"
    local input_files=("${files[@]:0:${#files[@]}-1}")
    
    echo "Concatenating files with heading normalization..."
    
    # Create temporary directory for normalized files
    local temp_dir=$(mktemp -d)
    
    # Write global H1 header
    echo "# Global Document Title" > "$output_file"
    echo "" >> "$output_file"
    
    # Process each file
    for file in "${input_files[@]}"; do
        if [ -f "$file" ]; then
            local temp_file="$temp_dir/$(basename "$file")"
            
            echo "Processing: $file"
            
            if [ "$METHOD" == "sed" ]; then
                normalize_with_sed "$file" "$temp_file"
            else
                normalize_with_pandoc "$file" "$temp_file"
            fi
            
            # Append normalized content to output
            echo "" >> "$output_file"
            cat "$temp_file" >> "$output_file"
            echo "" >> "$output_file"
        else
            echo "Warning: File '$file' not found, skipping..."
        fi
    done
    
    # Clean up temporary directory
    rm -rf "$temp_dir"
    
    echo "✅ Concatenation complete: $output_file"
}

# Main execution
echo "🚀 Heading Level Normalization Tool"
echo "=================================="
echo "Input file: $INPUT_FILE"
echo "Output file: $OUTPUT_FILE"
echo "Method: $METHOD"
echo ""

# Execute normalization
if [ "$METHOD" == "sed" ]; then
    normalize_with_sed "$INPUT_FILE" "$OUTPUT_FILE"
else
    normalize_with_pandoc "$INPUT_FILE" "$OUTPUT_FILE"
fi

echo ""
echo "📄 File size: $(wc -c < "$OUTPUT_FILE") bytes"
echo "🎉 Normalization complete!"
