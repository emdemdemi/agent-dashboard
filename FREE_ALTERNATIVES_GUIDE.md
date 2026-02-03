# FREE LLM Alternatives for OpenClaw (No More Limits!)

## Your Current Setup
- **Model**: `ollama/kimi-k2.5:cloud` (hitting usage limits)
- **Provider**: Ollama with cloud-based Kimi model

---

## 🏆 OPTION 1: Truly Free Local Models (Best Option - ZERO Cost)

### Step 1: Install Ollama (if not already)
```powershell
# Windows (PowerShell as Admin)
winget install Ollama.Ollama

# Or download from: https://ollama.com/download
```

### Step 2: Pull FREE Local Models
These run 100% locally on your hardware - NO API limits EVER:

```bash
# Small & fast (good for most tasks) - 2-4GB VRAM
ollama pull llama3.2

# Larger, smarter models (need 8-16GB+ VRAM)
ollama pull qwen2.5:14b
ollama pull mistral
ollama pull gemma2:9b
ollama pull phi4

# For coding tasks
ollama pull codellama
ollama pull qwen2.5-coder:14b
```

### Step 3: Switch OpenClaw to Local Model
```powershell
# Set llama3.2 as default (FASTEST, smallest)
openclaw models set ollama/llama3.2

# Or use a larger model if you have GPU memory
openclaw models set ollama/qwen2.5:14b
openclaw models set ollama/mistral
openclaw models set ollama/gemma2:9b
```

### Step 4: Verify the Switch
```powershell
openclaw models status
```

---

## 🌐 OPTION 2: OpenRouter FREE Tier

### What You Get (Actually Free, Not Trial):
- **20 requests/minute** limit
- **200 requests/day** limit
- Access to models like: `openrouter/free`, `stepfun/step-3.5-flash:free`, etc.

### Setup OpenRouter in OpenClaw:

1. **Get Free API Key**: https://openrouter.ai/keys (no credit card!)

2. **Add to OpenClaw config** (`~/.openclaw/openclaw.json`):
```json
{
  "models": {
    "providers": {
      "openrouter": {
        "api": "openai-completions",
        "apiKey": "YOUR_OPENROUTER_API_KEY",
        "baseUrl": "https://openrouter.ai/api/v1",
        "models": [
          {
            "id": "openrouter/free",
            "name": "OpenRouter Free",
            "contextWindow": 200000,
            "maxTokens": 4096,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          }
        ]
      }
    }
  }
}
```

3. **Use OpenRouter's auto-selected free model**:
```powershell
openclaw models set openrouter/openrouter/free
```

Or use specific free models:
```powershell
openclaw models set openrouter/stepfun/step-3.5-flash:free
openclaw models set openrouter/arcee-ai/trinity-large-preview:free
```

---

## ⚡ OPTION 3: Groq Cloud (FAST Free Tier)

### What You Get:
- **20 requests/minute**
- **1,000,000 tokens/day**
- **Blazing fast** (tokens/second)
- Models: Mixtral, Llama 3.1/3.2, Gemma 2

### Setup Groq:

1. **Get Free API Key**: https://console.groq.com/keys (no credit card!)

2. **Add to OpenClaw config**:
```json
{
  "models": {
    "providers": {
      "groq": {
        "api": "openai-completions",
        "apiKey": "YOUR_GROQ_API_KEY",
        "baseUrl": "https://api.groq.com/openai/v1",
        "models": [
          {
            "id": "llama-3.2-90b-vision-preview",
            "name": "Llama 3.2 90B",
            "contextWindow": 128000,
            "maxTokens": 8192,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          },
          {
            "id": "mixtral-8x7b-32768",
            "name": "Mixtral 8x7B",
            "contextWindow": 32768,
            "maxTokens": 8192,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          },
          {
            "id": "gemma2-9b-it",
            "name": "Gemma 2 9B",
            "contextWindow": 8192,
            "maxTokens": 4096,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          }
        ]
      }
    }
  }
}
```

3. **Switch to Groq**:
```powershell
openclaw models set groq/llama-3.2-90b-vision-preview
# or
openclaw models set groq/mixtral-8x7b-32768
```

---

## 🔧 OPTION 3: Reduce Token Usage (Quick Win)

