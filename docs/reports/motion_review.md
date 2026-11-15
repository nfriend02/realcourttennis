# Motion Review (2026-11-09)

All 132 motion clips (3 characters × back / front × 22 clips) were checked against
09_Flow Prompt Full Set for each object.md (action, stroke side, timing) and the game's needs.
Tools: npm run motion:audit (measurement + frame grids), hand review stored in tools/motion/motion.review.json.
Machine output: docs/reports/motion_audit.md.

## Result summary

| Area | Finding | Fix in the game data |
|---|---|---|
| Stroke side (fh / bh) | All forehand / backhand clips swing on the correct side in both views | — |
| Swing timing | Contact 0.05–0.3 s later than the scripted 2.0 s (fh) / 0.9 s (bh); backswing peak at 1.8–2.1 s instead of 1.6 s | Per-clip markers from frame review; segments include take-back and full follow-through |
| Serve | Toss 0.9–1.1 s, contact 2.1–2.35 s (scripted 0.8 / 2.2) | Per-clip markers |
| Smash | char_03 front contacts at 1.85 s (others 2.05–2.25 s) | Per-clip markers |
| reach_bh char_01 back | Generated as a forehand-side reach | Excluded → game uses bh_mid |
| run_right back (all 3) | Body faces screen-left for the whole clip | Excluded → game mirrors run_left |
| Side / forward runs | Mostly no repeating stride cycle; several turn toward the camera near the end; feet drift up to 30 % of body height | Clean range per clip, pingpong playback where no cycle exists, crossfade for small seams, per-frame foot stabilization |
| run_right char_02 front, run_back char_03 back / front | Contain a racket swing mid-clip | Range limited to the running part |
| Reactions (victory / defeat / point / walk_in / split) | Action present; active window trimmed automatically | Auto segments |

## Optional regeneration in Flow (better quality, not required)

These clips work in the game through the fixes above, but a regenerated clip would look better:

1. char_01/back/reach_bh, then char_01/02/03 back/run_right. The game currently substitutes another clip.
2. Side runs with no stride cycle (most run_left / run_right). For Flow, add "the same two-step cycle repeats twice, identical pose at 1.0 s and 2.0 s, the body never turns".
3. char_02/front/run_right, char_03/back/run_back and char_03/front/run_back contain a racket swing. Add "no racket swing, racket stays in the ready position".

After you put a new mp4 into raw_assets/images_src/motion/..., run npm run motion:audit -- char_0N/view --grid. Then check the markers in the grid and update motion.review.json if they changed. Finally, run npm run motion:audit -- --write and npm run motion -- char_0N/view.
