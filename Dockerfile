# Use lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install the MTProto Proxy package
RUN pip install --no-cache-dir mtprotoproxy

# Expose port 10000 for hosting
EXPOSE 10000

# Set Environment Variables
# SECRET format: 'ee' + 32 random characters + hex of 'google.com' (to bypass network blocks)
ENV PORT=10000
ENV SECRET="ee11111111111111111111111111111111676f6f676c652e636f6d"

# Command to run the proxy
CMD ["sh", "-c", "mtprotoproxy $PORT $SECRET"]
