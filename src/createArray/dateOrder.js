export const newerOrder = (array) => {
  const newArray = [...array].sort((a, b) => b.date - a.date);
  return newArray;
};

export const olderOrder = (array) => {
  const newArray = [...array].sort((a, b) => a.date - b.date);
  return newArray;
};

export const incomeOrder = (array) => {
  const newArray = [...array].sort(
    (a, b) =>
      b.fundsArray.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.funds);
      }, 0) -
      a.fundsArray.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.funds);
      }, 0)
  );
  return newArray;
};
