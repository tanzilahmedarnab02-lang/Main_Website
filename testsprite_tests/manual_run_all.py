import glob
import json
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).parent
TEST_FILES = sorted(glob.glob(str(ROOT / "TC*.py")))
TIMEOUT_SECONDS = 120
RESULTS_PATH = ROOT / "manual_test_results.json"


def run_one(test_path: str) -> dict:
    started = time.time()
    name = Path(test_path).name
    try:
        completed = subprocess.run(
            ["python", test_path],
            cwd=str(ROOT.parent),
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
        duration = round(time.time() - started, 2)
        status = "PASSED" if completed.returncode == 0 else "FAILED"
        return {
            "test_file": name,
            "status": status,
            "exit_code": completed.returncode,
            "duration_seconds": duration,
            "stdout_tail": completed.stdout[-2000:],
            "stderr_tail": completed.stderr[-2000:],
        }
    except subprocess.TimeoutExpired as exc:
        duration = round(time.time() - started, 2)
        return {
            "test_file": name,
            "status": "TIMEOUT",
            "exit_code": None,
            "duration_seconds": duration,
            "stdout_tail": (exc.stdout or "")[-2000:],
            "stderr_tail": (exc.stderr or "")[-2000:],
        }


def main() -> None:
    results = []
    for path in TEST_FILES:
        result = run_one(path)
        results.append(result)
        print(
            f"{result['test_file']}: {result['status']} ({result['duration_seconds']}s)",
            flush=True,
        )

        # Persist progress after each test so long runs remain observable.
        progress = {
            "total": len(TEST_FILES),
            "completed": len(results),
            "passed": sum(1 for r in results if r["status"] == "PASSED"),
            "failed": sum(1 for r in results if r["status"] == "FAILED"),
            "timeout": sum(1 for r in results if r["status"] == "TIMEOUT"),
            "results": results,
        }
        RESULTS_PATH.write_text(json.dumps(progress, indent=2), encoding="utf-8")

    summary = {
        "total": len(results),
        "passed": sum(1 for r in results if r["status"] == "PASSED"),
        "failed": sum(1 for r in results if r["status"] == "FAILED"),
        "timeout": sum(1 for r in results if r["status"] == "TIMEOUT"),
        "results": results,
    }
    RESULTS_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"\nSaved results to: {RESULTS_PATH}", flush=True)


if __name__ == "__main__":
    main()
