import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaBlockProps {
  images: { src: string; alt: string }[];
  caption?: string;
}

export function MediaBlock({ images, caption }: MediaBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return null;

  return (
    <section className="border-b-4 border-foreground">
      <div className="relative">
        <div className="h-56 w-full overflow-hidden">
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        </div>

        {hasMultiple && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-3 border-foreground bg-background/90 transition-all hover:bg-background active:scale-95"
              style={{ borderWidth: "3px" }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={3} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-3 border-foreground bg-background/90 transition-all hover:bg-background active:scale-95"
              style={{ borderWidth: "3px" }}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={3} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 border-2 border-foreground transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-background/80"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {caption && (
        <div className="border-t-2 border-foreground bg-muted/50 px-4 py-2">
          <p className="font-body text-xs italic text-muted-foreground">{caption}</p>
        </div>
      )}
    </section>
  );
}
