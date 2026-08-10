import React, { useState, useEffect } from 'react';
import { ZoomIn } from 'lucide-react';

interface ImageGalleryZoomProps {
  images: string[];
}

export const ImageGalleryZoom: React.FC<ImageGalleryZoomProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string>(images?.[0] || '');

  useEffect(() => {
    if (images && images.length > 0) {
      setSelectedImage(images[0]);
    } else {
      setSelectedImage('');
    }
  }, [images]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail Strip */}
      <div className="flex md:flex-col gap-3 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-900 ${
              selectedImage === img ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'border-slate-800 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image Zoom Frame */}
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative flex-1 h-96 md:h-[450px] bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden cursor-crosshair group"
      >
        <img
          src={selectedImage}
          alt="Selected Product"
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
              : undefined
          }
        />

        <div className="absolute top-4 right-4 bg-slate-950/70 backdrop-blur-md p-2 rounded-xl text-slate-300 text-xs flex items-center space-x-1 border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4 text-indigo-400" />
          <span>Hover to Zoom</span>
        </div>
      </div>
    </div>
  );
};
