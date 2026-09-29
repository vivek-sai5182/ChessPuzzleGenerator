import React,{ useState, useRef, useEffect } from 'react'
import './board.css'
import {pieces} from '../assets/pieces'
import { Chess } from "chess.js"
import Promui from './promui'
import SidePanel from "./SidePanel"

function Board(){

    const chessRef = useRef(null)
    const puzzlesRef = useRef(null)

    const [fen,setFen] = useState("")
    const [board,setBoard] = useState(Array(8).fill(null).map(() => Array(8).fill("")))
    const [selected,setSelected] = useState(null)
    const [legalmoves,setLegalMoves] = useState([])
    const [check,setCheck] = useState(null)
    const [gameover,setGameover] = useState(false)
    const [nextmove,setNextmove] = useState(null)
    const [promui,setPromui] = useState(false)
    const pindex = useRef(0)
    const findex = useRef(1)
    const [sidetomove,setSide] = useState("")
    const [hintSquare, setHintSquare] = useState(null)
    const [allDone,setAllDone] = useState(false)

    const [started,setStarted] = useState(false)
    const [loading,setLoading] = useState(false)
    const [loadError,setLoadError] = useState(false)
    const [generating,setGenerating] = useState(false)

    function loadPuzzles(){
        setLoading(true)
        setLoadError(false)
        fetch("/api/puzzles")
        .then(r => r.json())
        .then(data => {
            if(!data || data.length === 0){
                setLoadError(true)
                setLoading(false)
                return
            }
            puzzlesRef.current = data
            pindex.current = 0
            findex.current = 0
            initFromFen(data[0].fens[0])
            setSide(sidemove(data[0].fens[0].split(" ")[1]))
            setStarted(true)
            setLoading(false)
        })
        .catch(err =>{
            console.error("fetch error:",err)
            setLoadError(true)
            setLoading(false)
        })
    }

    async function handleGenerate(){
        setGenerating(true)
        try{
            const response = await fetch("/api/generate-new",{ method:"POST" })
            if(!response.ok){
                throw new Error("Puzzle Generaion Failed")
            }
            loadPuzzles()
        }
        catch(error){
            console.error(error)
        }
        finally{
            setGenerating(false)
        }
    }

    const sidemove = (s) => {
        return s === "b" ? "Black" :"White"
    }
    function validatemove(movedFen){
        const puzzle = puzzlesRef.current[pindex.current]
        const expectedFen = puzzle.fens[findex.current + 1]

        if (movedFen.split(" ")[0] !== expectedFen.split(" ")[0]) {
            setTimeout(() => initFromFen(puzzle.fens[findex.current]), 800)
            return
        }

        findex.current++

        if (findex.current + 1 < puzzle.fens.length) {
            findex.current++
            setTimeout(() => initFromFen(puzzle.fens[findex.current]), 800)
            return
        }
        pindex.current++
        if (pindex.current >= puzzlesRef.current.length) {
            console.log("All puzzles completed")
            setAllDone(true)
            return
        }

        findex.current = 0
        setTimeout(()=>initFromFen(puzzlesRef.current[pindex.current].fens[0]),1000)
        setSide(sidemove(puzzlesRef.current[pindex.current].fens[0].split(" ")[1]))
    }

    function initFromFen(startFen){
        chessRef.current = new Chess(startFen)
        setFen(startFen)
        cancelMove()
        cleanProm()
        abtKing()
        setHintSquare(false)
        setAllDone(false)
    }

    function goToPuzzle(index){
        if(!puzzlesRef.current) return
        if(index < 0 || index >= puzzlesRef.current.length) return
        pindex.current = index
        findex.current = 0
        initFromFen(puzzlesRef.current[index].fens[0])
        setSide(sidemove(puzzlesRef.current[index].fens[0].split(" ")[1]))
    }

    function handleNext(){ goToPuzzle(pindex.current + 1) }
    function handlePrev(){ goToPuzzle(pindex.current - 1) }

    function handleHint() {
        const puzzle = puzzlesRef.current?.[pindex.current]

        if (!puzzle) return

        const currentFen = puzzle.fens[findex.current]
        const nextFen = puzzle.fens[findex.current + 1]

        if (!currentFen || !nextFen) return

        const currentBoard = currentFen.split(" ")[0]
        const nextBoard = nextFen.split(" ")[0]

        const getPieces = (boardFen) => {
            const pieces = []
            let row = 0
            let col = 0

            for (const ch of boardFen) {
                if (ch === "/") {
                    row++
                    col = 0
                }
                else if (ch >= "1" && ch <= "8") {
                    col += Number(ch)
                }
                else {
                    pieces.push({
                        row,
                        col,
                        piece: ch
                    })
                    col++
                }
            }

            return pieces
        }

        const currentPieces = getPieces(currentBoard)
        const nextPieces = getPieces(nextBoard)

        for (const current of currentPieces) {
            const next = nextPieces.find(
                p => p.row === current.row && p.col === current.col
            )

            if (!next) {
                setHintSquare({
                    row: current.row,
                    col: current.col
                })
                return
            }
        }
    }

    const handleSelection =(i,j) =>{
        if(!started || !chessRef.current) return

        let square = `${String.fromCharCode(97+j)}${8 -i}`

        if (promui) {
            cleanProm();
            return;
        }

        if(!selected){
            const moves = chessRef.current.moves({square,verbose:true})
            if(moves.length === 0) return
            setSelected(square)
            setLegalMoves(moves.map(m =>m.to))
            return
        }

        if(selected === square){
            cancelMove()
            return
        } 

        const piece = chessRef.current.get(selected)
        const isprom = piece?.type === 'p' && (
            (piece.color === "w" && square[1] === "8") || (piece.color === "b" && square[1] === "1")
        )

        if(isprom){
            setNextmove({from:selected,to:square,color:piece?.color})
            setPromui(true)
            return;
        }

        try{
            chessRef.current.move({
                from:selected,
                to:square,
            })
            validatemove(chessRef.current.fen())
        } 
        catch{
            cancelMove()
            return
        }

        const newFen = chessRef.current.fen()
        setFen(newFen)
        abtKing()
        cancelMove()
    }

    function abtKing(){
        if (chessRef.current.isCheck()) {
            const board = chessRef.current.board();
            const turn = chessRef.current.turn();

            const kingSquare = board
                .flat()
                .find(s => s?.type === "k" && s.color === turn)?.square;

            setCheck(kingSquare);
        } 
        else {
            setCheck(null);
        }

        setGameover(chessRef.current.isGameOver());
    }

    function cancelMove(){
        setSelected(null)
        setLegalMoves([])
    }

    function handlePromotion(piece){
        try{
            const move  = chessRef.current.move({
                from:nextmove.from,
                to:nextmove.to,
                promotion:piece,
            })

            if(move === null) cleanProm();
            validatemove(chessRef.current.fen())
        }
        catch{
            cleanProm()
        }

        const newFen = chessRef.current.fen()
        setFen(newFen)
        abtKing()
        cleanProm()
    }

    function cleanProm(){
        setNextmove(null)
        setPromui(false)
        cancelMove()
    }

    useEffect(()=>{
        if(!fen) return

        const newBoard = Array(8).fill(null).map(() => Array(8).fill(""))
        let row=0,col=0;

        for(let k=0;k<fen.length;k++){
            const ch = fen[k]
            if(ch>='0' && ch<='9'){
                col+= Number(ch)
            }
            else if(ch==='/'){
                row++
                col =0
            }
            else if(ch === " "){
                break
            }
            else{
                newBoard[row][col] = ch
                col++
            }
        }
        setBoard(newBoard)

    },[fen,promui])

    const squares =[]

    const isDark =(i,j) =>{
        return (i+j)%2 !== 0
    }

    for(let i=0;i<8;i++){
        for(let j=0;j<8;j++){
            const piece = board[i][j]
            const squarenum = `${String.fromCharCode(97 +j)}${8-i}`
            const isSelected = selected === squarenum
            const isLegal = legalmoves.includes(squarenum)
            const ischeck = check === squarenum
            const isHint = hintSquare?.row===i && hintSquare?.col===j
            squares.push(
                <div key ={`${i}-${j}`} 
                    className = {`${isDark(i,j)? "black" : "white"} 
                        ${isSelected? "selected" : ""} 
                        ${isLegal? "legal":""}
                        ${ischeck? "check":""}
                        ${gameover? "gamover":""}
                        ${isHint? "Hint":""}`} 
                    onClick={() => handleSelection(i,j)}>

                    {piece !== '' && (
                        <img src ={pieces[piece]} alt={piece} className="pieces" />
                    )}
                </div>
            )
        }
    }

    function squareToRC(square){
        const col = square.charCodeAt(0) - 97
        const row = 8 - parseInt(square[1], 10)
        return {row,col}
    }

    let promStyle = null
    if(promui && nextmove){
        const {row,col} = squareToRC(nextmove.to)
        const top = nextmove.color === 'w' ? row : row - 3
        promStyle = { left:`${col*12.5}%`, top:`${top*12.5}%` }
    }

    const totalPuzzles = puzzlesRef.current?.length ?? 0
    const puzzleNum = totalPuzzles ? pindex.current+1 : 0

    return(
    <div className="wholebody">
        <div className='board'>
            {squares}

            {!started && !loading && (
                <div className="board-overlay">
                    <h1 className="overlay-title">Puzzle Drill</h1>
                    <p className="overlay-sub">Practice free puzzles generated from games played by GMs on Lichess.</p>
                    <button className="btn btn-primary" onClick={loadPuzzles}>
                        {loadError ? "Try Again" : "Start"}
                    </button>
                    {loadError && <p className="overlay-error">Couldn't reach the puzzle server.</p>}
                </div>
            )}

            {loading && (
                <div className="board-overlay">
                    <div className="spinner" />
                    <p className="overlay-sub">Loading puzzles…</p>
                </div>
            )}

            {promui && (
                <Promui onselect={handlePromotion} oncancel={cleanProm} color={nextmove?.color} style={promStyle}/>
            )}

            

            {allDone && (
                <div className="board-overlay">
                    <h2 className="overlay-title">Puzzles completed.</h2>
                    <p className="overlay-sub">All puzzles are over, click Generate for more.</p>
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                        {generating ? "Generating…" : "Generate more"}
                    </button>
                </div>
            )}
        </div>
        {started && !loading && !allDone && (
                        <p id="sidemove">{sidetomove} to move</p>
                    )}
        {started && (
            <SidePanel 
            white={puzzlesRef.current?.[pindex.current]?.white ?? ""}
            black={puzzlesRef.current?.[pindex.current]?.black ?? ""}
            onHint={handleHint}
            onGenerate={handleGenerate}
            generating={generating}
            onNext={handleNext}
            onPrev={handlePrev}
            canNext={pindex.current < totalPuzzles-1}
            canPrev={pindex.current > 0}
            puzzleNum={puzzleNum}
            totalPuzzles={totalPuzzles}
            />
        )}
    </div>
    );
}

export default Board;
