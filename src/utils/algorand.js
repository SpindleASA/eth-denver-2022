const getShortWallet = function (wallet) {
  return [wallet.substring(0, 5), wallet.substring(53)];
};

export default { getShortWallet };
