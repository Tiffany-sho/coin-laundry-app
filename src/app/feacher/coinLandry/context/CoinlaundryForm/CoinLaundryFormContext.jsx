import { createContext, useContext, useReducer } from "react";

const initialState = {
  store: "",
  location: "",
  description: "",
  machines: [],
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
  }
};

const CoinLaundryFormContextProvider = ({ children, coinData }) => {
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
      "useCoinLaundryForm must be used within a CoinLaundryFormProvider"
    );
  }
  return context;
}

export default CoinLaundryFormContextProvider;
