const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const cors = require('cors')
const io = socket(server,{
  cors:{
    origin: "*",
    methods: ["GET", 'POST']
  }
})


let foods = {
  a: "Jollof Rice",
  b: "Ogbono & Fufu",
  c: "Banga & Pounded yam",
  d: "Custard and Akara",
  e: "Nkwobi",
  f: "Moin moin",
  g: "Fried Rice",
  h: "Chicken Stew",
  i: "Ofada & plantain"
}

let currentOrder =[]

app.use(express.static('public'))

app.get('/', (req, res)=>{
  res.sendFile(__dirname + "/UI/index.html")
})

io.on('connection', (socket)=>{

  socket.emit('welcome-msg', {
    a : `Select 1 to place an order,\n
      Select 99 to checkout order,\n
    Select 97 to see current order,\n
    Select 0 to cancel order\n`
})

    //message event
    socket.on('message', (msg)=>{
      //list of available meals
      if(msg == 1){
        const items = Object.keys(foods)
        .map((key)=> `${key}: ${foods[key]}`)
        .join('\n')
        let str =  `Available items.\n ${items}.\n Select an option`
        socket.emit('response', str)
      }else if(Object.keys(foods).includes(msg)){
        //ordering a meal
        let orderInfo = {user: socket.id, meal: foods[msg]}
        currentOrder.push(orderInfo)
        socket.emit('response', `Your selected option ${foods[msg]} has been added to your orders. You can select more options or select 99 to checkout.`)
      }else if(msg == 99){
        //placing the order / checkout
        if(currentOrder.length === 0){
          socket.emit('response', `No current order. Try ordering a meal.`)
        }else if(currentOrder.length){
           socket.emit('response', "Your order has been placed successfully")
        currentOrder.length = 0
        }
      }else if(msg == 97){
        //getting current order
        if(currentOrder.length == 0){
          socket.emit('response', `No current order. Try ordering a meal.`)
        }else if(currentOrder){
         let meals = []
          for(let i = 0; i < currentOrder.length; i++){
            if(socket.id == currentOrder[i].user){
              meals.push(currentOrder[i].meal)
            }
          }
          let currentOrderString = meals.join(", ")
          socket.emit('response', `Here is your current order: \n${currentOrderString}`)
        }
        
      }else if(msg == 0){
        if(currentOrder.length == 0){
          socket.emit('response', `You haven't placed an order yet.`)
      }else if(currentOrder){ 
        let meals = []
        for(let i = 0; i < currentOrder.length; i++){
          if(socket.id == currentOrder[i].user){
            meals.push(currentOrder[i].meal)
          }
        }

        socket.emit('response', `Your order of ${meals.join(", ")} has been cancelled.`)
        currentOrder = []
        meals.length = 0
      }
       
      }else{
        socket.emit("response", "Invalid Command!!")
        socket.emit('welcome-msg', {
          a : `Select 1 to place an order,\n
            Select 99 to checkout order,\n
          Select 97 to see current order,\n
          Select 0 to cancel order\n`
      })
      }

    })
})



server.listen(process.env.PORT || 5050)