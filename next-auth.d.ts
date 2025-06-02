import type { Account } from "next-auth";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken` */
  interface JWT {
    auth: Account;
  }
}
