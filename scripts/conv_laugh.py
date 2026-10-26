import sys, soundfile as sf, numpy as np
src, dst = sys.argv[1], sys.argv[2]
d, sr = sf.read(src, dtype="float32")
if d.ndim > 1: d = d.mean(axis=1)
# normaliza, corta silêncio nas pontas
peak = np.abs(d).max() or 1.0
d = d / peak * 0.95
idx = np.where(np.abs(d) > 0.01)[0]
d = d[max(0, idx[0]-200): idx[-1]+2000]
sf.write(dst, d, sr, subtype="PCM_16")
print("dur", round(len(d)/sr, 2), "s; sr", sr, "; bytes", __import__("os").path.getsize(dst))
