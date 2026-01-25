FROM python:3.11-slim

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

# Install dependencies (including grpcio-tools which compiles fine on 3.11)
COPY src/MedEquity.ML/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and Protos (Context must be Solution Root)
COPY src/MedEquity.ML/ .
COPY src/Protos/ /app/Protos/

# Generate gRPC code
RUN python -m grpc_tools.protoc -I/app/Protos --python_out=. --grpc_python_out=. /app/Protos/triage.proto

# Expose port
EXPOSE 8000

# Run service
CMD ["python", "service.py"]
