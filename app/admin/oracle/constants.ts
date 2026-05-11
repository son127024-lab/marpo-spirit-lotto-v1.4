export const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: "Basic",
    price: "Free",
    drawCondition: "3 Ads = 1 Draw",
    rechargeTime: 4, // 5시간에서 4시간으로 단축
  },
  PREMIUM: {
    name: "Premium",
    price: "1 Pi",
    freeDraws: 5,
    afterFree: "1 Ad = 1 Draw",
    rechargeTime: 4, // 4시간마다 5회 충전
    perks: ["Annual Airdrop Chance"],
  },
  VIP: {
    name: "VIP",
    price: "3 Pi",
    freeDraws: 10,
    rechargeTime: 4, // 4시간마다 10회 충전
    perks: ["Monthly No-Lose Game", "10,000 Ω Annual Reward", "50% Fee Subsidy"],
  }
};