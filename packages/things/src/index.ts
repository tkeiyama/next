import fastify from 'fastify'
import mercurius, { IResolvers } from 'mercurius'
import {codegenMercurius, gql} from 'mercurius-codegen'
import {Thing} from './graphql/generated'

const app = fastify({logger:true})

let data: Thing[] = [
  {
    id: '1',
    title: "One",
    description: "foooo",
    isDone: false,
    until: "2022-12-31"
  },
  {
    id: '2',
    title: "Two",
    description: "Bar",
    isDone: true,
    until: "2022-10-10"
  },
  {
    id: '3',
    title: "Three",
    description: "Bazzzzzzzzz",
    isDone: false,
    until: "2022-08-01"
  }
] 

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
    getThingById(id: String): Thing!
  }

  type Mutation {
    createThing(title: String!, description: String, until: String): Thing!
    updateThing(id: String!, title: String, description: String, isDone: Boolean, until: String): Thing!
    deleteThing(id: String!): Thing!
  }
`

const resolvers: IResolvers = {
  Query: {
    getThings: () => {
      return data
    },
    getThingById: (_, {id}) => {
      return data.filter((thing) => thing.id === id)[0]
    }
  },
  Mutation: {
    createThing: (_, {title, description, until}) => {
      const thing: Thing = {
        id: `${++data.length}`,
        title: title,
        description: description ?? "",
        isDone: false,
        until: until ?? ""
      }
      data = [...data, thing]
      return thing
    },
    updateThing: (_, {id,title,description,isDone,until}) => {
      const numberId = Number(id)
      const thing = {
        id,
        title: data[numberId].title !== title && title !== undefined ? title : data[numberId].title,
        description: data[numberId].description !== description && description !== undefined ? description : data[numberId].description,
        isDone: data[numberId].isDone !== isDone && isDone !== undefined  ? isDone : data[numberId].isDone,
        until: data[numberId].until !== until && until !== undefined ? until : data[numberId].until,
      }
      data[numberId] = thing

      return thing
    },
    deleteThing: (_, {id}) => {
      data = data.filter((thing) => thing.id !== id)
      console.log(data)

      return data[Number(id)]
    }
  }
}

codegenMercurius(app, {
  targetPath: './src/graphql/generated.ts'
}).catch(console.error)

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
})

app.get('/', (_, rep) => {
  rep.send({hello: 'world'})
})

app.listen(3000, (err, addr) => {
  if(err) {
    app.log.error(err)
    process.exit(1)
  } else {
    console.log(`Listening at ${addr}`)
  }
})
