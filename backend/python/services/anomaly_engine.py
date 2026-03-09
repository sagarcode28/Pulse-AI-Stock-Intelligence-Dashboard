from typing import List, Dict, Any

def detect_Anomalies(prices : List[Dict[str, Any]]) -> List[Dict[str, Any]] : 
    """
        Logic:
        calculate daily % change for each day: (close - prev_close) / prev_close * 100
        calculate mean and standard deviation of all % change 
        z score : (value - mean)/std deviation
        |z - score| >  2.0 : unusal : Means that day the % change is far from its normal
    """

    if(len(prices) < 5):
        return []
    
    # Calculate Daily % change
    changes = []

    # For loop is started from 0 : Because the first Price is not Considered
    for i in range(1, len(prices)):
        prev_close = prices[i - 1]["close"]
        curr_close = prices[i]["close"]

        if(prev_close == 0):
            continue

        pct_change = (((curr_close - prev_close)/prev_close) * 100)

        #Changes are Appended to the List
        changes.append({
            "index" : i,
            "date" : prices[i]["date"],
            "close" : curr_close,
            "prev_close" : prev_close,
            "pct_changes" : round(pct_change, 4)
        })
    
    # changes Array is Blank 
        if not changes:
            return []
    
    # Calculate Means and Standard Deviation:
    values = [c["pct_changes"] for c in changes]
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std = variance ** 0.5

    if std == 0:
        return []
    
    # Calculate z - index of Each Day and flag anamolies
    anamolies = []
    for change in changes:
        z_score = (change["pct_changes"] - mean) / std
        abs_z = abs(z_score)

        if abs_z > 2.0 :
            if abs_z > 3.0:
                severity = "HIGH"
            else:
                severity = "MEDIUM"
            
            direction = "SPIKE UP" if change["pct_changes"] > 0 else "DROP DOWN"

            anamolies.append({
                "date": change["date"],
                "close" : change["close"],
                "prev_close" : change["prev_close"],
                "pct_change": change["pct_changes"],
                "z_score" : round(z_score, 4),
                "severity" : severity,
                "direction" : direction,
                "reason" : f"{direction} of {abs(change["pct_changes"]):.2f}% "
                           f"(Z-score : {z_score:.2f}, mean : {mean:.2f}, std : {std:.2f})"
            })


    return anamolies