import grpc
from concurrent import futures
import time

# These will be generated
import triage_pb2
import triage_pb2_grpc

class TriageServicer(triage_pb2_grpc.TriageServiceServicer):
    def AnalyzeSymptoms(self, request, context):
        print(f"Received request for age: {request.age_range}")
        return triage_pb2.TriageResult(
            care_level="primary_care",
            confidence=0.99,
            explanation="System Link Verified. Hello from Python!"
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    triage_pb2_grpc.add_TriageServiceServicer_to_server(
        TriageServicer(), server)
    server.add_insecure_port('[::]:8000')
    print("Starting server at [::]:8000")
    server.start()
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
