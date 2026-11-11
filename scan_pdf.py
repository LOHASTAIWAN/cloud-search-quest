# -*- coding: utf-8 -*-
import pypdf
import warnings
warnings.filterwarnings('ignore')

with open('pdf_summary.txt', 'w', encoding='utf-8') as out:
    for fname, cname in [('02科技1上課本_第二章.pdf', '第二章'), ('03科技1上課本_第三章.pdf', '第三章')]:
        out.write(f"==================== {cname}: {fname} ====================\n")
        r = pypdf.PdfReader(fname)
        for i, page in enumerate(r.pages):
            try:
                txt = page.extract_text()
                # 尋找章節標題特徵
                lines = [l.strip() for l in txt.splitlines() if l.strip()]
                page_headers = []
                for l in lines:
                    if any(k in l for k in ['2-1', '2-2', '2-3', '2-4', '2-5', '3-1', '3-2', '第 1 節', '第 2 節', '第 3 節', '第 4 節', '第 5 節', '節', '章']):
                        page_headers.append(l)
                if page_headers:
                    out.write(f"Page {i+1}: {' | '.join(page_headers[:3])}\n")
            except Exception as e:
                out.write(f"Page {i+1}: Error: {e}\n")

print("Scan complete, written to pdf_summary.txt")
