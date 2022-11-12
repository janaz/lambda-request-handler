const fastifyV4Handler = (app: any) =>
  new Promise((resolve, reject) => {
    app.ready((err: Error) => {
      if (err) {
        reject(err)
      } else {
        resolve(app.routing)
      }
    })
  })

export default fastifyV4Handler
