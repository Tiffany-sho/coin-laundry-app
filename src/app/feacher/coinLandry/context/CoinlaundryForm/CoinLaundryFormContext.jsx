"use client";

import { createContext, useContext, useReducer } from "react";

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
        (machine) => machine.name === action.payload.newMachine,
      );
      if (alreadyMachine.length === 0) {
        return {
          ...state,
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
