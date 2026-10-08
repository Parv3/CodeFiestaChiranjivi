"""Test suite for SafePkg detector, registry, and CLI.
"""

import unittest
from safepkg.detector import (
    damerau_levenshtein_distance,
    detect_homoglyphs,
    check_keyboard_adjacency,
    analyze_package_name,
)
from safepkg.registry import fetch_metadata
from safepkg.cli import extract_package_names


class TestSafePkgDetector(unittest.TestCase):

    def test_damerau_levenshtein(self):
        # Transposition of adjacent letters (requets vs requests)
        self.assertEqual(damerau_levenshtein_distance("requets", "requests"), 1)
        self.assertEqual(damerau_levenshtein_distance("djagno", "django"), 1)
        self.assertEqual(damerau_levenshtein_distance("lodsh", "lodash"), 1)
        self.assertEqual(damerau_levenshtein_distance("same", "same"), 0)

    def test_detect_typos_pypi(self):
        candidates = analyze_package_name("requets", ecosystem="pip")
        self.assertTrue(len(candidates) > 0)
        self.assertEqual(candidates[0].intended, "requests")

        candidates_dj = analyze_package_name("djagno", ecosystem="pip")
        self.assertTrue(len(candidates_dj) > 0)
        self.assertEqual(candidates_dj[0].intended, "django")

    def test_detect_typos_npm(self):
        candidates = analyze_package_name("lodsh", ecosystem="npm")
        self.assertTrue(len(candidates) > 0)
        self.assertEqual(candidates[0].intended, "lodash")

        candidates_exp = analyze_package_name("exprss", ecosystem="npm")
        self.assertTrue(len(candidates_exp) > 0)
        self.assertEqual(candidates_exp[0].intended, "express")

    def test_detect_homoglyphs(self):
        # Cyrillic small 'a' (\u0430) instead of ASCII 'a'
        cyrillic_pandas = "p\u0430ndas"
        has_homo, normalized, details = detect_homoglyphs(cyrillic_pandas)
        self.assertTrue(has_homo)
        self.assertEqual(normalized, "pandas")

        candidates = analyze_package_name(cyrillic_pandas, ecosystem="pip")
        self.assertTrue(len(candidates) > 0)
        self.assertEqual(candidates[0].intended, "pandas")
        self.assertEqual(candidates[0].match_type, "Homoglyph Spoofing")

    def test_combosquatting_and_separators(self):
        # Combosquatting: suffix added
        candidates = analyze_package_name("requests-python", ecosystem="pip")
        self.assertTrue(len(candidates) > 0)
        self.assertEqual(candidates[0].intended, "requests")

    def test_exact_popular_package_passes(self):
        # Valid popular packages should not flag
        self.assertEqual(analyze_package_name("requests", ecosystem="pip"), [])
        self.assertEqual(analyze_package_name("express", ecosystem="npm"), [])
        self.assertEqual(analyze_package_name("lodash", ecosystem="npm"), [])

    def test_cli_package_extraction(self):
        args = ["-U", "--upgrade", "requets", "--no-cache-dir", "flask"]
        pkgs, flags = extract_package_names(args)
        self.assertEqual(pkgs, ["requets", "flask"])
        self.assertIn("-U", flags)
        self.assertIn("--upgrade", flags)
        self.assertIn("--no-cache-dir", flags)


class TestSafePkgRegistry(unittest.TestCase):

    def test_pypi_metadata(self):
        meta = fetch_metadata("requests", ecosystem="pip")
        self.assertTrue(meta.exists)
        self.assertIsNotNone(meta.age_days)
        self.assertGreater(meta.age_days, 1000)

    def test_npm_metadata(self):
        meta = fetch_metadata("express", ecosystem="npm")
        self.assertTrue(meta.exists)
        self.assertIsNotNone(meta.age_days)
        self.assertGreater(meta.age_days, 1000)


if __name__ == "__main__":
    unittest.main()
