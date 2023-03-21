// 个位数小于10，返回个位数前面加零
const toZero: (n: number) => string = (n) => {
  if (n < 10) {
    return "0" + n;
  } else {
    return "" + n;
  }
};

export { toZero };
