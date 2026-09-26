import React,{useState} from 'react'
import "./SidePanel.css"

function SidePanel({white,black,onHint,onGenerated}) {

  const [generating,setGenerating] = useState(false)

  const handleGenerate = async()=>{
    setGenerating(true)

    try{
      const response = await fetch("http://localhost:5000/api/generate-new",{
        method:"POST"
      })

      if(!response.ok){
        throw new Error("Puzzle Generaion Failed")
      }
      onGenerated()

    }
    catch(error){
      console.error(error)
    }
    finally{
      setGenerating(false)
    }
  }


  return (
    <div className="sidepanel">
      <h2>Lichess Accounts:</h2>
      <h3>Black :{black}</h3>
      <h3>White :{white}</h3>

      <button onClick={onHint}>
        Get Hint
      </button>

      <button onClick={handleGenerate} disabled={generating}>
        {generating ? "Generating..":"Generate Puzzles"}
      </button>

     
    </div>
  )
}

export default SidePanel
