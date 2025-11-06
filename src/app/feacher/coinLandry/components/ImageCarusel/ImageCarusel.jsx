import { useEffect, useState } from "react";
import Styles from "./ImageCarusel.module.css";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={Styles.imageCarousel}>
        <div className={Styles.imageSlide}>
          <img
            src="https://hhdipgftsrsmmuqyifgt.supabase.co/storage/v1/object/public/Laundry-Images/public/no-image.png"
            alt="画像なし"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={Styles.imageCarousel}>
      <div
        className={Styles.imageSlider}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className={Styles.imageSlide}>
            <img src={image.url} alt={`店舗画像 ${index + 1}`} />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            className={`${Styles.navigationButton} ${Styles.prev}`}
            onClick={goToPrevious}
          >
            <LuChevronLeft size={24} />
          </button>
          <button
            className={`${Styles.navigationButton} ${Styles.next}`}
            onClick={goToNext}
          >
            <LuChevronRight size={24} />
          </button>

          <div className={Styles.carouselControls}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${Styles.carouselDot} ${
                  index === currentIndex ? Styles.active : ""
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          <div className={Styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
