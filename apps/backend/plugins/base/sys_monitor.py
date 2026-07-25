import os
import sys
import platform
import psutil
from typing import Dict, Any

def handle_get_system_stats(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns system stats: CPU utilization, Memory usage, Disk space, and OS environment.
    """
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {
        "platform": platform.platform(),
        "python_version": sys.version.split()[0],
        "cpu_percent": cpu_percent,
        "memory_percent": memory.percent,
        "memory_used_mb": round(memory.used / (1024 * 1024), 2),
        "memory_total_mb": round(memory.total / (1024 * 1024), 2),
        "disk_percent": disk.percent,
        "disk_free_gb": round(disk.free / (1024 * 1024 * 1024), 2)
    }

def handle_list_processes(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Lists top processes sorted by memory consumption.
    """
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'memory_percent']):
        try:
            info = proc.info
            processes.append({
                "pid": info['pid'],
                "name": info['name'],
                "memory_percent": round(info['memory_percent'] or 0, 2)
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    sorted_procs = sorted(processes, key=lambda p: p['memory_percent'], reverse=True)[:10]
    return {
        "top_processes": sorted_procs,
        "total_active_processes": len(processes)
    }
