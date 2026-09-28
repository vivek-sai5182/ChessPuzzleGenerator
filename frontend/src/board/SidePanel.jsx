import React from 'react'
import "./SidePanel.css"

function SidePanel({white,black,onHint,onGenerate,generating,onNext,onPrev,canNext,canPrev,puzzleNum,totalPuzzles}) {

  return (
    <div className="sidepanel">
      <div className="sidepanel-header">
        <h2>Puzzle {puzzleNum} <span className="of">of {totalPuzzles}</span></h2>
      </div>

      <div className="players">
        <p style={{ margin: "0 0 8px", fontSize: "24px", color: "white" }}>Lichess Accounts</p>
        <div className="player">
          <span className="swatch swatch-black" />
          <span className="player-name">{black || "—"}</span>
        </div>
        <div className="player">
          <span className="swatch swatch-white" />
          <span className="player-name">{white || "—"}</span>
        </div>
      </div>
      <div className="controls">
        <div className="nav-row">
          <button className="btn btn-ghost" onClick={onPrev} disabled={!canPrev}>&larr; Prev</button>
          <button className="btn btn-ghost" onClick={onNext} disabled={!canNext}>Next &rarr;</button>
        </div>

        <button className="btn btn-secondary" onClick={onHint}>
          Get Hint
        </button>

        <button className="btn btn-primary" onClick={onGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate Puzzles"}
        </button>

      </div>
    </div>
  )
}

export default SidePanel
