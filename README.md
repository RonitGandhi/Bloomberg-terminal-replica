# Terminal Pro

Bloomberg Terminal-inspired financial dashboard built with Next.js.

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Fill in local environment variables in `.env.local`:

```env
FINNHUB_API_KEY=your_finnhub_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
HF_TOKEN=your_hugging_face_token
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

3. Start the app:

```bash
pnpm dev
```

4. Open `http://localhost:3000`.

## Notes

- `FINNHUB_API_KEY` is required for quotes, search, profiles, indices, and news.
- `ALPHA_VANTAGE_API_KEY` is required for non-intraday chart ranges.
- `HF_TOKEN` is required for the AI insights panel.
- `HUGGINGFACE_MODEL` is optional and defaults to `meta-llama/Llama-3.1-8B-Instruct`.
