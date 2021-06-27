const express = require('express')// telling the program we require express 
const app = express() // changing express to = app so it's cleaner code 
const MongoClient = require ('mongodb').MongoClient //we need this to connect to MongoDB
const PORT = 1000 //this is rhe port connection we are running on 
require('dotenv').config()


let db,  //our varible names 
    dbConnectionStr = process.env.DB_STRING,  //the link from our database on MongoDB 
    dbName = 'todo' //what we named our database 


MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true}) //.connect takes int to parameters, 1) our string that connects to the database and the other is the topology which is something that is required and is used to not get an error when using our app 
    .then(client => { //where our promise begins 
        console.log(`You are connected to ${dbName} database`) //debuggging - to show everything is connected 
        db = client.db(dbName) //grabs the connection 
    })
    .catch(err => {
        console.log(err) //to see what the actual errors might be - if there are any - debugger 
    })

//middleware - what is middleware? 
app.set('view engine', 'ejs') // sets up the ejs file  -- why view engine?
app.use(express.static('public')) // can serve up all static files 
app.use(express.urlencoded({ extended:true})) // this will allow us to pull the info out of the form 
app.use(express.json()) //this will allow us to pull the info out of the form



app.get('/', async (req, res) => {  //our main route get  -- req and res are the callbacks (request and response)
    const todoItems = await db.collection('todos').find().toArray() //new way of doing things.  goes into our collection in our database (called todos).  Finds the database and turns it into an array and then assigns it to a varible name (in this case todoItems)
    const itemsLeft = await db.collection('todos').countDocuments( //new way of doing things. Goes into our collection in our database (called todos). countDocuments is a method that exist in mongo that allows us to count the number of items that contain the value of completed "false" and stores the total in the variable of "itemsLeft"
    {completed: false}) //new way of doing things.  Looks pretty but I am not sure how it works
    res.render('index.ejs', {zebra: todoItems, left: itemsLeft}) //new way of doing things. This is how we render our elements on the page.  Zebra would be the items left and items left would be the total 
    //res.render takes in two params the first is saying where and the second is saying what 

    // hot garage -- turning into callback hell
    // db.collection('todos').find().toArray() //going to find all the objects in our collection using an array //turns our objects into an array 
    // .then(data => { //"data is the array we got back from the data base"
    //     res.render('index.ejs', {zebra: data, left: itemsLeft})  //handling what happens - in this case it is "rendering" -- responding 
    // })

})


app.post('/createTodo', (req, res ) => { // this is coming from a form that was submitted by the user and the route name is called createTodo since we are "creating something".  We have a request and response  
    console.log(req.body.todoItem) //targets the exact items you want and logs it to make sure it is working 
    db.collection('todos').insertOne({todo: req.body.todoItem, completed: false}) //.collection(todos) is going into our database and the insertOne allows us to add/insert items into the document/object  // req.body.todoItem = the item in the form/ the input The naming convetion is coming from the ejs file in the forml//"completed" has a default value of false becasue they haven't been compleetd 
        .then(result => {
            console.log('To do has been added!') //debugging 
            res.redirect('/')  //data is redirecting back to the main route 
        }) 
})


app.put('/markComplete',(req, res) => { //our route to markCompleted file.  This is the update part of our CRUD 
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{ //goes into our collection and looks for the element that needs to be updated and updates the element.  The naming convention in coming from the main.js file. 
        $set: { //this is changing the state of our property to true 
            completed: true  //changes the status in mongo from false to true
        }
    }) 
    .then(result => {
        console.log('Marked Complete') //debugging 
        res.json('Marked Complete') //This is telling us that we have completed the task request.   It doesn't have to do with the actual items in the to do list 
    })
})


app.put('/undoComplete', (req, res)=>{ //our route to undoCompleted file.  This is the update part of our CRUD 
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{ //goes into our collection and looks for the element that needs to be updated and updates the element.  The naming convention in coming from the main.js file. 
        $set: { 
            completed: false //changes the status in mongo from true back to false 
        }
    })
    .then(result =>{
        console.log('Marked Complete')  //debugging 
        res.json('Marked Complete') // This is telling us that we have completed the task request.   It doesn't have to do with the actual items in the to do list 
    })
})

app.delete('/deleteTodo', (req, res) => { //our route to the deleted part- this the D of our CRUD 
    console.log(req.body.rainbowUnicorn) //debugging 
    db.collection('todos').deleteOne({ todo: req.body.rainbowUnicorn}) //goes into our database and deletes one element that was clicked (ran from the main.js).  // naming convention is coming from main.js // this results in the target element deleting 
        .then(result => { //this is what we want to happen after the items have been completed
            console.log('Deleted To do item')  //checks to make sure things work - debugging 
            res.json('Deleted it') //the response from JSON - saying the item has been deleted 
        })
      .catch( err => console.log(err))  //what would come back if the item wasn't deleted 
})


app.listen(process.env.PORT || PORT, () => { // our port aka the line we are running our server on or Heroku port 
    console.log('Server is runnnnnnnning.  You better catch it') //logging our server to make sure we are connecting - aka a debugger
})

