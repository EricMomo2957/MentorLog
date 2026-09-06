import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, Trash2, Check, X } from 'lucide-react';

interface DigitalSignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSignature: (signatureDataUrl: string) => void;
    initialSignature?: string | null;
}

export const DigitalSignatureModal = ({
    isOpen,
    onClose,
    onSaveSignature,
    initialSignature
}: DigitalSignatureModalProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialSignature || null);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        setHasDrawn(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        setPreviewUrl(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                const dataUrl = uploadEvent.target?.result as string;
                setPreviewUrl(dataUrl);
                setHasDrawn(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (previewUrl) {
            onSaveSignature(previewUrl);
            localStorage.setItem('mentorlog_supervisor_signature', previewUrl);
            onClose();
            return;
        }

        const canvas = canvasRef.current;
        if (canvas && hasDrawn) {
            const dataUrl = canvas.toDataURL('image/png');
            onSaveSignature(dataUrl);
            localStorage.setItem('mentorlog_supervisor_signature', dataUrl);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-indigo-600" />
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Supervisor Digital e-Signature</h3>
                            <p className="text-[11px] text-slate-500">Sign or upload verified signature for DTR Form 48</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drawing / Image Container */}
                <div className="space-y-2">
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl relative overflow-hidden flex items-center justify-center h-44">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Signature Preview" className="max-h-36 max-w-full object-contain p-2" />
                        ) : (
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={176}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-full cursor-crosshair touch-none"
                            />
                        )}

                        {!hasDrawn && !previewUrl && (
                            <p className="absolute text-slate-400 text-xs pointer-events-none italic">
                                Draw your signature here with your mouse or touchpad...
                            </p>
                        )}
                    </div>

                    {/* Signature Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                        <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-slate-600 hover:text-rose-600 flex items-center gap-1 font-semibold py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Clear</span>
                        </button>

                        <label className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image (PNG/JPG)</span>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasDrawn && !previewUrl}
                        className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <Check className="w-4 h-4" />
                        <span>Save & Apply Signature</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DigitalSignatureModal;
