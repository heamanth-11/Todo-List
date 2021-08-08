const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
const port = 5000;
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');
app.listen(process.env.PORT || port);
//
// var items = ["buy food", "cook food", "eat food"];
// let workItems = [];
mongoose.connect("mongodb+srv://admin-todo-app:viratkholi18@cluster0.6mcyw.mongodb.net/todoDB",{useNewUrlParser: true, useUnifiedTopology: true})
const item_schema = new mongoose.Schema({
  item:String
});
const Item = mongoose.model("item",item_schema);
const buyFood = new Item({
  item:"Welcome todo list"
});
const cookFood = new Item({
  item:"press + button to add a new item"
});
const eatFood = new Item({
  item:"<-- hit this to delete item"
});
const defaultItems = [buyFood,cookFood,eatFood];

const listSchema = new mongoose.Schema({
  name : String,
  items : [item_schema]
})
const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
    var date = new Date();
    var options = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    };
    var day = date.toLocaleDateString('en-US',options);
    Item.find(function(err,result){
       if(result.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
       else{
         console.log("default items added to db")
       }
      });
       res.redirect("/");
    }
    else{
          res.render('list' ,{ListItem:'TODAY', newitem:result});
    }
  });
});
app.get("/:CustomeListName",function(req,res){
  const customListName = _.capitalize(req.params.CustomeListName);

  
  
  List.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        const list = new List({
          name : customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);

      }
      else{
        res.render('list' ,{ListItem:foundlist.name, newitem:foundlist.items});
      }
    }
  })
})
app.post("/", function (req, res) {
    const newItem = req.body.newItem;
    const listName = req.body.list;
    const items = new Item({
      item:newItem
    });
    if(listName === "TODAY" ){
      items.save();
      res.redirect("/");
    }
    else{
      List.findOne({name:listName},function(err,found){
        if(!err){
          found.items.push(items);
          found.save();
          res.redirect("/"+listName);
        }
      })
    }
    
});
// app.get("/work", function (req, res) {
//     res.render("list", { ListItem:"Work List", newitem: workItems });
// });
app.get("/about", function (req, res) {
    res.render("about");
});
app.post("/delete" ,function(req,res){
  const cbox = req.body.delete;
  const listname = req.body.listName;
  console.log(listname);
if(listname === "TODAY"){
  Item.findByIdAndRemove(cbox,function(err,docs){
    if(!err){
      res.redirect("/");
      console.log(" deleted" +docs);
  }
});
}
else{
  List.findOneAndUpdate({name:listname},{$pull:{items:{_id:cbox}}},function(err,elements){
    if(!err){
      res.redirect("/"+listname);
    }

  });

}
});

