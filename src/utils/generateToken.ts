import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET || "superSecret";
export function generateToken(payload: any) {
  console.log(payload);
  if (payload.role === "user" || (payload.role === "merchant" && payload.id)) {
    const token = jwt.sign(payload, secret);
    return token;
  } else {
    throw new Error("Role required in the payload");
  }
}

export function generateAccessToken(payload: any) {
  if (payload.role === "user" || (payload.role === "merchant" && payload.id)) {
    {
      const token = jwt.sign(payload, secret, { expiresIn: "60m" });

      return token;
    }
  } else {
    throw new Error("Role required in the payload");
  }
}

export function generateRefreshToken(payload: any) {
  if (payload.id) {
    const token = jwt.sign(payload, secret, { expiresIn: "15d" });

    return token;
  } else {
    throw new Error("Invalid Credentials");
  }
}
