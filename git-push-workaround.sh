#!/bin/bash

# Workaround for GnuTLS handshake error
echo "Attempting to push using alternative methods..."

# Method 1: Try with minimal cipher suite
echo "Method 1: Trying with TLS 1.2 only..."
GIT_SSL_VERSION=tlsv1.2 git push origin dev 2>&1

if [ $? -eq 0 ]; then
    echo "Success with Method 1!"
    exit 0
fi

# Method 2: Try with different MTU
echo "Method 2: Trying with reduced MTU..."
sudo ip link set dev $(ip route | grep default | awk '{print $5}') mtu 1400 2>/dev/null
git push origin dev 2>&1
sudo ip link set dev $(ip route | grep default | awk '{print $5}') mtu 1500 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Success with Method 2!"
    exit 0
fi

# Method 3: Try through proxy
echo "Method 3: Trying without proxy..."
unset http_proxy
unset https_proxy
unset HTTP_PROXY
unset HTTPS_PROXY
git push origin dev 2>&1

if [ $? -eq 0 ]; then
    echo "Success with Method 3!"
    exit 0
fi

echo "All methods failed. Please try:"
echo "1. Create a Personal Access Token on GitHub"
echo "2. Use: git push https://YOUR_USERNAME:TOKEN@github.com/Bahatisteven/citizen-engagement-mvp.git dev"
echo ""
echo "Or try installing git from source with OpenSSL:"
echo "  https://git-scm.com/book/en/v2/Getting-Started-Installing-Git"