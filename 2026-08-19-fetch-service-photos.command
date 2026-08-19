#!/bin/bash
# ============================================================
#  S V Healthcare — service card photography fetcher
#  Downloads 34 licensed-free Pexels photos (one per service card)
#  into assets/img/sv/services/_raw/
#
#  HOW TO RUN
#    Double-click this file, OR in Terminal:
#      cd "<project folder>" && bash 2026-08-19-fetch-service-photos.command
#
#  Needs nothing but curl (built into macOS). Safe to re-run:
#  files that already downloaded successfully are skipped.
# ============================================================
cd "$(dirname "$0")" || exit 1
OUT="assets/img/sv/services/_raw"
mkdir -p "$OUT"

PHOTOS=(
  "root-canal-treatment 13207281"
  "dental-implants 4687905"
  "smile-designing 4971503"
  "braces-aligners 6529122"
  "crowns-bridges-dentures 6528787"
  "oral-surgery 20301624"
  "pediatric-dentistry 8224633"
  "whitening-tooth-jewellery 5622271"
  "laser-hair-reduction 3985354"
  "hydrafacial 18209809"
  "botox-fillers 7581590"
  "prp-regenerative 6629368"
  "acne-chemical-peels 6476083"
  "pigmentation-laser 4586726"
  "skin-rejuvenation 37676578"
  "hair-loss-treatment 13899821"
  "histopathology 36816507"
  "cytology 3908181"
  "cancer-diagnosis 8326303"
  "hematology 6629386"
  "biochemistry-immunology 3992932"
  "health-packages 7659573"
  "home-collection 5206949"
  "online-reports 5327916"
  "quality-assurance 34642915"
  "eye-examination 5752293"
  "cataract-clinic 31000573"
  "lasik 33828373"
  "retina-clinic 36461291"
  "glaucoma-clinic 5765830"
  "cornea-clinic 5766509"
  "pediatric-ophthalmology 28141441"
  "oculoplasty 7585309"
  "eye-technology 34093126"
)

ok=0; skip=0; fail=0; failed=""

for entry in "${PHOTOS[@]}"; do
  slug="${entry%% *}"
  id="${entry##* }"
  dest="$OUT/$slug.jpg"

  if [ -s "$dest" ] && [ "$(wc -c < "$dest")" -gt 20000 ]; then
    printf '  skip  %-28s (already downloaded)\n' "$slug"
    skip=$((skip+1))
    continue
  fi

  url="https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1000"
  code=$(curl -sSL -A "Mozilla/5.0" -o "$dest" -w "%{http_code}" --max-time 60 "$url")
  size=$( [ -f "$dest" ] && wc -c < "$dest" || echo 0 )

  if [ "$code" = "200" ] && [ "$size" -gt 20000 ]; then
    printf '  ok    %-28s %s KB\n' "$slug" "$((size/1024))"
    ok=$((ok+1))
  else
    printf '  FAIL  %-28s http=%s size=%s  (pexels id %s)\n' "$slug" "$code" "$size" "$id"
    rm -f "$dest"
    failed="$failed $slug:$id"
    fail=$((fail+1))
  fi
done

echo ""
echo "------------------------------------------------------------"
echo "  downloaded: $ok    already had: $skip    failed: $fail"
if [ "$fail" -gt 0 ]; then
  echo "  failed slugs:$failed"
  echo "  -> paste this whole summary back to Claude and it will"
  echo "     source replacement photos for the failures."
else
  echo "  All 34 photos are in $OUT"
fi
echo "  Next: tell Claude \"downloads done\" so it can crop,"
echo "  optimise to .webp and place them in assets/img/sv/services/"
echo "------------------------------------------------------------"
