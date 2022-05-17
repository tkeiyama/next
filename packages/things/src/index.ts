import fastify from 'fastify'

const app = fastify({logger:true})

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
