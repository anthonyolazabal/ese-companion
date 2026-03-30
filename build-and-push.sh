#!/bin/bash
set -e

REPO="anthonyolazabal/ese-companion"

# Ask for version
read -p "Enter the version tag (e.g. 2.0.0): " VERSION

if [ -z "$VERSION" ]; then
  echo "Error: version cannot be empty"
  exit 1
fi

echo ""
echo "Building and pushing:"
echo "  ${REPO}:${VERSION}"
echo "  ${REPO}:latest"
echo ""

# Build the image with both tags
echo "=== Building Docker image ==="
docker build \
  -t "${REPO}:${VERSION}" \
  -t "${REPO}:latest" \
  .

echo ""
echo "=== Build complete ==="
echo ""

# Push version tag
echo "=== Pushing ${REPO}:${VERSION} ==="
docker push "${REPO}:${VERSION}"

# Push latest tag
echo "=== Pushing ${REPO}:latest ==="
docker push "${REPO}:latest"

echo ""
echo "=== Done ==="
echo "Published:"
echo "  ${REPO}:${VERSION}"
echo "  ${REPO}:latest"
