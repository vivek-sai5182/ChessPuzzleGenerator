import express from "express"
import fs from 'fs'
import {exec} from 'child_process'
import cors from "cors"

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.get("/", (req, res) => {
    res.json({ message: "Puzzle Generator Backend Running" });
})

app.post("/api/generate-new",(req,res)=>{
    console.log("Generating puzzles..")

    exec("java getPuzzles",(error,stdout,stderror)=>{
        if(error){
            console.error("java error",error)
            return res.status(500).json({
                error:"Puzzles Gen failed"
            })
        }

        console.log("executing java\n",stdout)

        fs.readFile("generatedPuzzles.txt", "utf8", (error,data)=>{
            if(error){
                console.error("File read error:", error);
                return res.status(500).json({
                    error: "Could not read generated puzzles"
                });
            }

            const puzzles =[]
            let curpuz = null
            const lines = data.split("\n")

            for(let line of lines){
                line = line.trim()

                if(line.startsWith("PUZZLE")){
                    curpuz ={
                        white:"",
                        black:"",
                        fens:[]
                    }
                }
                else if(line.startsWith("white")){
                    curpuz.white = line.substring(6)
                }
                else if(line.startsWith("black")){
                    curpuz.black = line.substring(6)
                }
                else if(line.startsWith("fen")){
                    curpuz.fens.push(line.substring(4))
                }
                else if(line === "END"){
                    puzzles.push(curpuz)
                    curpuz=null
                }
            }

            fs.writeFile(
                "./finalPuzzles.json",
                JSON.stringify(puzzles, null, 2),
                "utf8",
                (error) => {
                    if (error) {
                        console.error("JSON write error:", error)
                        return res.status(500).json({
                            error: "Could not save puzzles"
                        })
                    }

                    console.log(`Generated ${puzzles.length} puzzles`)
                    res.json(puzzles)
                }
            )

        })
    })
})

app.get("/api/puzzles",(req,res)=>{
    console.log("puzzles requested.")
    fs.readFile("finalPuzzles.json","utf-8",(error,data)=>{
        if(error){
            return res.status(500).json({
                error: "Couldnt read puzzles"
            })
        }
        res.json(JSON.parse(data))
        console.log("sent puzzles succefuly")
    })
})

app.listen(port,"0.0.0.0",()=>{
    console.log(`running on ${port}`)
})