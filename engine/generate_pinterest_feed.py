from utils import BASE_DIR, PUBLIC_DIR


def remove_inaccurate_merchant_feed():
    """Remove the legacy merchant feed because NGG is not the seller of record."""
    targets = [PUBLIC_DIR / "pinterest_feed.csv", BASE_DIR / "out" / "pinterest_feed.csv"]
    removed = 0
    for target in targets:
        if target.exists():
            target.unlink()
            removed += 1
    print(f"Pinterest merchant feed disabled; removed {removed} stale feed file(s). Use /rss.xml for editorial Pins.")


if __name__ == "__main__":
    remove_inaccurate_merchant_feed()
