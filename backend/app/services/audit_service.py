import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog

logger = logging.getLogger("sla_guardian.services.audit")


class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        entity: str,
        entity_id: str,
        actor: str = "SYSTEM",
        actor_id: Optional[str] = None,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        """
        Records an auditable event in the audit_logs table.
        """
        audit_entry = AuditLog(
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            actor=actor,
            actor_id=actor_id,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
            metadata_json=metadata_json,
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        logger.debug(f"Audit log recorded: {action} on {entity}:{entity_id} by {actor}")
        return audit_entry


audit_service = AuditService()
