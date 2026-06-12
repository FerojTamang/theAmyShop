const REFERRAL_CODE_LENGTH = 8;
const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateReferralCode = (): string => {
  let code = "AMY";

  for (let index = 0; index < REFERRAL_CODE_LENGTH; index += 1) {
    const randomIndex = Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length);
    code += REFERRAL_CODE_ALPHABET[randomIndex];
  }

  return code;
};
