import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

def generate_stock_insight(ticker : str, prices: list, anomalies: list) -> dict:
    """
        Send price History + Anomalies to Gemini
    """

    if(len(prices) >= 2):
        first_close = prices[0]["close"]
        last_close = prices[-1]["close"]
        overall_change = ((last_close - first_close) / first_close) * 100
        highest = max(p["high"] for p in prices)
        lowest = min(p["low"] for p in prices)
        avg_volume = sum(p["volume"] for p in prices) // len(prices)
    else:
        return { "error" : "Not Enough Prices provided" }
    
    anomaly_summary = "None detected"
    print(anomalies)
    if anomalies:
        anomaly_summary  = ", ".join(
            f"{a['date']} ({a['direction']}, {a['pct_change']}%)" for a in anomalies[:3] #max 3
        )
    
    prompt = f"""
You are a professional stock market analyst. Analyze the following data for {ticker}:

PRICE SUMMARY (Last {len(prices)} trading days):
- Start price: ${first_close:.2f}
- End price: ${last_close:.2f}
- Overall change: {overall_change:.2f}%
- 30-day high: ${highest:.2f}
- 30-day low: ${lowest:.2f}
- Average daily volume: {avg_volume:,}

ANOMALIES DETECTED:
{anomaly_summary}

Based on this data, respond ONLY with a valid JSON object (no markdown, no backticks) in exactly this format:
{{
  "trend": "Bullish" or "Bearish" or "Neutral",
  "risk_level": "Low" or "Medium" or "High",
  "price_target_hint": "brief one-line price expectation",
  "summary": "Exactly 2 sentences. First sentence describes the recent price action. Second sentence gives a forward-looking outlook.",
  "key_observation": "One specific insight about volume, anomalies, or price pattern"
}}
"""
    
    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        
        parsed = json.loads(raw_text)
        return parsed
    except json.JSONDecodeError:
        return {
            "trend" : "neutral",
            "risk_level" : "medium",
            "summary" : response.text,
            "price_target_hint": "N/A",
            "key_observation": "Could not parse structured response"
        }
    except Exception as e:
        error_msg = str(e)


        if "429" in error_msg or "quota" in error_msg.lower():
            trend = "Bullish" if overall_change > 0 else "Bearish" if overall_change < -2 else "Neutral"
            risk = "High" if abs(overall_change) > 10 else "Medium" if abs(overall_change) > 3 else "Low"

            return {
                "trend": trend,
                "risk_level": risk,
                "price_target_hint": f"Watch the ${highest:.2f} resistance and ${lowest:.2f} support levels",
                "summary": (
                    f"{ticker} moved {overall_change:+.2f}% over the last {len(prices)} trading days, "
                    f"ranging from ${lowest:.2f} to ${highest:.2f}. "
                    f"{'Anomalous activity detected on ' + anomalies[0]['date'] + ' suggesting heightened volatility.' if anomalies else 'No major anomalies detected, price action appears stable.'}"
                ),
                "key_observation": (
                    f"Average daily volume of {avg_volume:,} — "
                    f"{'above-average volume on anomaly days signals institutional interest.' if anomalies else 'volume consistent with normal trading patterns.'}"
                ),
                "source": "computed" 
            }

        return {"error": error_msg}