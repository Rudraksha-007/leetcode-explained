#!/bin/bash

# Ensure we are in the project root
cd "$(dirname "$0")"

# Create necessary directories in build
mkdir -p prod prod/dist prod/src prod/node_modules

# Copy necessary files to the build directory
cp manifest.json prod
cp -r dist/src prod/dist
cp -r node_modules/eventsource-parser/ prod/node_modules/eventsource-parser 
cp -r node_modules/lodash-es/ prod/node_modules/lodash-es
cp -r src/popup prod/src
cp -r src/assets prod/src

# Remove all .ts files from build directory
find prod/src -type f -name "*.ts" -exec rm -f {} \;

# Remove src/assets/images/screenshots directory from build directory
rm -rf prod/src/assets/images/screenshots

# Zip the build directory into leetcode-explained.zip
cd prod
zip -r ../leetcode-explained.zip .
cd ..
