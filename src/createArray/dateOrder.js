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
      b.moneyArray.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.money);
      }, 0) -
      a.moneyArray.reduce((accumulator, currentValue) => {
        return accumulator + parseInt(currentValue.money);
      }, 0)
  );
  return newArray;
};
