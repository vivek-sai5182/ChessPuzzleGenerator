import {pieces} from '../assets/pieces'

const Promui = ({onselect,oncancel,color}) => {
  return (
    <div style={styles.box}>
        <div style={styles.pice} onClick={()=>onselect('q')}><img style={styles.imgs} src ={pieces[color==="w"? 'Q' : "q"]} alt="Queen" /></div>
        <div style={styles.pice} onClick={()=>onselect('r')}><img style={styles.imgs} src ={pieces[color==="w"? 'R' : "r"]} alt="Rook" /></div>
        <div style={styles.pice} onClick={()=>onselect('n')}><img style={styles.imgs} src ={pieces[color==="w"? 'N' : "n"]} alt="Knight" /></div>
        <div style={styles.pice} onClick={()=>onselect('b')}><img style={styles.imgs} src ={pieces[color==="w"? 'B' : "b"]} alt="Bishop" /></div>
    </div>
  );
};

export default Promui;

const styles ={
    box:{
        height:320,
        width:79,
        display:"flex" ,
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:"brown",
        margin:20,
    },
    pice:{
        height:75,
        width:75,
        margin:2,
        backgroundColor:"#fccc74",
    },
    imgs:{
        height:75,
        width:75,
    }

}
