from fastapi import APIRouter, Depends
from app.core.security import get_current_user
import psutil

router = APIRouter(prefix="/infrastructure", tags=["infrastructure"])


@router.get("/metrics")
def get_metrics(_=Depends(get_current_user)):
    cpu = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    net = psutil.net_io_counters()

    processes = []
    for p in sorted(
        psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent", "status"]),
        key=lambda x: x.info.get("cpu_percent") or 0,
        reverse=True,
    )[:15]:
        try:
            processes.append({
                "pid": p.info["pid"],
                "name": p.info["name"],
                "cpu_percent": round(p.info.get("cpu_percent") or 0, 2),
                "memory_percent": round(p.info.get("memory_percent") or 0, 2),
                "status": p.info.get("status", "unknown"),
            })
        except Exception:
            pass

    return {
        "cpu": {"percent": cpu, "count": psutil.cpu_count()},
        "memory": {
            "percent": mem.percent,
            "total_gb": round(mem.total / 1e9, 1),
            "used_gb": round(mem.used / 1e9, 1),
            "available_gb": round(mem.available / 1e9, 1),
        },
        "disk": {
            "percent": disk.percent,
            "total_gb": round(disk.total / 1e9, 1),
            "used_gb": round(disk.used / 1e9, 1),
            "free_gb": round(disk.free / 1e9, 1),
        },
        "network": {
            "bytes_sent_mb": round(net.bytes_sent / 1e6, 2),
            "bytes_recv_mb": round(net.bytes_recv / 1e6, 2),
        },
        "processes": processes,
    }
