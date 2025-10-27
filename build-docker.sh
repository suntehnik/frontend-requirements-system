#!/bin/bash

# Docker build script for production deployment

set -e

# Default values
API_URL=${API_URL:-"http://spexus.msk.avito.ru"}
APP_TITLE=${APP_TITLE:-"Requirements Management System"}
APP_VERSION=${APP_VERSION:-"1.0.0"}
IMAGE_NAME=${IMAGE_NAME:-"frontend-requirements-system"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

echo "Building Docker image with configuration:"
echo "  API_URL: $API_URL"
echo "  APP_TITLE: $APP_TITLE"
echo "  APP_VERSION: $APP_VERSION"
echo "  Image: $IMAGE_NAME:$IMAGE_TAG"
echo ""

# Build the Docker image
docker build \
  --build-arg API_URL="$API_URL" \
  --build-arg APP_TITLE="$APP_TITLE" \
  --build-arg APP_VERSION="$APP_VERSION" \
  -t "$IMAGE_NAME:$IMAGE_TAG" \
  .

echo ""
echo "✅ Docker image built successfully: $IMAGE_NAME:$IMAGE_TAG"
echo ""
echo "To run the container:"
echo "  docker run -p 80:80 -e API_URL=\"$API_URL\" $IMAGE_NAME:$IMAGE_TAG"
echo ""
echo "Or use docker-compose:"
echo "  API_URL=\"$API_URL\" docker-compose up -d"