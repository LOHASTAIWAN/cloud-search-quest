# -*- coding: utf-8 -*-
"""
合併生成純淨 UTF-8 data.js，包含 QUEST_DATA 與相容的 QUEST_LEVELS
"""
import json
import codecs
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def build():
    import make_dataset_part2
    import make_dataset_part3

    units = make_dataset_part2.get_all_units()
    remaining = make_dataset_part3.get_remaining_units()
    units.extend(remaining)

    print(f"Total units gathered: {len(units)}")
    total_q = sum(len(u["questions"]) for u in units)
    print(f"Total questions gathered: {total_q}")

    quest_data = {
        "title": "CyberCloud 雲端神偷特工隊 - 國中資訊科技 108 課綱互動闖關測驗",
        "version": "3.0",
        "description": "涵蓋雲端運算服務 (Ch2-1) 與資料與資訊應用專題 (Ch2-2)，包含 8 大單元、120 道生活時事題",
        "units": units
    }

    # 輸出為標準 JavaScript
    js_content = "// CyberCloud 雲端神偷特工隊 - 官方核心題庫 (純 UTF-8 編碼)\n"
    js_content += "// 包含 8 大單元、120 道貼近國中生生活與時事題（前10題基礎滿分100 + 後5題進階加分）\n\n"
    js_content += "const QUEST_DATA = " + json.dumps(quest_data, ensure_ascii=False, indent=2) + ";\n\n"
    
    # 建立 QUEST_LEVELS 兼容陣列
    compat_levels = []
    for idx, u in enumerate(units):
        compat_levels.append({
            "id": idx + 1,
            "chapter": u["category"],
            "unitCode": u["unitId"].replace("unit-", ""),
            "title": u["unitTitle"],
            "subtitle": u["description"],
            "badge": f"第 0{idx+1} 關",
            "icon": "fa-solid fa-cloud-bolt",
            "themeColor": "#38bdf8",
            "questions": u["questions"]
        })
    js_content += "const QUEST_LEVELS = " + json.dumps(compat_levels, ensure_ascii=False, indent=2) + ";\n"

    with codecs.open("data.js", "w", "utf-8") as f:
        f.write(js_content)

    print("Successfully built data.js in pure UTF-8!")

if __name__ == "__main__":
    build()
