#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch translation script to translate all remaining untranslated tags in Danbooru Prompt Builder
using Google Translate API with ACG, Anime, and NSFW domain adaptations.
"""

import os
import sys
import time
import json
import re
import urllib.request
import urllib.parse
import yaml

TAGS_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'tags')
CHINESE_PATTERN = re.compile(r'[\u4e00-\u9fff]')

def translate_batch(texts, max_retries=3, delay=0.3):
    if not texts:
        return []

    # Domain specific term pre-processing
    preprocessed = []
    for t in texts:
        p = t.replace('_', ' ').strip()
        p = re.sub(r'\bpussy\b', 'vagina', p, flags=re.IGNORECASE)
        p = re.sub(r'\bcock\b', 'penis', p, flags=re.IGNORECASE)
        p = re.sub(r'\bdick\b', 'penis', p, flags=re.IGNORECASE)
        p = re.sub(r'\bcreampie\b', 'internal ejaculation', p, flags=re.IGNORECASE)
        p = re.sub(r'\bautofacial\b', 'self facial cum', p, flags=re.IGNORECASE)
        p = re.sub(r'\bbusty\b', 'big breasts', p, flags=re.IGNORECASE)
        preprocessed.append(p)

    payload = '\n'.join(preprocessed)
    url = f'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q={urllib.parse.quote(payload)}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as res:
                data = json.loads(res.read().decode('utf-8'))
                raw_translated = ''.join([item[0] for item in data[0] if item and item[0]])
                lines = [line.strip() for line in raw_translated.split('\n')]
                
                # If length matches exactly
                if len(lines) == len(texts):
                    # Post process
                    results = []
                    for orig, trans in zip(texts, lines):
                        # clean up
                        cleaned = trans.replace('阴茎', '丁丁/阴茎') if 'penis' in orig.lower() and '丁丁' not in trans else trans
                        cleaned = cleaned.replace('阴道', '小穴/私处') if 'pussy' in orig.lower() and '小穴' not in cleaned else cleaned
                        cleaned = cleaned.replace('射精内部', '中出/内射') if 'creampie' in orig.lower() else cleaned
                        results.append(cleaned)
                    time.sleep(delay)
                    return results
                else:
                    # Fallback single translation if batch splitting went out of sync
                    print(f"Batch count mismatch ({len(lines)} vs {len(texts)}), falling back to individual translation...")
                    results = []
                    for item in texts:
                        r = translate_batch([item], max_retries=1, delay=0.1)
                        results.append(r[0] if r else item)
                    return results
        except Exception as e:
            time.sleep(1.0 * (attempt + 1))
            if attempt == max_retries - 1:
                print(f"Translation error: {e}")
                return texts
    return texts

def main():
    print("Collecting all untranslated tags across database...")
    untranslated_by_file = {}
    total_untranslated = 0

    for root, dirs, files in os.walk(TAGS_DIR):
        for f in files:
            if not f.endswith('.yaml'):
                continue
            if 'artists-' in f:
                continue
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as fp:
                try:
                    d = yaml.safe_load(fp)
                except Exception as e:
                    continue
            if not d or 'content' not in d or not isinstance(d['content'], dict):
                continue

            missing = []
            for tag, info in d['content'].items():
                if not isinstance(info, dict):
                    continue
                name = str(info.get('name') or '')
                if not name or name == tag or not CHINESE_PATTERN.search(name):
                    missing.append(tag)

            if missing:
                untranslated_by_file[p] = missing
                total_untranslated += len(missing)

    print(f"Total untranslated tags found: {total_untranslated} across {len(untranslated_by_file)} files.")
    if total_untranslated == 0:
        print("All tags already translated!")
        return

    BATCH_SIZE = 40
    translated_count = 0

    for file_path, tags in untranslated_by_file.items():
        rel = os.path.relpath(file_path, TAGS_DIR)
        print(f"\nProcessing {rel} ({len(tags)} tags)...")

        with open(file_path, 'r', encoding='utf-8') as fp:
            d = yaml.safe_load(fp)

        # Batch translation
        for i in range(0, len(tags), BATCH_SIZE):
            chunk = tags[i:i + BATCH_SIZE]
            translations = translate_batch(chunk)
            for tag, trans in zip(chunk, translations):
                if tag in d['content'] and isinstance(d['content'][tag], dict):
                    d['content'][tag]['name'] = trans
                    translated_count += 1
            print(f"  Translated {min(i + BATCH_SIZE, len(tags))}/{len(tags)} in {rel}")

        # Save back to file
        with open(file_path, 'w', encoding='utf-8') as fp:
            yaml.dump(d, fp, allow_unicode=True, sort_keys=False, indent=2)

    print(f"\nBatch translation complete! Translated {translated_count} tags successfully.")

if __name__ == '__main__':
    main()
