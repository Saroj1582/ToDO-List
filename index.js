import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import _ from "lodash";

mongoose.connect("mongodb+srv://saroj-user:Test123@cluster0.zukclpm.mongodb.net/todolistDB");

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema(
    {
        itemName: String
        
    }
);

const Homelist = mongoose.model("Homelist", itemSchema);

const listSchema = new mongoose.Schema(
    {
        name: String,
        list: [itemSchema]
    }
);

const List = mongoose.model("List", listSchema);


app.get("/", async (req, res) => {
    
    // var options = {  weekday: 'long', month: 'long', day: 'numeric'}
    // var today = new Date().toLocaleTimeString("en-US", options);
    try {
        const result = await Homelist.find({});
       
        res.render("list.ejs", {listTitle: "Today", listItems: result});
    } catch (error) {
        console.log(error);
    }
    
});

app.get("/:listTitle", async (req, res) => {

    const listTitle = _.capitalize(req.params.listTitle);
    
    try {
        const result = await List.findOne({name: listTitle});
        // console.log(result);
        if (result!=null) {
            res.render("list.ejs", {listTitle: listTitle, listItems: result.list});
        } else {
            res.render("list.ejs", {listTitle: listTitle, listItems:[]});
        }
        
    } catch (error) {
        console.log(error);
    }
    
})

app.post("/", async (req, res) => {

        // console.log(req.body);
    const item = new Homelist(
        {
            itemName: req.body.newItem
        }
    );

    if (req.body.listName=="Today") {
        item.save();
        res.redirect("/");
    } else {
        try {
            const result = await List.findOne({name: req.body.listName});
            console.log(result);
            if (result!=null) {
                result.list.push(item);
                result.save();
            } else {
                const newlist = new List(
                    {
                        name: req.body.listName,
                        list: item
                    }
                );
                newlist.save();
            }
        } catch (error) {
            console.log(error);
        }

        res.redirect("/" + req.body.listName);
    }

});



app.post("/delete", async (req, res) => {
    // console.log(req.body);
    if (req.body.listName=="Today") {
        const result = await Homelist.findByIdAndDelete(req.body.itemId);
        console.log(result);
        res.redirect("/");
    } else {
        try {
            const result = await List.findOneAndUpdate({name: req.body.listName}, {$pull: {list: {_id: req.body.itemId}}});
            console.log(result);
            res.redirect("/" + req.body.listName);
            // result.list.forEach(element => {
            //     if(element._id == req.body.itemId){
            //         result.list.pull(element);
            //         result.save();
            //         res.redirect("/" + req.body.listName);
            //     }
            // });
        } catch (error) {
            console.log(error);
        }
    }
    
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})