Edit `~/.openclaw/openclaw.json` and add these settings:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/llama3.2"
      },
      "completionParams": {
        "maxTokens": 2048,
        "temperature": 0.7
      },
      "contextManagement": {
        "maxHistoryMessages": 10,
        "maxContextTokens": 8000,
        "summarizeThreshold": 6000
      }
    }
  }
}
```

### Key optimizations:
| Setting | Effect |
|---------|--------|
| `maxTokens: 2048` | Cap response length |
| `maxHistoryMessages: 10` | Limit conversation memory |
| `maxContextTokens: 8000` | Truncate old context |
| `summarizeThreshold: 6000` | Auto-summarize long chats |

---

## 🎯 Quick Fix: Copy-Paste Solution

Want the FASTEST fix? Run these commands:

```powershell
# 1. Pull a free local model
ollama pull llama3.2

# 2. Switch OpenClaw to it
openclaw models set ollama/llama3.2

# 3. Verify
openclaw models status
```

**Done!** You now have unlimited, free AI with no rate limits.

---

## 📊 Model Comparison (Local Options)

| Model | Size | Speed | Quality | VRAM Needed |
|-------|------|-------|---------|-------------|
| llama3.2 | 3B | ⚡⚡⚡ | ⭐⭐⭐ | 4GB |
| qwen2.5:7b | 7B | ⚡⚡ | ⭐⭐⭐⭐ | 8GB |
| mistral | 7B | ⚡⚡ | ⭐⭐⭐⭐ | 8GB |
| gemma2:9b | 9B | ⚡⚡ | ⭐⭐⭐⭐ | 10GB |
| phi4 | 14B | ⚡ | ⭐⭐⭐⭐⭐ | 16GB |
| qwen2.5:14b | 14B | ⚡ | ⭐⭐⭐⭐⭐ | 16GB |

---

## 🔄 Full OpenClaw Config Example

Create/edit: `C:\Users\Emir\.openclaw\openclaw.json`

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/llama3.2"
      },
      "subagents": {
        "maxConcurrent": 4
      },
      "completionParams": {
        "maxTokens": 2048,
        "temperature": 0.7
      },
      "contextManagement": {
        "maxHistoryMessages": 10,
        "maxContextTokens": 8000
      }
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN",
      "dmPolicy": "pairing",
      "groupPolicy": "allowlist",
      "streamMode": "partial"
    }
  },
  "gateway": {
    "auth": {
      "mode": "token",
      "token": "your-token-here"
    },
    "bind": "loopback",
    "mode": "local",
    "port": 18789
  },
  "models": {
    "providers": {
      "ollama": {
        "api": "openai-completions",
        "apiKey": "ollama-local",
        "baseUrl": "http://127.0.0.1:11434/v1",
        "models": [
          {
            "id": "llama3.2",
            "name": "Llama 3.2",
            "contextWindow": 131072,
            "maxTokens": 4096,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          },
          {
            "id": "qwen2.5:14b",
            "name": "Qwen 2.5 14B",
            "contextWindow": 131072,
            "maxTokens": 8192,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          },
          {
            "id": "mistral",
            "name": "Mistral 7B",
            "contextWindow": 32768,
            "maxTokens": 8192,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          }
        ]
      },
      "groq": {
        "api": "openai-completions",
        "apiKey": "YOUR_GROQ_API_KEY_HERE",
        "baseUrl": "https://api.groq.com/openai/v1",
        "models": [
          {
            "id": "llama-3.2-90b-vision-preview",
            "name": "Groq Llama 3.2 90B",
            "contextWindow": 128000,
            "maxTokens": 8192,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          }
        ]
      },
      "openrouter": {
        "api": "openai-completions",
        "apiKey": "YOUR_OPENROUTER_KEY_HERE",
        "baseUrl": "https://openrouter.ai/api/v1",
        "models": [
          {
            "id": "openrouter/free",
            "name": "OpenRouter Free",
            "contextWindow": 200000,
            "maxTokens": 4096,
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 }
          }
        ]
      }
    }
  }
}
```

---

## ✅ Final Recommendation

**For now:** Use `llama3.2` locally - it's completely free, private, and has no limits.

**When you need more power:** Set up Groq (fastest) or OpenRouter (most variety) as fallbacks.

**Commands to run now:**
```powershell
ollama pull llama3.2
openclaw models set ollama/llama3.2
openclaw gateway restart
```

Happy hacking! 🦞
