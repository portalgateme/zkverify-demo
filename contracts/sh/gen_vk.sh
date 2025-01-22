#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

if [ ! -d "circuits" ]; then
    echo -e "${RED}❌ Error: 'circuits' directory not found${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Starting verification key generation...${NC}"

for dir in circuits/*/; do
    # Skip if it's the fuzk directory
    if [[ "$dir" == "circuits/fuzk/" ]]; then
        continue
    fi

    circuit_name=$(basename "$dir")
    echo -e "${BLUE}📂 Processing circuit: ${circuit_name}${NC}"
    
    cd "$dir" || continue
    
    echo -e "${BLUE}🔨 Compiling ${circuit_name}...${NC}"
    if nargo compile; then
        echo -e "${GREEN}✅ Compilation successful${NC}"
    else
        echo -e "${RED}❌ Compilation failed for ${circuit_name}${NC}"
        cd - > /dev/null
        continue
    fi
    
    echo -e "${BLUE}📝 Writing verification key...${NC}"
    if bb write_vk -b "./target/${circuit_name}.json" -o "./target/vk"; then
        echo -e "${GREEN}✅ Verification key written successfully${NC}"
    else
        echo -e "${RED}❌ Failed to write verification key for ${circuit_name}${NC}"
    fi
    
    cd - > /dev/null
    echo -e "${BLUE}➖➖➖➖➖➖➖➖➖➖${NC}"
done

echo -e "${GREEN}✨ Verification key generation complete!${NC}"
