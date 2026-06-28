@echo off
set PROMPTEVO_DEV_DISABLE_AUTH=true
set ALLOWED_TARGET_MODELS=mock-target,gemma2
set PROMPTEVO_FAST_DEBUG=true
set DEBERTA_ENABLED=false
set LOG_LEVEL=WARNING
python -m uvicorn api:app --host 0.0.0.0 --port 8000
