const getShortWallet = function (wallet) {
  return [wallet.substring(0, 5), wallet.substring(53)];
};
const getWalletBalance = function (history) {
  let balance = 0;
  history.forEach((item) => {
    balance += item.amount;
  });
  return balance;
};

const getAverageWalletBalance = function (history, start, end) {
  let balance = 0;
  let lastTimestamp = start;
  let holdings = 0;
  history.every((item) => {
    if (item.timestamp > end) {
      return false;
    }
    if (item.timestamp > start) {
      const diff = item.timestamp - lastTimestamp;
      lastTimestamp = item.timestamp;
      holdings += balance * diff;
    }
    balance += item.amount;
    return true;
  });
  const diff = end - lastTimestamp;
  holdings += balance * diff;
  return Math.ceil(holdings / (end - start));
};

const getAssetHistoryPerWallet = function (transactions) {
  const histories = {};
  transactions.forEach((txn) => {
    if (txn['tx-type'] === 'axfer') {
      const amount = txn['asset-transfer-transaction'].amount;
      const sender = txn['sender'];
      const receiver = txn['asset-transfer-transaction'].receiver;
      const timestamp = txn['round-time'];
      if (!histories[sender]) histories[sender] = [];
      if (!histories[receiver]) histories[receiver] = [];
      histories[sender].push({ amount: amount * -1, timestamp });
      histories[receiver].push({ amount, timestamp });
    }
  });
  return histories;
};

export default { getShortWallet, getAssetHistoryPerWallet, getAverageWalletBalance, getWalletBalance };
