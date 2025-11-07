"use client";

import { useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import Link from "next/link";
import * as Icon from "./MonoCardIcon";
import Styles from "./MonoCard.module.css";
import { LuMapPin, LuWrench } from "react-icons/lu";
import ImageCarousel from "../ImageCarusel/ImageCarusel";
import ActionMenu from "../ActionMenu/ActionMenu";

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

  return (
    <div className={Styles.pageContainer}>
      <div className={Styles.cardWrapper}>
        <div className={Styles.monocontainer}>
          <ImageCarousel images={coinLaundry.images} />

          <div className={Styles.cardBody}>
            <ActionMenu id={coinLaundry.id} store={coinLaundry.store} />

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
            <Link href={`/collectMoney/${coinLaundry.id}/newData`}>
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
