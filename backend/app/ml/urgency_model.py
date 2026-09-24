import re
from typing import Dict, Any, Tuple, List


CRITICAL_SIGNALS = [
    (r"\b(outage|down|system down|service unavailable|crash|all users affected|complete failure)\b", "Severe system availability issue", 0.40),
    (r"\b(payment fail|checkout broken|cannot charge|unable to pay|revenue loss|billing blocked)\b", "High revenue/transaction impact", 0.35),
    (r"\b(security breach|data leak|unauthorized access|exploit|cve|hacked)\b", "Critical security implication", 0.45),
    (r"\b(multiple customers|thousands of users|all clients|production down)\b", "Broad customer blast radius", 0.30),
    (r"\b(asap|urgent|emergency|immediately|blocker|critical)\b", "Explicit emergency language", 0.20),
]

HIGH_SIGNALS = [
    (r"\b(slow|degraded|intermittent|partially working|timeout)\b", "Service degradation", 0.15),
    (r"\b(cannot login|password reset fail|2fa not working)\b", "Single user account lockout", 0.20),
    (r"\b(deadline|time sensitive|today)\b", "Time-sensitive operational constraint", 0.15),
]

LOW_SIGNALS = [
    (r"\b(question|inquiry|how to|feedback|documentation|format|invoice format)\b", "Informational inquiry", -0.20),
]


class UrgencyDetector:
    """
    Hybrid urgency detection engine combining pattern matching, signal extraction,
    and business rule scoring.
    """

    def detect(
        self,
        subject: str,
        description: str,
        priority: str = "MEDIUM",
        customer_tier: str = "STANDARD",
    ) -> Tuple[str, float, float, List[str], str]:
        """
        Returns:
            (urgency, urgency_score, confidence, detected_signals, explanation)
        """
        text = f"{subject} {description}".lower()
        base_score = 0.35  # Default medium baseline
        detected_signals: List[str] = []

        # Check critical signals
        for pattern, label, weight in CRITICAL_SIGNALS:
            if re.search(pattern, text):
                base_score += weight
                detected_signals.append(label)

        # Check high signals
        for pattern, label, weight in HIGH_SIGNALS:
            if re.search(pattern, text):
                base_score += weight
                detected_signals.append(label)

        # Check low/informational signals
        for pattern, label, weight in LOW_SIGNALS:
            if re.search(pattern, text):
                base_score += weight
                detected_signals.append(label)

        # Customer tier bonus
        tier_upper = (customer_tier or "STANDARD").upper()
        if tier_upper in ["ENTERPRISE", "VIP"]:
            base_score += 0.15
            detected_signals.append(f"High-tier customer status ({tier_upper})")

        # Clamp between 0.05 and 0.99
        urgency_score = round(min(0.99, max(0.05, base_score)), 3)

        # Categorize
        if urgency_score >= 0.75:
            urgency = "CRITICAL"
            explanation = "Critical urgency: Outage, direct payment/checkout failure, or security risk detected"
        elif urgency_score >= 0.50:
            urgency = "HIGH"
            explanation = "High urgency: Operational blocker or multi-user impact identified"
        elif urgency_score >= 0.30:
            urgency = "MEDIUM"
            explanation = "Standard urgency: Typical operational or product support issue"
        else:
            urgency = "LOW"
            explanation = "Low urgency: Informational query or standard inquiry"

        confidence = 0.90 if len(detected_signals) > 0 else 0.75
        return urgency, urgency_score, confidence, detected_signals, explanation
