# -*- coding: utf-8 -*-
"""
嚴格驗證 data.js 中所有 8 大單元、120 道題目的完整性與品質
"""
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def validate():
    with open('data.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 檢查亂碼
    if '\ufffd' in content:
        raise ValueError("檢測到替換字元 \\ufffd 亂碼！")

    # 檢查是否有殘留的舊版 HTML 標籤或屬性字串
    bad_patterns = ['cloze-input', 'cloze_input', 'placeholder=', 'autocomplete=', '{input']
    for p in bad_patterns:
        if p in content:
            raise ValueError(f"檢測到可疑的 HTML 標籤/屬性代碼字串殘留：{p}")

    # 抓取 QUEST_DATA JSON
    m = re.search(r'const QUEST_DATA\s*=\s*(\{.*?\});\s*const QUEST_LEVELS', content, re.DOTALL)
    if not m:
        raise ValueError("無法抓取 QUEST_DATA 物件！")
    
    data = json.loads(m.group(1))
    units = data['units']
    print(f"總單元數：{len(units)} (預期 8)")
    assert len(units) == 8, f"單元數錯誤：{len(units)}"

    grand_total = 0
    errors = []

    for u_idx, u in enumerate(units):
        u_id = u.get('unitId')
        u_title = u.get('unitTitle')
        questions = u.get('questions', [])
        q_count = len(questions)
        grand_total += q_count
        print(f"\n[單元 {u_idx+1}] {u_id} - {u_title}：共 {q_count} 題")

        if q_count != 15:
            errors.append(f"單元 {u_id} 題目數為 {q_count}，非 15 題！")

        for q_idx, q in enumerate(questions):
            qid = q.get('qId', f'Unit{u_idx+1}-Q{q_idx+1}')
            q_type = q.get('type')
            level = q.get('level')
            scenario = q.get('scenario', '')
            prompt = q.get('prompt', '')
            ans = q.get('answer')
            accepted = q.get('accepted', [])
            options = q.get('options', [])
            hint = q.get('hint', '')
            exp = q.get('explanation', '')

            # 檢查必備欄位
            if not scenario: errors.append(f"[{qid}] 缺少生活情境 scenario")
            if not prompt: errors.append(f"[{qid}] 缺少任務挑戰 prompt")
            if not ans: errors.append(f"[{qid}] 缺少答案 answer")
            if not hint: errors.append(f"[{qid}] 缺少提示 hint")
            if not exp: errors.append(f"[{qid}] 缺少解析 explanation")

            # 檢查前10題為基礎，後5題為挑戰
            if q_idx < 10 and level != '基礎':
                print(f"  提醒：[{qid}] 序號第 {q_idx+1} 題難度為 {level} (建議為基礎)")
            elif q_idx >= 10 and level != '挑戰':
                print(f"  提醒：[{qid}] 序號第 {q_idx+1} 題難度為 {level} (建議為挑戰)")

            # 選擇題檢查
            if q_type == 'choice':
                if len(options) != 4:
                    errors.append(f"[{qid}] 選擇題選項數非 4 個：現有 {len(options)} 個")
                if ans not in options:
                    errors.append(f"[{qid}] 選擇題答案 \"{ans}\" 不在 options 選項列表中！")

            # 填空題檢查
            elif q_type == 'cloze':
                if not accepted:
                    errors.append(f"[{qid}] 克漏字填空缺少 accepted 接受答案清單！")
                if ans not in accepted:
                    errors.append(f"[{qid}] 填空題答案 \"{ans}\" 未包含在 accepted 清單中！")

            # 第一題特別防呆校驗
            if qid == 'U11-01':
                expected_keys = ['T', 't', 'Ctrl+Shift+T', 'ctrl+shift+t']
                for ek in expected_keys:
                    if ek not in accepted:
                        errors.append(f"[{qid}] 第一題 accepted 缺少常見答案格式：{ek}")

    print(f"\n==========================================")
    print(f"全題庫累計檢驗總題數：{grand_total} 題")
    if errors:
        print(f"❌ 發現 {len(errors)} 個問題：")
        for e in errors:
            print("  - " + e)
        raise ValueError(f"題庫未通過驗證，共有 {len(errors)} 個錯誤！")
    else:
        print("✅ 恭喜！全部 8 大單元、120 道題目嚴格檢驗 100% 通過！零錯誤、零漏洞！")

if __name__ == '__main__':
    validate()
