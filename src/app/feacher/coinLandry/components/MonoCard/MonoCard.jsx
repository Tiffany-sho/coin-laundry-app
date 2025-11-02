"use client";

import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import * as Icon from "./MonoCardIcon";
import Styles from "./MonoCard.module.css";
import AlertDialog from "@/app/feacher/dialog/AlertDialog";
import {
  LuChevronLeft,
  LuChevronRight,
  LuMapPin,
  LuWrench,
} from "react-icons/lu";

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

const ActionMenu = ({ coinLaundry, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleEdit = () => {
    setIsOpen(false);
    router.push(`/coinLaundry/${coinLaundry._id}/edit`);
  };

  return (
    <>
      <button className={Styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
        <Icon.CiMenuKebab size={24} />
      </button>

      {isOpen && (
        <>
          <div
            className={Styles.menuOverlay}
            onClick={() => setIsOpen(false)}
          />
          <div className={Styles.dropdownMenu}>
            <button
              className={`${Styles.menuItem} ${Styles.edit}`}
              onClick={handleEdit}
            >
              <Icon.CiEdit />
              <span>編集</span>
            </button>
            <div className={`${Styles.menuItem} ${Styles.delete}`}>
              <AlertDialog
                target={`${coinLaundry.store}店`}
                deleteAction={onDelete}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

const MonoCard = ({ coinLaundry }) => {
  useEffect(() => {
    setTimeout(() => {
      const toastInfo = sessionStorage.getItem("toast");

      if (toastInfo) {
        const toastInfoStr = JSON.parse(toastInfo);
        toaster.create(toastInfoStr);
      }
      sessionStorage.removeItem("toast");
    }, 0);
  }, []);

  const deleteAction = async () => {
    fetch(`/api/coinLaundry/${coinLaundry._id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) {
        return res.json().then((res) => {
          toaster.create({
            description: res.msg,
            type: "error",
            closable: true,
          });
        });
      }
      return res.json().then((res) => {
        toaster.create({
          description: `${res.store}店を削除しました`,
          type: "warning",
          closable: true,
        });

        redirect(`/coinLaundry/${res.id}`);
      });
    });
  };

  return (
    <div className={Styles.pageContainer}>
      <div className={Styles.cardWrapper}>
        <div className={Styles.monocontainer}>
          <ImageCarousel images={coinLaundry.images} />

          <div className={Styles.cardBody}>
            <ActionMenu coinLaundry={coinLaundry} onDelete={deleteAction} />

            <h1 className={Styles.title}>
              せんたくランド {coinLaundry.store}店
            </h1>

            <div className={Styles.locationLabel}>
              <LuMapPin />
              <span>{coinLaundry.location}</span>
            </div>

            <div className={Styles.description}>{coinLaundry.description}</div>

            <div className={Styles.sectionTitle}>
              <LuWrench />
              <span>設備</span>
            </div>

            <ul className={Styles.machineList}>
              {coinLaundry.machines.map((machine) => (
                <li key={machine.name} className={Styles.machineItem}>
                  <div className={Styles.machineTitle}>{machine.name}</div>

                  <div>
                    <div>台数:{machine.num}</div>
                    <div>価格:{machine.comment && machine.comment}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={Styles.cardFooter}>
            <Link href={`/collectMoney/${coinLaundry._id}`}>
              <button className={Styles.actionButton}>
                <Icon.PiMoney />
                <span>集金</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonoCard;
