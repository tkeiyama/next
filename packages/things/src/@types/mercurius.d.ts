import { Prisma, PrismaClient } from "@prisma/client";
import { FastifyContext, FastifyReply } from "fastify";

declare module "mercurius" {
  export interface MercuriusContext extends Mer {
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  }
}
