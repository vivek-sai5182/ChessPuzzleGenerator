import React,{ useState, useEffect, useRef } from 'react'
import './board.css'
import {pieces} from '../assets/pieces'
import { Chess } from "chess.js"
import Promui from './promui'
import SidePanel from "./SidePanel"

// const initfen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
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

    useEffect(() => {
        loadPuzzles()
    }, [])
    
    function loadPuzzles(){
        fetch("http://localhost:5000/api/puzzles")
        .then(r => r.json())
        .then(data => {
        puzzlesRef.current = data
        pindex.current = 0
        findex.current = 0
        initFromFen(data[0].fens[0])
        setSide(sidemove(data[0].fens[0].split(" ")[1]))
        })
        .catch(err =>{
            console.error("fetch error:",err)
        })
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

    return(
        puzzlesRef.current && (
    <div className="wholebody">
        <div className='board'>
            {squares}
            {promui && <Promui onselect={handlePromotion} oncancel={cleanProm} color={nextmove?.color}/>}
            <p id="sidemove">{sidetomove} to Move</p>
        </div>
        {allDone && (
            <div>
                <h2> All Puzzles are over!</h2>
                <p> Click Generate Puzzles to get more :)</p>
            </div>
        )}

        <SidePanel 
        white={puzzlesRef.current?.[pindex.current]?.white ?? ""}
        black={puzzlesRef.current?.[pindex.current]?.black ?? ""}
        onHint={handleHint}
        onGenerated={loadPuzzles}
        />
        
    </div>
    ));
}

export default Board;
