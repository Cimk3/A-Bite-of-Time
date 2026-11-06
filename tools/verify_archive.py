"""Optional independent ZIP validation using only the Python standard library.

Run after npm run package: python tools/verify_archive.py
This verifies package structure and bytes; it does not invoke Minecraft.
"""
from pathlib import Path, PurePosixPath
from io import BytesIO
from zipfile import ZipFile
import hashlib
import json

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
VERSION = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))["version"]
ADDON = DIST / f"FoodAndTable-{VERSION}.mcaddon"


def verify():
    packs = []
    manifests = []
    pbr_sets = 0
    quiet_blocks = 0
    with ZipFile(ADDON) as outer:
        assert outer.testzip() is None, "Outer ZIP failed CRC"
        assert set(outer.namelist()) == {"FoodAndTable_BP.mcpack", "FoodAndTable_RP.mcpack"}
        for name in outer.namelist():
            data = outer.read(name)
            standalone = DIST / name.replace(".mcpack", f"-{VERSION}.mcpack")
            assert data == standalone.read_bytes(), "Nested pack differs from standalone pack"
            with ZipFile(BytesIO(data)) as archive:
                assert archive.testzip() is None, f"CRC failed: {name}"
                for filename in archive.namelist():
                    path = PurePosixPath(filename)
                    assert not path.is_absolute() and ".." not in path.parts and "\\" not in filename
                manifest = json.loads(archive.read("manifest.json"))
                assert "Food & Table" in manifest["header"]["name"]
                assert manifest["header"]["version"] == [int(x) for x in VERSION.split(".")]
                assert manifest["header"]["min_engine_version"] == [1, 26, 20]
                if any(module["type"] == "resources" for module in manifest["modules"]):
                    assert manifest["capabilities"] == ["pbr"]
                    for atlas in ("terrain_texture", "item_texture"):
                        entries = json.loads(archive.read(f"textures/{atlas}.json"))["texture_data"]
                        for key, entry in entries.items():
                            assert key.startswith("mcpe_food_")
                            pbr_file = f"{entry['textures']}.texture_set.json"
                            assert pbr_file in archive.namelist()
                            pbr = json.loads(archive.read(pbr_file))["minecraft:texture_set"]
                            assert pbr["color"] == PurePosixPath(entry["textures"]).name
                            assert "metalness_emissive_roughness" in pbr
                            pbr_sets += 1
                    for filename in archive.namelist():
                        if filename.startswith("textures/entity/mcpe_food/") and filename.endswith(".texture_set.json"):
                            pbr = json.loads(archive.read(filename))["minecraft:texture_set"]
                            prefix = str(PurePosixPath(filename).parent)
                            color = archive.read(f"{prefix}/{pbr['color']}.png")
                            mer = archive.read(f"{prefix}/{pbr['metalness_emissive_roughness']}.png")
                            assert color[16:24] == mer[16:24], "Entity MER dimensions mismatch"
                            pbr_sets += 1
                    assert "textures/blocks/glass.png" not in archive.namelist()
                    assert "textures/particle/particles.png" not in archive.namelist()
                    assert "pbr/global.json" not in archive.namelist()
                else:
                    for filename in archive.namelist():
                        if filename.startswith("blocks/") and filename.endswith(".json"):
                            block = json.loads(archive.read(filename))["minecraft:block"]
                            particles = block["components"]["minecraft:destruction_particles"]
                            assert particles == {"texture": "mcpe_food_break_dust", "tint_method": "none", "particle_count": 0}
                            quiet_blocks += 1
                for module in manifest["modules"]:
                    if module["type"] == "script":
                        assert module["entry"] in archive.namelist()
                packs.append({"name": name, "files": len(archive.namelist())})
                manifests.append(manifest)
    assert any(dep.get("uuid") == manifests[1]["header"]["uuid"] for dep in manifests[0]["dependencies"])
    build = json.loads((ROOT / "build-report.json").read_text(encoding="utf-8"))
    assert pbr_sets == build["pbrTextureSets"]
    assert quiet_blocks == build["servingVariants"] + build["tableware"] + build.get("paperCups", 0) + build["hotpots"] + build.get("bottleProps", 0) + build["stations"] + build["crops"] + build.get("legacyElectronics", build.get("electronics", 0)) - build.get("refrigerators", 0) + build.get("refrigeratorParts", 0) + build.get("restaurantAccessories", 0) + build.get("legacyOfficeStationery", build.get("officeStationery", 0)) + build.get("homeDecor", 0) + build.get("scenarioProps", 0) + build.get("patch071Props", 0) + build.get("patch072Props", 0) + build.get("patch073Props", 0) + build.get("patch074Props", 0) + build.get("patch080Props", 0) + build.get("patch082Props", 0)
    for line in (DIST / "SHA256SUMS.txt").read_text(encoding="utf-8").splitlines():
        checksum, name = line.split("  ", 1)
        assert hashlib.sha256((DIST / name).read_bytes()).hexdigest() == checksum
    with ZipFile(DIST / f"FoodAndTable-source-{VERSION}.zip") as source:
        assert source.testzip() is None, "Source ZIP failed CRC"
        assert json.loads(source.read("package.json"))["version"] == VERSION
        assert "AGENTS.md" in source.namelist()
        assert "src/decor-runtime.ts" in source.namelist()
        assert "src/electronics-catalog.ts" in source.namelist()
        assert len([f for f in source.namelist() if f.startswith("assets/electronics/") and f.endswith(".png")]) == 2 * (build.get("legacyElectronics", build["electronics"]) - build["refrigerators"])
        assert len([f for f in source.namelist() if f.startswith("assets/posters/originals/") and f.endswith(".png")]) == 12
        assert len([f for f in source.namelist() if f.startswith("assets/posters/masters/") and f.endswith(".png")]) == build["advertisements"]
    report = {"status": "passed", "outerCRC": "passed", "nestedCRC": "passed", "standaloneMatchesNested": True,
              "checksums": "passed", "packs": packs, "totalPackFiles": sum(p["files"] for p in packs), "pbrTextureSets": pbr_sets,
              "customBlocksWithoutDestructionDebris": quiet_blocks, "sourceCRC": "passed", "sourceArtworks": len(list((ROOT / "assets/posters/originals").glob("*.png"))), "advertisements": build["advertisements"], "digitalScreens": build.get("digitalScreens", 0), "gameEngineTested": False}
    (ROOT / "archive-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Archive validation passed: {report['totalPackFiles']} nested pack files, all CRCs and SHA-256 checksums match.")


if __name__ == "__main__":
    verify()
