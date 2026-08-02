"use client";

import { createContext, useContext, useReducer } from "react";

/** ⚠️ サーバ（reconcileStorePaymentMethods）と同じ値にすること */
export const MAX_PAYMENT_METHODS = 10;
export const MAX_PAYMENT_METHOD_NAME = 20;

const initialState = {
  store: null,
  location: null,
  description: null,
  machines: [
    {
      name: "洗濯乾燥機",
      num: 0,
      comment: "",
    },
    {
      name: "乾燥機",
      num: 0,
      comment: "",
    },
    {
      name: "洗濯機",
      num: 0,
      comment: "",
    },
    {
      name: "スニーカー洗濯機",
      num: 0,
      comment: "",
    },
    {
      name: "ソフター自販機",
      num: 0,
      comment: "",
    },
  ],
  existingPictures: [],
  newPictures: [],
  /**
   * 店舗ごとの支払方法（PayPay・クレジットカードなど）。
   *
   * ⚠️ **現金は入れない。** 常に存在する暗黙の方法として扱い、現金額は
   *    `totalFunds − sum(cashless[].amount)` で出す。行として持つと
   *    「現金を無効化できる」「二重に数える」の両方が起きる。
   *
   * ⚠️ 無効にしたもの（`isActive: false`）も残す。物理削除すると過去の
   *    `collect_funds.cashless` の参照先が消える。
   */
  paymentMethods: [],
  msg: "",
  isLoading: false,
};
const CoinLaundryFormContext = createContext(null);

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FORM_DATA":
      return { ...state, [action.payload.field]: action.payload.value };
    case "UPDATE_MACHINE_COUNT":
      return {
        ...state,
        machines: state.machines.map((machine) => {
          return machine.name === action.payload.name
            ? {
                ...machine,
                num: Math.max(0, machine.num + action.payload.amount),
              }
            : machine;
        }),
      };
    case "ADD_MACHINES":
      const alreadyMachine = state.machines.filter(
        (machine) => machine.name === action.payload.newMachine.name,
      );
      if (alreadyMachine.length !== 0) {
        return {
          ...state,
          msg: "同じ機器名が含まれています",
        };
      } else {
        return {
          ...state,
          machines: [...state.machines, action.payload.newMachine],
        };
      }

    case "ADD_MACHINES_COMMENT":
      return {
        ...state,
        machines: state.machines.map((machine) => {
          return machine.name === action.payload.name
            ? {
                ...machine,
                comment: action.payload.comment,
              }
            : machine;
        }),
      };
    case "ADD_NEW_PICTURE":
      return {
        ...state,
        newPictures: [...state.newPictures, action.payload.newFileItem],
      };
    case "REMOVE_PICTURE":
      URL.revokeObjectURL(action.payload.removeFileItem.url);
      return {
        ...state,
        newPictures: state.newPictures.filter(
          (item) => item.id !== action.payload.removeFileItem.id,
        ),
      };
    case "REMOVE_EXISTING_PICTURE":
      return {
        ...state,
        existingPictures: state.existingPictures.filter(
          (item) => item.url !== action.payload.url,
        ),
      };
    case "ADD_PAYMENT_METHOD": {
      const name = String(action.payload.name ?? "").trim();
      if (!name) return state;
      // ⚠️ 現金は暗黙の方法。同名の行を作ると集金画面に「現金」が 2 つ並び二重計上になる
      if (name === "現金") {
        return { ...state, msg: "「現金」は既定で記録されるため追加できません" };
      }
      if (name.length > MAX_PAYMENT_METHOD_NAME) {
        return { ...state, msg: `名前は ${MAX_PAYMENT_METHOD_NAME} 文字以内にしてください` };
      }

      /*
        ⚠️ **使わなくなったものとも突き合わせる。** 同じ名前で作り直そうとしたときは
           新しく足さず**戻す**。サーバも名前で突き合わせるので、足しても
           UNIQUE(laundry_id, name) に当たって「すでにあります」になる。
      */
      const existing = state.paymentMethods.find((m) => m.name === name);
      if (existing) {
        if (existing.isActive) return { ...state, msg: "同じ支払方法が含まれています" };
        return {
          ...state,
          msg: "",
          paymentMethods: state.paymentMethods.map((m) =>
            m.name === name ? { ...m, isActive: true } : m
          ),
        };
      }

      // ⚠️ 上限は「使用中」の数で見る。使わなくなったものは含めない
      if (state.paymentMethods.filter((m) => m.isActive).length >= MAX_PAYMENT_METHODS) {
        return { ...state, msg: `支払方法は ${MAX_PAYMENT_METHODS} 件までです` };
      }

      return {
        ...state,
        msg: "",
        paymentMethods: [...state.paymentMethods, { name, isActive: true }],
      };
    }
    /*
      一覧から外す。⚠️ **配列からは落とさない。** 過去の集金（collect_funds.cashless）が
      その名前を参照しているので、`isActive: false` のまま送って無効化として扱わせる。
      落とすと画面から消えて**戻せなくなる**（サーバは無効化するので実害は無いが、
      使い直したくなったときに手がかりが無い）。
    */
    case "RETIRE_PAYMENT_METHOD":
      return {
        ...state,
        msg: "",
        paymentMethods: state.paymentMethods.map((m) =>
          m.name === action.payload.name ? { ...m, isActive: false } : m
        ),
      };
    case "RESTORE_PAYMENT_METHOD": {
      if (state.paymentMethods.filter((m) => m.isActive).length >= MAX_PAYMENT_METHODS) {
        return { ...state, msg: `支払方法は ${MAX_PAYMENT_METHODS} 件までです` };
      }
      return {
        ...state,
        msg: "",
        paymentMethods: state.paymentMethods.map((m) =>
          m.name === action.payload.name ? { ...m, isActive: true } : m
        ),
      };
    }
    case "SET_MSG":
      return {
        ...state,
        msg: action.payload,
      };
    case "SET_ISLOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      throw new Error("Unknown action type");
  }
};

const CoinLaundryFormContextProvider = ({
  children,
  coinData = initialState,
}) => {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    store: coinData.store || "",
    location: coinData.location || "",
    description: coinData.description || "",
    machines: coinData.machines || initialState.machines,
    existingPictures: coinData.images || [],
    // getStores / getStore が attachPaymentMethods で貼り付けている
    paymentMethods: coinData.paymentMethods || [],
  });
  return (
    <CoinLaundryFormContext.Provider value={{ state, dispatch }}>
      {children}
    </CoinLaundryFormContext.Provider>
  );
};

export function useCoinLaundryForm() {
  const context = useContext(CoinLaundryFormContext);
  if (context === null) {
    throw new Error(
      "useCoinLaundryForm must be used within a CoinLaundryFormProvider",
    );
  }
  return context;
}

export default CoinLaundryFormContextProvider;
