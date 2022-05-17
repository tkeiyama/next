import fastify from 'fastify'
import mercurius from 'mercurius'

const app = fastify({logger:true})

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`

const resolvers = {
  Query: {
    add: async(_: unknown, {x,y}: {x:number,y:number}) => {
      return x+y
    }
  }
}

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
