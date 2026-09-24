from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db
from app.models.simulation import Simulation
from app.models.simulation_result import SimulationResult
from app.schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
    SimulationResultResponse,
)
from app.services.simulation_service import simulation_service

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("/", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/run", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def run_simulation(
    req: SimulationRequest,
    db: Session = Depends(get_db),
):
    """
    Execute a what-if operational simulation (Ticket Spike, Agent Failure, Queue Overload, SLA Tightening, etc.).
    Guarantees isolation: Absolutely NO production database records are modified!
    """
    return simulation_service.create_and_run_simulation(db=db, req=req)


@router.get("/", response_model=List[SimulationResponse])
def list_simulations(db: Session = Depends(get_db)):
    """List historical simulation runs and outcomes."""
    sims = db.query(Simulation).order_by(desc(Simulation.created_at)).all()
    results = []
    for s in sims:
        res_dto = None
        if s.result:
            res_dto = SimulationResultResponse.model_validate(s.result)
        results.append(
            SimulationResponse(
                id=s.id,
                scenario=s.scenario,
                parameters=s.parameters,
                status=s.status,
                created_at=s.created_at,
                completed_at=s.completed_at,
                result=res_dto,
            )
        )
    return results


@router.get("/{simulation_id}", response_model=SimulationResponse)
def get_simulation(simulation_id: str, db: Session = Depends(get_db)):
    """Get details of a specific simulation run."""
    s = db.query(Simulation).filter(Simulation.id == simulation_id).first()
    if not s:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation run not found")

    res_dto = SimulationResultResponse.model_validate(s.result) if s.result else None
    return SimulationResponse(
        id=s.id,
        scenario=s.scenario,
        parameters=s.parameters,
        status=s.status,
        created_at=s.created_at,
        completed_at=s.completed_at,
        result=res_dto,
    )


@router.get("/{simulation_id}/results", response_model=SimulationResultResponse)
def get_simulation_results(simulation_id: str, db: Session = Depends(get_db)):
    """Get detailed results, delta metrics, and recommended actions for a simulation."""
    res = db.query(SimulationResult).filter(SimulationResult.simulation_id == simulation_id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Simulation results not found")
    return SimulationResultResponse.model_validate(res)
