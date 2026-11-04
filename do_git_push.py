import subprocess
import sys

def run(cmd_list):
    print("Running:", " ".join(cmd_list))
    res = subprocess.run(cmd_list, capture_output=True, text=True, encoding="utf-8", errors="ignore")
    if res.stdout:
        print("STDOUT:", res.stdout)
    if res.stderr:
        print("STDERR:", res.stderr)
    return res.returncode

run(["git", "add", "."])
run(["git", "commit", "-m", "fix: fix Q1 shortcut, eliminate garbled text, add skip-to-next button, 100pts base + 5 challenge questions per unit"])
ret = run(["git", "push", "origin", "main"])
sys.exit(ret)
