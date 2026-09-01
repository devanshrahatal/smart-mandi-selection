"""
Dispute & Grievance Model — Farmer & Buyer Redressal Workflow.
Enables transparent ticket filing for weight discrepancies, delayed payments, and quality grading disputes.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String(30), unique=True, nullable=False, index=True)  # e.g. "GRV-2026-881"
    complainant_name = Column(String(100), nullable=False)
    complainant_phone = Column(String(20), nullable=False)
    target_entity_name = Column(String(120), nullable=False)  # Mandi name or Buyer name
    dispute_category = Column(String(50), nullable=False)  # "Weight Discrepancy" | "Delayed Payment" | "Quality Downgrade" | "Unauthorized Deduction"
    severity = Column(String(20), default="HIGH", nullable=False)  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    description = Column(Text, nullable=False)
    disputed_amount = Column(String(50), nullable=True)  # e.g. "₹12,400"
    status = Column(String(30), default="OPEN", nullable=False)  # "OPEN" | "INVESTIGATING" | "RESOLVED"
    resolution_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Dispute(ticket='{self.ticket_id}', category='{self.dispute_category}', status='{self.status}')>"
