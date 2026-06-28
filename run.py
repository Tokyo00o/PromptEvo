#!/usr/bin/env python3
"""One-command launcher: runs backend + frontend and opens the browser.

Usage: python run.py

Starts:
  - FastAPI backend on http://localhost:8000
  - Vite dev server on http://localhost:5173
Opens browser at http://localhost:5173.
"""

import os
import subprocess
import sys
import time
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_PORT = int(os.getenv("API_PORT", "8000"))
FRONTEND_PORT = int(os.getenv("FRONTEND_PORT", "5173"))

def check_backend_ready(timeout=15):
    import urllib.request
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = urllib.request.urlopen(f"http://localhost:{BACKEND_PORT}/api/v1/health")
            if resp.status == 200:
                return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

def check_frontend_ready(timeout=15):
    import urllib.request
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = urllib.request.urlopen(f"http://localhost:{FRONTEND_PORT}")
            return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

def main():
    os.chdir(ROOT)

    # ── Set required environment variables ─────────────────────────────
    # NOTE: use assignment (=), NOT setdefault(). PowerShell inherits empty-string
    # env vars into the Python process, causing setdefault to skip them silently.
    os.environ["PROMPTEVO_DEV_DISABLE_AUTH"] = "true"
    os.environ["ALLOWED_TARGET_MODELS"]      = "mock-target,gemma2"
    os.environ["PROMPTEVO_FAST_DEBUG"]       = "true"
    os.environ["DEBERTA_ENABLED"]            = "false"
    os.environ["LOG_LEVEL"]                  = "WARNING"
    os.environ["SQLITE_CHECKPOINT_PATH"]     = os.path.join(ROOT, "checkpoints.db")

    # Wipe stale SQLite checkpointer — leftover from previous runs without
    # FAST_DEBUG can cause [Errno 22] Invalid argument on Windows.
    _cp = os.environ["SQLITE_CHECKPOINT_PATH"]
    if os.path.isfile(_cp):
        try:
            os.remove(_cp)
        except OSError:
            pass

    # ── 1. Start Backend ──────────────────────────────────────────────
    print("Starting backend...")
    backend_out = open(os.path.join(ROOT, "backend.log"), "w", encoding="utf-8")
    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "api:app", "--host", "0.0.0.0",
         "--port", str(BACKEND_PORT)],
        stdout=backend_out, stderr=subprocess.STDOUT,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
    )

    # ── 2. Start Frontend ─────────────────────────────────────────────
    frontend_dir = os.path.join(ROOT, "frontend")
    frontend = None
    if os.path.isdir(frontend_dir):
        npm = "npm.cmd" if sys.platform == "win32" else "npm"
        if os.path.isfile(os.path.join(frontend_dir, "node_modules", ".package-lock.json")):
            print("Starting frontend...")
            frontend_out = open(os.path.join(ROOT, "frontend.log"), "w", encoding="utf-8")
            frontend = subprocess.Popen(
                [npm, "run", "dev"],
                cwd=frontend_dir,
                stdout=frontend_out, stderr=subprocess.STDOUT,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
            )
        else:
            print("frontend/node_modules/ not found. Run 'cd frontend && npm install' first, or build:")
            print("  cd frontend && npm run build")
            print("(The built frontend will be served by the backend directly.)")

    # ── 3. Wait for servers and open browser ──────────────────────────
    backend_ok = check_backend_ready()
    print(f"Backend:  [{'OK' if backend_ok else 'FAIL'}] http://localhost:{BACKEND_PORT}")

    if frontend:
        frontend_ok = check_frontend_ready()
        print(f"Frontend: [{'OK' if frontend_ok else 'FAIL'}] http://localhost:{FRONTEND_PORT}")
        url = f"http://localhost:{FRONTEND_PORT}"
    else:
        url = f"http://localhost:{BACKEND_PORT}"

    if backend_ok:
        webbrowser.open(url)
        print(f"\nOpen browser at: {url}")
        print("Press Ctrl+C to stop all servers.\n")

    # ── 4. Wait for shutdown ──────────────────────────────────────────
    try:
        if frontend:
            frontend.wait()
        else:
            backend.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        for p in [backend, frontend]:
            if p and p.poll() is None:
                p.terminate()
                try:
                    p.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    p.kill()

if __name__ == "__main__":
    main()
