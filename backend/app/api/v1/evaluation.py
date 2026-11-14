from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.evaluation import EvaluationTestCase, EvaluationRun
from app.services.ai_agent import investigate_incident
from app.core.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/evaluation", tags=["evaluation"])


@router.get("/test-cases")
def list_test_cases(db: Session = Depends(get_db), _=Depends(get_current_user)):
    tcs = db.query(EvaluationTestCase).all()
    return [
        {
            "id": tc.id, "name": tc.name, "description": tc.description,
            "expected_root_cause": tc.expected_root_cause,
            "expected_actions": tc.expected_actions,
            "synthetic_incident": tc.synthetic_incident,
        }
        for tc in tcs
    ]


@router.post("/run")
def run_evaluation(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN", "SRE_ENGINEER")),
):
    tcs = db.query(EvaluationTestCase).all()
    run = EvaluationRun(
        started_at=datetime.now(timezone.utc),
        model_name=settings.OLLAMA_MODEL,
        total_cases=len(tcs),
    )
    db.add(run)
    db.commit()
    run_id = run.id
    cases = [{"id": tc.id, "incident": tc.synthetic_incident, "expected_root_cause": tc.expected_root_cause, "expected_actions": tc.expected_actions} for tc in tcs]

    def run_eval():
        from app.core.database import SessionLocal
        db2 = SessionLocal()
        try:
            results, scores = [], []
            correct = 0
            for case in cases:
                r = investigate_incident(case["incident"])
                score = r.get("confidence_score", 0.0)
                scores.append(score)
                match = bool(
                    case["expected_root_cause"]
                    and r.get("root_cause_summary")
                    and any(
                        w.lower() in r.get("root_cause_summary", "").lower()
                        for w in (case["expected_root_cause"] or "").split()[:3]
                    )
                )
                if match:
                    correct += 1
                results.append({
                    "test_case_id": case["id"],
                    "status": r["status"],
                    "confidence_score": score,
                    "root_cause_match": match,
                    "recommended_actions": r.get("recommended_actions", []),
                })
            ev = db2.query(EvaluationRun).filter(EvaluationRun.id == run_id).first()
            if ev:
                ev.completed_at = datetime.now(timezone.utc)
                ev.correct_root_causes = correct
                ev.avg_evidence_score = round(sum(scores) / len(scores), 3) if scores else 0.0
                ev.results = results
                db2.commit()
        except Exception as e:
            ev = db2.query(EvaluationRun).filter(EvaluationRun.id == run_id).first()
            if ev:
                ev.completed_at = datetime.now(timezone.utc)
                ev.results = [{"error": str(e)}]
                db2.commit()
        finally:
            db2.close()

    background_tasks.add_task(run_eval)
    return {"run_id": run_id, "status": "RUNNING", "total_cases": len(tcs)}


@router.get("/runs")
def list_runs(db: Session = Depends(get_db), _=Depends(get_current_user)):
    runs = db.query(EvaluationRun).order_by(EvaluationRun.started_at.desc()).limit(10).all()
    return [
        {
            "id": r.id, "started_at": r.started_at.isoformat(),
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            "model_name": r.model_name, "total_cases": r.total_cases,
            "correct_root_causes": r.correct_root_causes,
            "avg_evidence_score": r.avg_evidence_score,
            "unsafe_action_count": r.unsafe_action_count,
            "results": r.results,
        }
        for r in runs
    ]


@router.get("/runs/{run_id}")
def get_run(run_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    r = db.query(EvaluationRun).filter(EvaluationRun.id == run_id).first()
    if not r:
        raise HTTPException(404, "Run not found")
    return {
        "id": r.id, "started_at": r.started_at.isoformat(),
        "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        "model_name": r.model_name, "total_cases": r.total_cases,
        "correct_root_causes": r.correct_root_causes,
        "avg_evidence_score": r.avg_evidence_score,
        "results": r.results,
    }
