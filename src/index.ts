import express,{Request,Response} from "express";
import {z} from "zod";
import {PrismaClient} from "@prisma/client"
import jwt,{Jwt,JwtPayload} from "jsonwebtoken"
const prisma = new PrismaClient();
const app = express();
const jwtpasscode="9874615801"
type User ={
    name:string,
    email:string,
    password:string
}
type Todo ={
    user_id:number,
    title:string,
    description:string
}


const emailSchema=z.string().email();
const passwordSchema=z.string().min(8);

function checkUserMiddleware(req:Request,res:Response,next:()=>void) {
    var email= req.body.email;
    var password= req.body.password;
    var check= emailSchema.safeParse(email); 
    var check1= passwordSchema.safeParse(password)
    if (!(check.success&&check1.success)){
        res.status(403).send("Invalid format of creddentials");
    }
    else{
        next();
}


}
app.use(express.json());
//signup route
app.post("/signup",checkUserMiddleware,(req:Request,res:Response)=>{
    var email= req.body.email;
    var name = req.body.name;
    var password= req.body.password;
    async function dbentry(user:User){
        try {
            const result = await prisma.users.create({
                data:user,
            })
            res.status(202).send(result)
        }
        catch(err){
            res.status(404).send("Somethings up")
        }
    }
    dbentry({
        name ,
        email,
        password
    })
    
})
//login route
app.post("/signin",checkUserMiddleware,(req:Request,res:Response)=>{
    var email= req.headers.email;
    try{
        var token= jwt.sign({
            email,
        },jwtpasscode);
        res.status(200).send(token)
    }
    catch(err){
        res.status(404).send("somethings up")
    }
})
function tokenMiddleware(req:Request,res:Response,next:()=>void){
    var token = req.body.token;
    var email = req.body.email;
   
    var verify = jwt.verify( token,jwtpasscode,(err:any)=>{
      if(!err){
        next()
      }
      else{
        res.status(401).send("wrong credentials")
      }
    });
  
    }
   

//putting todos
app.post("/todos",tokenMiddleware,(req:Request,res:Response)=>{
    var user_id= req.body.userid;
    var title= req.body.title;
    var description=req.body.description;
    async function dbentry(todo:Todo){
        try{
            const result = await prisma.todos.create({
               data: todo
            })
            res.status(202).send(JSON.stringify(result))
           }
           catch(err){
            res.status(401).send(err);
           }
    }
    dbentry({
        user_id,
        title,
        description
    })
    
})
//updating todos
app.post("/update",tokenMiddleware,(req:Request,res:Response)=>{
    var id=req.body.todoid;
    async function dbentry(id:number){
        try{
            const result = await prisma.todos.update({
               where:{id},
               data:{done:true}
            })
            res.status(202).send(JSON.stringify(result))
           }
           catch(err){
            res.status(401).send(err);
           }
    }
    dbentry(id)
})
//fetch todos

app.get("/getall",tokenMiddleware,(req:Request,res:Response)=>{
    var user_id= req.body.userid;
    async function fetchdb(user_id:number){
        try{
            var result = await prisma.todos.findFirst({
                where:{user_id}
            })
            res.status(202).send(JSON.stringify(result))
        }
        catch(err){
            res.status(401).send("error in fetching")
        }

    }
    fetchdb(user_id)
})
app.listen(3000);