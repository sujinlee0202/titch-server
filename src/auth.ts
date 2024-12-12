import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const authRouter = Router();
const prisma = new PrismaClient();

type UserType = {
  email: string;
  password: string;
};

const JWT_SECRET_KEY = process.env.JWT_SECRET!;

const ACCESS_TOKEN_EXPIRES_IN = "2m";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

// access token 발급
const createAccessToken = (user: UserType) => {
  return jwt.sign(
    { password: user.password, email: user.email },
    JWT_SECRET_KEY,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

// Refresh Token 발급
const createRefreshToken = (user: UserType) => {
  return jwt.sign(
    { password: user.password, email: user.email },
    JWT_SECRET_KEY,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

// access token 인증 미들웨어
const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Access token required" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded; // 사용자 정보를 요청 객체에 추가
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 로그인
authRouter.post("/", async (req, res: any) => {
  const { email, password } = req.body;

  try {
    // 유저 확인
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Email이 없습니다." });
    }

    // 비밀번호 판별
    if (password !== user.password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 발급
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // httpOnly 쿠키로 JWT 전달하기
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 인증된 사용자 불러오기
authRouter.get("/profile", authenticateJWT, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user.email },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// Access Token 재발급
authRouter.get("/refresh", async (req, res: any) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET_KEY) as JwtPayload;

    // 새로운 Access Token 및 Refresh Token 발급
    const newAccessToken = createAccessToken({
      email: decoded.email,
      password: decoded.password,
    });
    const newRefreshToken = createRefreshToken({
      email: decoded.email,
      password: decoded.password,
    });

    // 새로운 Refresh Token 설정
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

export default authRouter;
