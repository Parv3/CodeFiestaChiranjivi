"""Typo detection engine using Levenshtein distance, homoglyphs,
keyboard proximity, and substitution patterns.
"""

from typing import List, Tuple, Dict, Optional
import unicodedata
from .popular_packages import get_popular_list

# Unicode homoglyphs mapping to canonical ASCII characters
HOMOGLYPH_MAP: Dict[str, str] = {
    # Cyrillic lookalikes
    "\u0430": "a",  # Cyrillic small letter a
    "\u0441": "c",  # Cyrillic small letter es
    "\u0434": "d",  # Cyrillic small letter de
    "\u0435": "e",  # Cyrillic small letter ie
    "\u0456": "i",  # Cyrillic small letter byelorussian-ukrainian i
    "\u0458": "j",  # Cyrillic small letter je
    "\u043e": "o",  # Cyrillic small letter o
    "\u0440": "p",  # Cyrillic small letter er
    "\u0455": "s",  # Cyrillic small letter dze
    "\u0445": "x",  # Cyrillic small letter ha
    "\u0443": "y",  # Cyrillic small letter u
    "\u0410": "A",  # Cyrillic capital letter A
    "\u0412": "B",  # Cyrillic capital letter Ve
    "\u0415": "E",  # Cyrillic capital letter Ie
    "\u041a": "K",  # Cyrillic capital letter Ka
    "\u041c": "M",  # Cyrillic capital letter Em
    "\u041d": "H",  # Cyrillic capital letter En
    "\u041e": "O",  # Cyrillic capital letter O
    "\u0420": "P",  # Cyrillic capital letter Er
    "\u0421": "C",  # Cyrillic capital letter Es
    "\u0422": "T",  # Cyrillic capital letter Te
    "\u0425": "X",  # Cyrillic capital letter Ha
    # Greek lookalikes
    "\u03b1": "a",  # Greek small letter alpha
    "\u03bf": "o",  # Greek small letter omicron
    "\u03bd": "v",  # Greek small letter nu
    "\u03c1": "p",  # Greek small letter rho
    # Numeric and symbol visual confusables
    "0": "o",
    "1": "l",
    "3": "e",
    "5": "s",
    "8": "b",
    "@": "a",
}

# Standard QWERTY keyboard adjacency map for mistyped adjacent keys
QWERTY_ADJACENCY: Dict[str, set] = {
    "q": {"w", "a", "s"},
    "w": {"q", "e", "a", "s", "d"},
    "e": {"w", "r", "s", "d", "f"},
    "r": {"e", "t", "d", "f", "g"},
    "t": {"r", "y", "f", "g", "h"},
    "y": {"t", "u", "g", "h", "j"},
    "u": {"y", "i", "h", "j", "k"},
    "i": {"u", "o", "j", "k", "l"},
    "o": {"i", "p", "k", "l"},
    "p": {"o", "l"},
    "a": {"q", "w", "s", "z"},
    "s": {"a", "w", "e", "d", "z", "x"},
    "d": {"s", "e", "r", "f", "x", "c"},
    "f": {"d", "r", "t", "g", "c", "v"},
    "g": {"f", "t", "y", "h", "v", "b"},
    "h": {"g", "y", "u", "j", "b", "n"},
    "j": {"h", "u", "i", "k", "n", "m"},
    "k": {"j", "i", "o", "l", "m"},
    "l": {"k", "o", "p"},
    "z": {"a", "s", "x"},
    "x": {"z", "s", "d", "c"},
    "c": {"x", "d", "f", "v"},
    "v": {"c", "f", "g", "b"},
    "b": {"v", "g", "h", "n"},
    "n": {"b", "h", "j", "m"},
    "m": {"n", "j", "k"},
    "-": {"_"},
    "_": {"-"},
}


