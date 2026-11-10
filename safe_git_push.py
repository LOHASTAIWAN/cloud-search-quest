# -*- coding: utf-8 -*-
import subprocess
import sys

def run_cmd(cmd):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8')
    print("STDOUT:", res.stdout)
    if res.stderr:
        print("STDERR:", res.stderr)
    return res.returncode

commit_msg = "feat: shuffle choice options randomly (Fisher-Yates), rewrite 40 high-order thinking Google Docs worksheets with screenshot requirements, bump v4.2"

run_cmd("git add .")
ret = run_cmd(f'git commit -m "{commit_msg}"')
if ret == 0:
    push_ret = run_cmd("git push origin main")
    if push_ret == 0:
        print("SUCCESS: Pushed to GitHub main successfully!")
    else:
        print("PUSH FAILED")
else:
    print("COMMIT FAILED OR NOTHING TO COMMIT")
