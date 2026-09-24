from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db
from app.models.incident import Incident
from app.models.incident_action import IncidentAction
from app.schemas.incident import (
    IncidentResponse,
    IncidentActionResponse,
    IncidentActionApprovalRequest,
    IncidentActionExecuteRequest,
)
from app.services.incident_service import incident_service

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/", response_model=List[IncidentResponse])
def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status (DETECTED, INVESTIGATING, RESOLVED)"),
    db: Session = Depends(get_db),
):
    """List operational incidents and their recommended remediation actions."""
    q = db.query(Incident)
    if status:
        q = q.filter(Incident.status == status.upper())

    incidents = q.order_by(desc(Incident.detected_at)).all()
    results = []
    for inc in incidents:
        resp = IncidentResponse.model_validate(inc)
        resp.department_name = inc.department.name if inc.department else None
        resp.actions = [IncidentActionResponse.model_validate(a) for a in inc.actions]
        results.append(resp)
    return results


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    """Get single incident details."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Incident {incident_id} not found")

    resp = IncidentResponse.model_validate(inc)
    resp.department_name = inc.department.name if inc.department else None
    resp.actions = [IncidentActionResponse.model_validate(a) for a in inc.actions]
    return resp


@router.post("/scan", response_model=List[IncidentResponse])
def scan_operational_incidents(
    department_id: Optional[str] = Query(None, description="Optional department filter"),
    db: Session = Depends(get_db),
):
    """Scan current live queue depth and agent capacity to trigger automated incident detection."""
    detected = incident_service.scan_for_incidents(db, department_id)
    results = []
    for inc in detected:
        resp = IncidentResponse.model_validate(inc)
        resp.department_name = inc.department.name if inc.department else None
        resp.actions = [IncidentActionResponse.model_validate(a) for a in inc.actions]
        results.append(resp)
    return results


@router.post("/actions/{action_id}/approve", response_model=IncidentActionResponse)
def approve_incident_action(
    action_id: str,
    req: IncidentActionApprovalRequest = IncidentActionApprovalRequest(),
    db: Session = Depends(get_db),
):
    """Approve recommended remediation action for an incident."""
    try:
        action = incident_service.approve_action(db, action_id, req.approved_by)
        return IncidentActionResponse.model_validate(action)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/actions/{action_id}/execute", response_model=IncidentActionResponse)
def execute_incident_action(
    action_id: str,
    req: IncidentActionExecuteRequest = IncidentActionExecuteRequest(),
    db: Session = Depends(get_db),
):
    """Execute approved remediation action for an incident."""
    try:
        action = incident_service.execute_action(db, action_id, req.notes)
        return IncidentActionResponse.model_validate(action)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