def damerau_levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate the Damerau-Levenshtein distance between two strings.
    Handles insertions, deletions, substitutions, and adjacent transpositions.
    """
    len1, len2 = len(s1), len(s2)
    d = [[0] * (len2 + 1) for _ in range(len1 + 1)]

    for i in range(len1 + 1):
        d[i][0] = i
    for j in range(len2 + 1):
        d[0][j] = j

    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if s1[i - 1] == s2[j - 1] else 1
            d[i][j] = min(
                d[i - 1][j] + 1,        # deletion
                d[i][j - 1] + 1,        # insertion
                d[i - 1][j - 1] + cost  # substitution
            )
            # Transposition of adjacent characters
            if i > 1 and j > 1 and s1[i - 1] == s2[j - 2] and s1[i - 2] == s2[j - 1]:
                d[i][j] = min(d[i][j], d[i - 2][j - 2] + 1)

    return d[len1][len2]


def detect_homoglyphs(candidate: str) -> Tuple[bool, str, List[str]]:
    """Check if the string contains non-standard homoglyphs or visual confusables.
    Returns (has_homoglyphs, normalized_ascii_string, list_of_details).
    """
    details = []
    has_homoglyph = False
    result_chars = []

    for char in candidate:
        if char in HOMOGLYPH_MAP:
            replacement = HOMOGLYPH_MAP[char]
            # Only consider it suspicious homoglyph if it's non-ASCII or a visual numeral switch
            if ord(char) > 127:
                has_homoglyph = True
                details.append(f"Unicode character '{char}' (U+{ord(char):04X}) masquerades as '{replacement}'")
            elif char in "01358@" and candidate != replacement:
                details.append(f"Character '{char}' resembles letter '{replacement}'")
            result_chars.append(replacement)
        else:
            result_chars.append(char)

    return has_homoglyph, "".join(result_chars), details


def check_keyboard_adjacency(s1: str, s2: str) -> bool:
    """Return True if s1 and s2 differ by exactly one QWERTY keyboard slip."""
    if len(s1) != len(s2):
        return False
    diffs = []
    for c1, c2 in zip(s1.lower(), s2.lower()):
        if c1 != c2:
            diffs.append((c1, c2))
    if len(diffs) == 1:
        c1, c2 = diffs[0]
        if c2 in QWERTY_ADJACENCY.get(c1, set()) or c1 in QWERTY_ADJACENCY.get(c2, set()):
            return True
    return False


def normalize_separators(name: str) -> str:
    """Normalizes dashes, underscores, and dots to compare separator variants."""
    return name.replace("_", "-").replace(".", "-").lower()


def find_combosquatting_match(candidate: str, popular_pkg: str) -> Optional[str]:
    """Check if candidate adds suspicious prefixes or suffixes to a popular package."""
    cand = candidate.lower()
    pop = popular_pkg.lower()

    if cand == pop:
        return None

    # Common prefixes / suffixes in malicious packages
    prefixes = ["python-", "py-", "node-", "lib-", "official-", "the-"]
    suffixes = [
        "-python", "-py", "-node", "-js", "-client", "-sdk", "-api",
        "-core", "-lib", "-official", "2", "3", "-sec", "-tools"
    ]

    for p in prefixes:
        if cand == p + pop:
            return f"combosquatting prefix '{p}' added to '{pop}'"

    for s in suffixes:
        if cand == pop + s:
            return f"combosquatting suffix '{s}' added to '{pop}'"

    # Separator variation (e.g. discord_py vs discord.py)
    if normalize_separators(cand) == normalize_separators(pop) and cand != pop:
        return f"separator variation of '{pop}'"

    return None


class TypoCandidate:
    def __init__(
        self,
        suspect: str,
        intended: str,
        distance: int,
        match_type: str,
        confidence: float,
        details: str
    ):
        self.suspect = suspect
        self.intended = intended
        self.distance = distance
        self.match_type = match_type
        self.confidence = confidence
        self.details = details

    def __repr__(self):
        return f"<TypoCandidate suspect={self.suspect} intended={self.intended} score={self.confidence:.2f}>"


def analyze_package_name(package_name: str, ecosystem: str = "pip") -> List[TypoCandidate]:
    """Analyze a package name against the popular packages dataset.
    Returns a sorted list of potential typo candidates.
    """
    clean_name = package_name.strip()
    popular_list = get_popular_list(ecosystem)

    # If the user typed an exact match, check if it contains sneaky Unicode homoglyphs
    has_homoglyphs, ascii_normalized, homoglyph_notes = detect_homoglyphs(clean_name)
    if has_homoglyphs:
        for pop in popular_list:
            if ascii_normalized.lower() == pop.lower():
                return [TypoCandidate(
                    suspect=clean_name,
                    intended=pop,
                    distance=0,
                    match_type="Homoglyph Spoofing",
                    confidence=0.99,
                    details="; ".join(homoglyph_notes)
                )]

    # Exact match without homoglyph: clean and valid
    if clean_name.lower() in [p.lower() for p in popular_list]:
        return []

    candidates: List[TypoCandidate] = []

    for pop in popular_list:
        pop_lower = pop.lower()
        cand_lower = clean_name.lower()

        # Check separator variation
        if normalize_separators(cand_lower) == normalize_separators(pop_lower):
            candidates.append(TypoCandidate(
                suspect=clean_name,
                intended=pop,
                distance=1,
                match_type="Separator Substitution",
                confidence=0.92,
                details=f"Punctuation variation between '{clean_name}' and legitimate '{pop}'"
            ))
            continue

        # Check combosquatting patterns
        combo_reason = find_combosquatting_match(clean_name, pop)
        if combo_reason:
            candidates.append(TypoCandidate(
                suspect=clean_name,
                intended=pop,
                distance=abs(len(clean_name) - len(pop)),
                match_type="Combosquatting Pattern",
                confidence=0.88,
                details=f"Suspected {combo_reason}"
            ))
            continue

        # Check keyboard slip (fat-finger distance 1)
        if check_keyboard_adjacency(clean_name, pop):
            candidates.append(TypoCandidate(
                suspect=clean_name,
                intended=pop,
                distance=1,
                match_type="Keyboard Slip (QWERTY)",
                confidence=0.95,
                details=f"Single adjacent key typo on QWERTY keyboard relative to '{pop}'"
            ))
            continue

        # Edit distance (Damerau-Levenshtein)
        dist = damerau_levenshtein_distance(cand_lower, pop_lower)
        max_len = max(len(cand_lower), len(pop_lower))

        # We flag:
        # - distance 1 for names of length >= 3
        # - distance 2 for names of length >= 6
        if dist == 1 and max_len >= 3:
            confidence = 0.94 - (dist * 0.05)
            candidates.append(TypoCandidate(
                suspect=clean_name,
                intended=pop,
                distance=dist,
                match_type="Edit Distance (Levenshtein)",
                confidence=confidence,
                details=f"Close edit distance ({dist}) to popular package '{pop}'"
            ))
        elif dist == 2 and max_len >= 6:
            confidence = 0.85
            candidates.append(TypoCandidate(
                suspect=clean_name,
                intended=pop,
                distance=dist,
                match_type="Edit Distance (Levenshtein)",
                confidence=confidence,
                details=f"Edit distance of 2 to popular package '{pop}'"
            ))

    # Sort candidates by confidence descending, then distance ascending
    candidates.sort(key=lambda c: (-c.confidence, c.distance))
    return candidates
