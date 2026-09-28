import {pieces} from '../assets/pieces'
import './promui.css'

const LABELS = { q:"Queen", r:"Rook", n:"Knight", b:"Bishop" }

const Promui = ({onselect,oncancel,color,style}) => {
    // Order pieces from the promotion square outward, so the queen always
    // sits right on the square the pawn is promoting on.
    const order = color === 'b' ? ['b','n','r','q'] : ['q','r','n','b']

    return (
        <div className="promui" style={style}>
            {order.map(p => (
                <div key={p} className="promui-piece" onClick={()=>onselect(p)}>
                    <img src={pieces[color==="w" ? p.toUpperCase() : p]} alt={LABELS[p]} />
                </div>
            ))}
        </div>
    );
};

export default Promui;
