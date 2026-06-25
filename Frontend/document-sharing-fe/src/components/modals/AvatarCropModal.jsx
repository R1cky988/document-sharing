import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Move, User } from "lucide-react";

export function AvatarCropModal({ onClose, onSave }) {
  const [step, setStep] = useState("pick"); // "pick" | "crop"
  const [imgSrc, setImgSrc] = useState(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [posStart, setPosStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef();
  const containerRef = useRef();
  const CROP_SIZE = 240;

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImgSrc(ev.target.result);
      setStep("crop");
      setPos({ x: 0, y: 0 });
      setScale(1);
    };
    reader.readAsDataURL(file);
  };

  const onImgLoad = (e) =>
    setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });

  // Drag to reposition
  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPosStart({ ...pos });
  };

  const onMouseMove = useCallback(
    (e) => {
      if (!dragging) return;
      setPos({
        x: posStart.x + (e.clientX - dragStart.x),
        y: posStart.y + (e.clientY - dragStart.y),
      });
    },
    [dragging, dragStart, posStart]
  );

  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const imgDisplaySize = 280 * scale;

  const handleSave = () => {
    onSave(imgSrc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700/60 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
          <div>
            <h3 className="text-slate-100 font-semibold text-sm">
              {step === "pick" ? "Choose Avatar" : "Reposition Photo"}
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              {step === "pick"
                ? "Upload a photo from your device"
                : "Drag to reposition · scroll to zoom"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {step === "pick" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-4 h-48 rounded-xl border-2 border-dashed border-slate-700/60 hover:border-violet-500/60 hover:bg-violet-500/5 cursor-pointer transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <User size={22} className="text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400">
                  Click to upload a photo
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  PNG, JPG, WEBP supported
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Crop viewport */}
              <div
                ref={containerRef}
                style={{ width: CROP_SIZE, height: CROP_SIZE }}
                className="relative rounded-full overflow-hidden border-2 border-violet-500/60 shadow-lg shadow-violet-500/20 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
                onMouseDown={onMouseDown}
                onWheel={(e) => {
                  e.preventDefault();
                  setScale((s) =>
                    Math.min(3, Math.max(0.5, s - e.deltaY * 0.001))
                  );
                }}
              >
                {/* Dark overlay with circle cutout via box-shadow trick */}
                <div className="absolute inset-0 z-10 pointer-events-none rounded-full ring-[200px] ring-slate-950/70" />
                {imgSrc && (
                  <img
                    src={imgSrc}
                    onLoad={onImgLoad}
                    alt="crop preview"
                    style={{
                      width: imgDisplaySize,
                      height: imgDisplaySize,
                      objectFit: "cover",
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                    draggable={false}
                  />
                )}
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() =>
                    setScale((s) => Math.max(0.5, s - 0.1))
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="50"
                  max="300"
                  value={Math.round(scale * 100)}
                  onChange={(e) => setScale(e.target.value / 100)}
                  className="flex-1 accent-violet-500 cursor-pointer"
                />
                <button
                  onClick={() =>
                    setScale((s) => Math.min(3, s + 0.1))
                  }
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <Move size={11} /> Drag image to reposition
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          {step === "crop" && (
            <button
              onClick={() => {
                setStep("pick");
                setImgSrc(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          {step === "crop" && (
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-md shadow-violet-500/20"
            >
              Save Avatar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
