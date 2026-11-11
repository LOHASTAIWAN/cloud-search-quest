# -*- coding: utf-8 -*-
import ctypes, ctypes.wintypes, subprocess

class CREDENTIAL(ctypes.Structure):
    _fields_ = [
        ('Flags', ctypes.wintypes.DWORD),
        ('Type', ctypes.wintypes.DWORD),
        ('TargetName', ctypes.wintypes.LPWSTR),
        ('Comment', ctypes.wintypes.LPWSTR),
        ('LastWritten', ctypes.wintypes.FILETIME),
        ('CredentialBlobSize', ctypes.wintypes.DWORD),
        ('CredentialBlob', ctypes.c_void_p),
        ('Persist', ctypes.wintypes.DWORD),
        ('AttributeCount', ctypes.wintypes.DWORD),
        ('Attributes', ctypes.c_void_p),
        ('TargetAlias', ctypes.wintypes.LPWSTR),
        ('UserName', ctypes.wintypes.LPWSTR),
    ]

advapi32 = ctypes.windll.advapi32
CredReadW = advapi32.CredReadW
CredReadW.argtypes = [ctypes.wintypes.LPWSTR, ctypes.wintypes.DWORD, ctypes.wintypes.DWORD, ctypes.POINTER(ctypes.POINTER(CREDENTIAL))]
CredReadW.restype = ctypes.wintypes.BOOL
CredFree = advapi32.CredFree
CredFree.argtypes = [ctypes.c_void_p]

pcred = ctypes.POINTER(CREDENTIAL)()
res = CredReadW('git:https://github.com', 1, 0, ctypes.byref(pcred))
if res:
    blob = ctypes.string_at(pcred.contents.CredentialBlob, pcred.contents.CredentialBlobSize)
    token = blob.decode('utf-16-le').strip('\x00')
    CredFree(pcred)
    
    import sys
    msg = sys.argv[1] if len(sys.argv) > 1 else 'chore: update project assets and worksheets'
    subprocess.run(['git', 'add', '.'], check=True)
    subprocess.run(['git', 'commit', '-m', msg], check=False)

    remote_url = f'https://LOHASTAIWAN:{token}@github.com/LOHASTAIWAN/cloud-search-quest.git'
    subprocess.run(['git', 'remote', 'set-url', 'origin', remote_url], check=True)
    p = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
    subprocess.run(['git', 'remote', 'set-url', 'origin', 'https://github.com/LOHASTAIWAN/cloud-search-quest.git'], check=True)
    print('STDOUT:', p.stdout)
    print('STDERR:', p.stderr)
    print('Push return code:', p.returncode)
else:
    print('Credential not found in Windows Credential Manager')
