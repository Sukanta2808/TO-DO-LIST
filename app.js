//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sm7688744:Sukanta%402808@cluster0.to9g45c.mongodb.net/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((error) => {
    console.log("Recieved an error");
  });

const itemsSchema=mongoose.Schema({
  name:String
});

const listSchema=mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const Item=mongoose.model("Item",itemsSchema);

const List=mongoose.model("List",listSchema);

const item=new Item({
  name:"Buy food"
});
const cook=new Item({
  name:"Cook food"
});
const eat=new Item({
  name:"Eat food"
});

const defaultItems=[item,cook,eat];

app.get("/", function(req, res) {
  async function run(){
    const items=await Item.find();
    if(items.length===0)
    {
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    else
    {
    res.render("list", {listTitle: "Today", newListItems: items});
    }
  }
  run();
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:param", function(req,res){
  const listName=_.capitalize(req.params.param);
  async function bun(){
    const response=await List.findOne({name:listName});
    if(!response)
    {
      const list=new List({
        name:listName,
        items:[]
      });
      list.save();
      res.redirect('/'+listName);
    }
    else
    {
      res.render("list", {listTitle: response.name, newListItems: response.items});
    }
  }
  bun();
});

app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName=req.body.list;

  const newItem=new Item({
    name:itemName
  });

   if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } 
  else {
    async function sun(){
      const response=await List.findOne({name:listName});
        response.items.push(newItem);
        response.save();
        res.redirect('/'+listName);
    }
    sun();
   }
});

app.post("/delete", function(req, res){

  const newId = req.body.checkbox;
  const listName=req.body.list;

  async function gun(){
  if (listName === "Today") {
    await Item.deleteOne({_id:newId});
    res.redirect("/");
  } 
  else {
      const response=await List.findOne({name:listName});
        response.items.pop(await Item.findOne({_id:newId}));
        response.save();
        res.redirect('/'+listName);
  }
}
gun();
});
const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});

