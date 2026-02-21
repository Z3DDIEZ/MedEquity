"""
MedEquity ML Service — gRPC server exposing the Gemini-powered triage engine.

This is the entry point for the Python ML service container.
It receives SymptomRequests via gRPC from the .NET API Gateway
and returns TriageResults powered by the Gemini API.
"""

import grpc
import logging
import os
import sys
from concurrent import futures

# Generated proto stubs (compiled from triage.proto)
import triage_pb2
import triage_pb2_grpc

from gemini_triage_service import GeminiTriageService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


class TriageServicer(triage_pb2_grpc.TriageServiceServicer):
    """gRPC servicer that bridges requests to the Gemini triage engine."""

    def __init__(self):
        self.gemini = GeminiTriageService()
        logger.info("TriageServicer initialized with Gemini backend")

    def AnalyzeSymptoms(self, request, context):
        logger.info(
            "Received triage request: age=%s, sex=%s, geography=%s, symptoms=%d",
            request.age_range,
            request.sex,
            request.geography,
            len(request.symptoms),
        )

        # Map gRPC SymptomEntry messages to dicts
        symptoms = [
            {
                "symptom_code": s.symptom_code,
                "severity": s.severity,
                "duration_hours": s.duration_hours,
            }
            for s in request.symptoms
        ]

        # Call Gemini
        result = self.gemini.analyze_symptoms(
            age_range=request.age_range,
            sex=request.sex,
            geography=request.geography,
            symptoms=symptoms,
        )

        logger.info(
            "Triage result: care_level=%s, confidence=%.2f, model=%s",
            result["care_level"],
            result["confidence"],
            result.get("model_version", "unknown"),
        )

        # Map back to gRPC response
        return triage_pb2.TriageResult(
            care_level=result["care_level"],
            confidence=result["confidence"],
            explanation=result.get("reasoning", ""),
            primary_concern=result.get("primary_concern", ""),
            reasoning=result.get("reasoning", ""),
            red_flags=result.get("red_flags", []),
            next_steps=result.get("next_steps", []),
            model_version=result.get("model_version", "unknown"),
        )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    triage_pb2_grpc.add_TriageServiceServicer_to_server(
        TriageServicer(), server
    )
    server.add_insecure_port("[::]:8000")
    logger.info("MedEquity ML Service starting on [::]:8000")
    server.start()
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Shutting down gracefully...")
        server.stop(5)


if __name__ == "__main__":
    serve()
