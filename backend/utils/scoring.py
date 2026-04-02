"""
scoring.py
----------
Candidate ranking, top-pick selection, and status assignment.
Pure Python — no external dependencies.
"""

from typing import List, Dict


def rank_candidates(candidates_list: List[Dict]) -> List[Dict]:
    """
    Sort candidates by final_score descending.

    Parameters
    ----------
    candidates_list : list of candidate dicts, each must have a 'final_score' key.

    Returns
    -------
    New list sorted highest → lowest final_score.
    """
    return sorted(
        candidates_list,
        key=lambda c: float(c.get("final_score", 0)),
        reverse=True,
    )


def get_top_picks(candidates_list: List[Dict], n: int = 5) -> List[Dict]:
    """
    Return the top n candidates by final_score.

    Parameters
    ----------
    candidates_list : list of candidate dicts
    n               : number of top candidates to return (default 5)

    Returns
    -------
    Ranked list of up to n candidates.
    """
    ranked = rank_candidates(candidates_list)
    return ranked[:n]


def assign_status(score: float) -> str:
    """
    Assign a human-readable status label based on final_score.

    Thresholds
    ----------
    >= 75  → "Shortlisted"
    >= 50  → "Under Review"
    <  50  → "Rejected"
    """
    score = float(score)
    if score >= 75:
        return "Shortlisted"
    elif score >= 50:
        return "Under Review"
    else:
        return "Rejected"