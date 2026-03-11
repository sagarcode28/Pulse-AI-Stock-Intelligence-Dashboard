from typing import List, Dict, Any

def detect_Anomalies(prices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if len(prices) < 5:
        return []

    changes = []
    for i in range(1, len(prices)):
        prev_close = prices[i - 1]["close"]
        curr_close = prices[i]["close"]
        if prev_close == 0:
            continue
        pct_change = ((curr_close - prev_close) / prev_close) * 100
        changes.append({
            "index": i,
            "date": prices[i]["date"],
            "close": curr_close,
            "prev_close": prev_close,
            "pct_changes": round(pct_change, 4)
        })

    if not changes:
        return []

    values = [c["pct_changes"] for c in changes]
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std = variance ** 0.5

    if std == 0:
        return []

    anamolies = []
    for change in changes:
        z_score = (change["pct_changes"] - mean) / std
        abs_z = abs(z_score)
        if abs_z > 2.0:
            severity = "HIGH" if abs_z > 3.0 else "MEDIUM"
            direction = "SPIKE UP" if change["pct_changes"] > 0 else "DROP DOWN"
            pct_val = change["pct_changes"]
            anamolies.append({
                "date": change["date"],
                "close": change["close"],
                "prev_close": change["prev_close"],
                "pct_change": pct_val,
                "z_score": round(z_score, 4),
                "severity": severity,
                "direction": direction,
                "reason": direction + " of " + str(round(abs(pct_val), 2)) + "% (Z-score: " + str(round(z_score, 2)) + ", mean: " + str(round(mean, 2)) + ", std: " + str(round(std, 2)) + ")"
            })

    return anamolies