#!/bin/bash
# Hälsa Breathe — synthesized ambient loops (all ffmpeg-generated, no third-party audio).
# 60 s seamless-ish loops, 128 kbps mp3. Modulation frequencies chosen so 60 s
# contains an integer number of cycles (loop continuity).
set -euo pipefail
cd "$(dirname "$0")"

ff() { ffmpeg -hide_banner -loglevel error -y "$@"; }

# 1) White noise — gentle, slightly rolled-off
ff -f lavfi -i "anoisesrc=color=white:amplitude=0.7:duration=60:seed=11" \
   -af "lowpass=f=12000,volume=0.45" -b:a 128k beyaz-gurultu.mp3

# 2) Pink noise
ff -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:duration=60:seed=22" \
   -af "volume=0.55" -b:a 128k pembe-gurultu.mp3

# 3) Rain — hiss layer + low rumble
ff -f lavfi -i "anoisesrc=color=white:amplitude=0.8:duration=60:seed=33" \
   -f lavfi -i "anoisesrc=color=brown:amplitude=0.8:duration=60:seed=34" \
   -filter_complex "[0]highpass=f=500,lowpass=f=9000,tremolo=f=0.5:d=0.10,volume=0.5[hiss];[1]lowpass=f=240,volume=0.4[rumble];[hiss][rumble]amix=inputs=2:duration=shortest,volume=1.4" \
   -b:a 128k yagmur.mp3

# 4) Waves — brown noise with slow swells (f=0.1 → 6 cycles / 60 s)
ff -f lavfi -i "anoisesrc=color=brown:amplitude=0.9:duration=60:seed=44" \
   -af "lowpass=f=1100,tremolo=f=0.1:d=0.8,volume=1.6" -b:a 128k dalga.mp3

# 5) Forest — breeze + leaf rustle (no fake birds)
ff -f lavfi -i "anoisesrc=color=pink:amplitude=0.8:duration=60:seed=55" \
   -f lavfi -i "anoisesrc=color=white:amplitude=0.6:duration=60:seed=56" \
   -filter_complex "[0]lowpass=f=1600,tremolo=f=0.1:d=0.35,volume=0.5[breeze];[1]highpass=f=2600,lowpass=f=7000,tremolo=f=0.25:d=0.55,volume=0.18[leaves];[breeze][leaves]amix=inputs=2:duration=shortest,volume=1.5" \
   -b:a 128k orman.mp3

# 6) Campfire — low fire body + flickering crackle band
ff -f lavfi -i "anoisesrc=color=brown:amplitude=0.9:duration=60:seed=66" \
   -f lavfi -i "anoisesrc=color=white:amplitude=0.9:duration=60:seed=67" \
   -filter_complex "[0]lowpass=f=420,tremolo=f=6:d=0.25,volume=0.55[body];[1]highpass=f=2800,tremolo=f=9:d=0.9,agate=threshold=0.20:ratio=8:attack=0.3:release=45,volume=0.5[crackle];[body][crackle]amix=inputs=2:duration=shortest,volume=1.5" \
   -b:a 128k kamp-atesi.mp3

# 7) Keys ("Piyano") — slow music-box arpeggio, A-minor pentatonic.
# 8-note pattern over 30 s, played twice; a 60 s silence base pins the length.
NOTE() { echo "sine=frequency=$1:duration=6.8,afade=t=in:st=0:d=0.012,afade=t=out:st=0.3:d=6.4:curve=exp,volume=$2"; }
FREQS=(220.00 261.63 329.63 392.00 440.00 329.63 293.66 246.94)
VOLS=(0.30 0.26 0.26 0.24 0.22 0.24 0.26 0.28)
INPUTS=(-f lavfi -i "anullsrc=r=44100:cl=mono:d=60")
FILTER=""
MIXIN=""
for k in 0 1; do
  for i in "${!FREQS[@]}"; do
    idx=$((1 + k * 8 + i))
    delay=$(( (k * 30000) + (i * 3750) ))
    INPUTS+=(-f lavfi -i "$(NOTE "${FREQS[$i]}" "${VOLS[$i]}")")
    FILTER+="[$idx]adelay=${delay}[n$idx];"
    MIXIN+="[n$idx]"
  done
done
ff "${INPUTS[@]}" \
  -filter_complex "${FILTER}[0]${MIXIN}amix=inputs=17:duration=first:normalize=0,aecho=0.7:0.55:90|160:0.30|0.18,lowpass=f=5200,volume=1.7" \
  -b:a 128k piyano.mp3

ls -la *.mp3
