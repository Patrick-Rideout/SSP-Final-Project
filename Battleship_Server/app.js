const express = require('express')
const app = express()
const port = 3000
const battleshipRoutes = require('./routes/battleship.route');

app.use(express.json());
app.use('/battleship', battleshipRoutes);

app.get('/', (req, res) => {
  res.send('Battleship Server Running')
})

app.listen(port, () => {
  console.log(`Battleship listening on port ${port}`)
})