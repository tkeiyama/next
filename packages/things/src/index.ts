import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import mercurius, { IResolvers } from "mercurius";
import { codegenMercurius, gql } from "mercurius-codegen";
import { v4 as uuidv4 } from "uuid";
import { Thing } from "./graphql/generated";

const app = fastify({ logger: true });
const prisma = new PrismaClient();

const schema = gql`
  type Thing {
    id: String
    title: String
    description: String
    isDone: Boolean
    until: String
  }
  type Query {
    getThings: [Thing!]!
    getThingById(id: String!): Thing
  }

  type Mutation {
    createThing(title: String!, description: String, until: String): Thing!
    updateThing(id: String!, title: String, description: String, isDone: Boolean, until: String): Thing!
    deleteThing(id: String!): Thing!
  }
`;

const resolvers: IResolvers = {
  Query: {
    getThings: async (_, __, ctx) => {
      return ctx.prisma.thing.findMany();
    },
    getThingById: async (_, { id }, ctx) => {
      return ctx.prisma.thing.findFirst({
        where: {
          id,
        },
      });
    },
  },
  Mutation: {
    createThing: async (_, { title, description, until }, ctx) => {
      const data = {
        id: uuidv4(),
        title,
        description: description ?? "",
        isDone: false,
        until: until ?? "",
      };
      return ctx.prisma.thing.create({
        data,
      });
    },
    updateThing: async (_, { id, title, description, isDone, until }, ctx) => {
      const oldThing = await ctx.prisma.thing.findFirst({
        where: {
          id,
        },
      });

      const newThing = {
        id,
        title: title ?? oldThing?.title,
        description: description ?? oldThing?.description,
        isDone: isDone ?? oldThing?.isDone,
        until: until ?? oldThing?.until,
      };
      return ctx.prisma.thing.update({
        where: {
          id,
        },
        data: newThing,
      });
    },
    deleteThing: async (_, { id }, ctx) => {
      return ctx.prisma.thing.delete({
        where: {
          id,
        },
      });
    },
  },
};

codegenMercurius(app, {
  targetPath: "./src/graphql/generated.ts",
}).catch(console.error);

app.register(mercurius, {
  schema,
  resolvers,
  context(_, __) {
    return { prisma };
  },
  graphiql: true,
});

app.get("/", (_, rep) => {
  rep.send({ hello: "world" });
});

app.listen(3000, (err, addr) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  } else {
    console.log(`Listening at ${addr}`);
  }
});
