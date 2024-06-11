export const shortAddress = (address: string) => {
  if (typeof address !== "string" || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
