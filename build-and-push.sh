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

# Ensure buildx builder exists
BUILDER="ese-multiplatform"
if ! docker buildx inspect "$BUILDER" &>/dev/null; then
  echo "=== Creating buildx builder ==="
  docker buildx create --name "$BUILDER" --use
else
  docker buildx use "$BUILDER"
fi

# Build and push multi-platform image
echo "=== Building and pushing multi-platform image (amd64 + arm64) ==="
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t "${REPO}:${VERSION}" \
  -t "${REPO}:latest" \
  --push \
  .

echo ""
echo "=== Done ==="
echo "Published:"
echo "  ${REPO}:${VERSION}"
echo "  ${REPO}:latest"
