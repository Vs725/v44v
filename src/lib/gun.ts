let gun: any = null;

export function getGun() {
  if (typeof window === "undefined") return null;
  
  if (!gun) {
    const Gun = require("gun");
    require("gun/sea");
    gun = Gun({
      peers: [
        "https://gun-us.herokuapp.com/gun",
        "https://gunjs.herokuapp.com/gun",
      ],
      localStorage: true,
    });
  }
  return gun;
}