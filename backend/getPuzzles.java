import java.util.*;
import java.io.*;


class Puzzle {
    String white;
    String black;
    ArrayList<String> fens;

    public Puzzle(String white, String black, ArrayList<String> fens) {
        this.white = white;
        this.black = black;
        this.fens = fens;
    }
}

public class getPuzzles{
    static String stockfishPath =System.getProperty("os.name").toLowerCase().contains("win")
        ? "stockfish/stockfish-win/stockfish-windows-x86-64-avx2.exe" : "stockfish/stockfish-linux/stockfish-linux-x86-64-universal" ; 
    static String gamesPath = "gamesFens.txt";
    static int depth = 10;
    static int jumpval = 500;

    public static boolean initialise(String path){
        boolean lichess = MiddleLayer.runLichess();
        boolean fish = false;
        if(lichess){
            fish =StockfishEng.startEng(path);
        } 

        return lichess && fish ;
    }
    // static boolean init = initialise(stockfishPath);
    public static int v(int a){
        return Math.abs(a);
    }
    public static ArrayList<String> findPuzzle(ArrayList<String> fens){
        ArrayList<String> puzzleFens = new ArrayList<>();
        int n = fens.size();
        int[] evals = new int[n];

        for(int i=0;i<n;i++){
            evals[i] = StockfishEng.getEval(fens.get(i),depth);
        }

        for(int i=1;i<n;i++){
            try{
                if((v(evals[i]) - v(evals[i-1])) > jumpval){
                    if((i+3 <n) && ((v(evals[i+2]) - v(evals[i])) < jumpval && (v(evals[i+2]) - v(evals[i+1]))<jumpval)){                         //normal blunder - 2move puzzle if next 3moves also go in the same range
                        puzzleFens.add(fens.get(i));
                        puzzleFens.add(fens.get(i+1));
                        puzzleFens.add(fens.get(i+2));
                        puzzleFens.add(fens.get(i+3));
                        break;
                    }else{
                        
                        puzzleFens.add(fens.get(i));
                        puzzleFens.add(fens.get(i+1));
                    }
                }
            }
            catch(Exception e){
                continue;
            }
            
        }
        

        return puzzleFens;
    }
    public static void writePuzzle(boolean init) {
        if (!init) return;

        ArrayList<GameData> games = MiddleLayer.readGames(gamesPath);
        ArrayList<Puzzle> puzzles = new ArrayList<>();

        for (GameData game : games) {
            ArrayList<String> puzzlefens = findPuzzle(game.fensray);

            if (puzzlefens.size() == 0 || puzzlefens.size() % 2 != 0) continue;

            puzzles.add(new Puzzle(
                    game.white,
                    game.black,
                    new ArrayList<>(puzzlefens)
            ));
        }

        try (BufferedWriter writer = new BufferedWriter(
            new FileWriter("generatedPuzzles.txt"))) {
            int count =0;
            for (Puzzle puzzle : puzzles) {
                writer.write("PUZZLE "+ (count++));
                writer.newLine();

                writer.write("white " + puzzle.white);
                writer.newLine();

                writer.write("black " + puzzle.black);
                writer.newLine();

                for (String fen : puzzle.fens) {
                    writer.write("fen " + fen);
                    writer.newLine();
                }

                writer.write("END");
                writer.newLine();
            }

            System.out.println("Puzzles written successfully.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {

        System.out.println("Starting pipeline...");

        boolean init = initialise(stockfishPath);   // <-- THIS LINE
        

        if (!init) return;
        System.out.println("Initalised good.");
        writePuzzle(true);

        
    }

}

