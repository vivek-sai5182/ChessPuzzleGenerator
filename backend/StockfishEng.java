// import java.util.*;
import java.io.*;
public class StockfishEng {
    private static Process process;
    private static BufferedReader BReader;
    private static BufferedWriter BWriter;
    static String path = System.getProperty("os.name").toLowerCase().contains("win")
        ? "stockfish/stockfish-win/stockfish-windows-x86-64-avx2.exe" : "stockfish/stockfish-linux/stockfish-linux-x86-64-universal" ;
    public static final int EVAL_ERROR = 200000;

    public static boolean startEng(String path){
        try{
            ProcessBuilder pb = new ProcessBuilder(path);
            process = pb.start();
            BWriter = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
            BReader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            boolean uci = false;
            BWriter.write("uci\n");
            BWriter.flush();
            //uci check
            String line;
            while((line = BReader.readLine()) != null){
                if(line.equals("uciok")){
                    uci = true;
                    break;
                }
            }
            //readyok
            if(uci){
                BWriter.write("isready\n");
                BWriter.flush();

                line = BReader.readLine();
                if(!line.equals("readyok"))
                    return false;
            }else{
                return false;
            }

            return true;
        }
        catch(Exception e){
            e.printStackTrace();
            return false;
        }
    }
    public static int getEval(String FEN,int dep){
        
        try{
            BWriter.write("position fen "+FEN+"\n");
            BWriter.flush();
            BWriter.write("go depth "+dep+"\n");
            BWriter.flush();
            
            int eval =EVAL_ERROR;
            String line;
            while((line = BReader.readLine()) != null){
                if(line.contains("score cp")){
                    String[] parts = line.split(" ");
                    for(int i=0;i<parts.length;i++){
                        if(parts[i].equals("cp")){
                            eval = Integer.parseInt(parts[i+1]);
                            break;
                        }
                    }
                }
                else if(line.contains("score mate")){
                    String[] parts = line.split(" ");
                    for(int i=0;i<parts.length;i++){
                        if(parts[i].equals("mate")){
                            int matein = Integer.parseInt(parts[i+1]);
                            eval = matein>0 ? 10000 : -10000;
                            break;
                        }
                    }
                }
                if (line.startsWith("bestmove")) break;
            }

            // System.out.print(eval+" ");
            return eval;
        }
        catch(Exception e){
            System.out.print(e);
            return EVAL_ERROR;
        }

    }
    public static void main(String[] args) {
        // String fen = "r5k1/ppp2p1p/3br1p1/5qQ1/3Pb3/2PBB3/P1P2PPP/3RR1K1 b - - 6 17";

        // startEng("stockfish/stockfish-windows-x86-64-avx2.exe");
        
        // System.out.println(getEval(fen,10));
    }
}