import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

class AuthMiddleware {
  private JWT_SECRET = process.env.JWT_SECRET || "";

  validateAdmin: RequestHandler = (req, res, next) => {
    const auth = req.headers["authorization"];
    if (!auth) throw new Error("Authorization failed");

    const hash = jwt.verify(auth, this.JWT_SECRET);

    if (!hash) throw new Error("Authorization failed");

    console.log(hash);
    next();
  };

  validateUser: RequestHandler = (req, res, next) => {
    const auth = req.headers["authorization"];
    if (!auth) throw new Error("Authorization failed");

    const hash = jwt.verify(auth, this.JWT_SECRET);

    if (!hash) throw new Error("Authorization failed");
    console.log(hash);
    next();
  };
}

export default AuthMiddleware;
