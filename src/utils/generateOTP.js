exports.generateOTP = (length) => {
  const characters = "0123456789";
  const charactersLength = characters.length;
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    otp += characters.charAt(randomIndex);
  }

  return otp;
};
