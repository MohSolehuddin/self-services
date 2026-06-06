#!/usr/bin/env python3
"""
Script untuk upload dokumentasi Sourcebot ke Trilium Notes dengan HTML format
"""

import urllib.request
import json
import re

# Konfigurasi Trilium
SERVER_URL = "https://notes.msytc.my.id"
ETAPI_TOKEN = "FD6H38XUrNFL_Q86mh+9w3FeKkzpATPHRSHPKFOpqN75fwH6HPuqQ4vk="

def markdown_to_html(markdown):
    """Konversi markdown sederhana ke HTML"""
    html = markdown
    
    # H1
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # H2
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    
    # H3
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    
    # H4
    html = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    
    # Bold **text**
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    
    # Code blocks ```code```
    html = re.sub(r'```(\w*)\n([\s\S]*?)\n```', r'<pre><code class="language-\1">\2</code></pre>', html)
    
    # Inline code `code`
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Links [text](url)
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)
    
    # Bullet points
    lines = html.split('\n')
    new_lines = []
    in_list = False
    for line in lines:
        if re.match(r'^- ', line):
            if not in_list:
                new_lines.append('<ul>')
                in_list = True
            new_lines.append('<li>' + re.sub(r'^- ', '', line) + '</li>')
        else:
            if in_list:
                new_lines.append('</ul>')
                in_list = False
            new_lines.append(line)
    if in_list:
        new_lines.append('</ul>')
    
    html = '\n'.join(new_lines)
    
    # Line breaks (consecutive lines without headers)
    html = re.sub(r'(</h\d>|</li>|</ul>|</code>|</pre>|^$)\n+(?!#|-)', r'\1<br>', html, flags=re.MULTILINE)
    
    # Paragraphs for non-markup lines
    lines = html.split('\n')
    new_lines = []
    for i, line in enumerate(lines):
        if line and not line.startswith('<') and not line.startswith('#') and not line.startswith('-'):
            if i > 0 and not re.match(r'^<h\d>', lines[i-1]) and not re.match(r'^<h\d>', lines[i-2] if i > 1 else ''):
                line = '<p>' + line + '</p>'
            else:
                line = '<p>' + line + '</p>'
        new_lines.append(line)
    
    html = '\n'.join(new_lines)
    
    return html

def create_note():
    url = f"{SERVER_URL}/etapi/create-note"
    
    # Markdown content
    markdown = """# Sourcebot - Self-Hosted Code Understanding

Dokumentasi teknis untuk Sourcebot yang di-hosting di server Mr. Soleh.

## Overview

Sourcebot adalah alat self-hosted untuk memahami kode Anda. Anda dapat bertanya tentang kode Anda dan mendapatkan jawaban Markdown yang kaya dengan sitasi inline.

## Status

**Status:** Running (v4.17.2)

**Endpoint:**
- **Public:** https://sourcebot.msytc.my.id
- **Local:** http://localhost:3003

## Infrastruktur

### Container
- **Image:** `ghcr.io/sourcebot-dev/sourcebot:latest`
- **Container Name:** `sourcebot`
- **Restart Policy:** `always`

### Ports
- `3003:3000` - Web UI

### Environment Variables
- `CONFIG_PATH=/data/config.json`
- `AUTH_SECRET=***`
- `DATABASE_URL=postgresql://${SB_DB_USER}:${SB_DB_PASSWORD}@postgres_sb:5432/${SB_DB_USER:-sourcebot}`
- `REDIS_URL=redis://redis_sb:6379`
- `GITHUB_PAT=***`

### Volumes
- `./data/sourcebot/config.json:/data/config.json:ro`
- `sourcebot-data:/data/.sourcebot`

## GitHub Connection

### Configuration (data/sourcebot/config.json)

```json
{
  "$schema": "https://raw.githubusercontent.com/sourcebot-dev/sourcebot/main/schemas/v3/index.json",
  "connections": {
    "github-mohsolehuddin": {
      "type": "github",
      "token": { "env": "GITHUB_PAT" },
      "url": "https://github.com",
      "users": ["MohSolehuddin"]
    }
  }
}
```

### Sync Schedule
- **Reindex:** Setiap 1 jam (`reindexIntervalMs: 3600000`)
- **Connection Sync:** Setiap 24 jam (`resyncConnectionIntervalMs: 86400000`)

## Docker Compose

Lihat file lengkap di: https://github.com/MohSolehuddin/self-services/blob/main/docker-compose.yaml

```bash
# Start
cd /home/moh_solehuddin190805/server-app && docker compose up -d sourcebot

# Stop
cd /home/moh_solehuddin190805/server-app && docker compose down sourcebot

# Logs
docker logs sourcebot -f
```

## Keamanan

- **GITHUB_PAT** disimpan di `.env` (tidak di-Git)
- Sourcebot menggunakan environment variable untuk secret token
- No sensitive data di repo GitHub

## Referensi

- [Sourcebot Docs](https://docs.sourcebot.dev)
- [GitHub Repo](https://github.com/sourcebot-dev/sourcebot)
- [Configuration Schema](https://raw.githubusercontent.com/sourcebot-dev/sourcebot/main/schemas/v3/index.json)

## Backup & Sync

- Git sync: `scripts/github-sync.sh`
- Backup: `scripts/backup.sh`
- Cron: Setiap 1 jam

## Troubleshooting

### Config Error

```bash
docker logs sourcebot | grep -i config
```

### Connection Sync

```bash
docker logs sourcebot | grep -i connection
```

### Restart Container

```bash
cd /home/moh_solehuddin190805/server-app && docker compose restart sourcebot
```"""
    
    # Convert to HTML
    html_content = markdown_to_html(markdown)
    
    # Buat payload JSON
    payload = json.dumps({
        "parentNoteId": "root",
        "title": "Sourcebot - Self-Hosted Code Understanding",
        "type": "text",
        "content": html_content
    }, ensure_ascii=False).encode('utf-8')
    
    # Buat request
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Authorization": ETAPI_TOKEN,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Trilium-Client/1.0"
        },
        method="POST"
    )
    
    try:
        # Kirim request
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            note_id = result.get('note', {}).get('noteId', 'N/A')
            print(f"Note created successfully!")
            print(f"ID: {note_id}")
            print(f"URL: {SERVER_URL}/notes/{note_id}")
            return result
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        print(f"Response: {e.read().decode('utf-8')}")
        return None
    except urllib.error.URLError as e:
        print(f"URL Error: {e.reason}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    print("=== Trilium ETAPI Sourcebot Documentation Upload ===")
    print()
    
    # Upload note
    create_note()
