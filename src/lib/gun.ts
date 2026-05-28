import Gun from "gun";
import "gun/sea";

let gun: any;

export function getGun() {
  if (typeof window === "undefined") return null;
  if (!gun) {
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