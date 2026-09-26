import java.io.*;
import java.util.*;

class GameData{
    String gameNum;
    String white,black;
    ArrayList<String> fensray = new ArrayList<>();

    public GameData() {}

    public GameData(String white, String black, ArrayList<String> fens) {
        this.white = white;
        this.black = black;
        this.fensray = fens;
    }

}
public class MiddleLayer {
    public static boolean runLichess(){
        Process process = null;
        try{
            ProcessBuilder lpb = new ProcessBuilder("node","lichessAPI.js");
            lpb.redirectErrorStream(true);

            process = lpb.start();

            BufferedReader lreader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            String line;
            while((line = lreader.readLine()) != null){
                System.out.print("lichess: "+line+"\n");
            }

            int exitCode = process.waitFor();
            return exitCode ==0;


        }
        catch(Exception e){
            System.out.print(e);
            return false;
        }
        finally{
            if(process != null) process.destroy();
        }
    }

    public static ArrayList<GameData> readGames(String path){
        ArrayList<GameData> fens = new ArrayList<>();
        
        try(BufferedReader freader = new BufferedReader(new FileReader(path))){
            String line;
            GameData game =null;
            
            while((line = freader.readLine()) != null){
                if(line.startsWith("Game")){
                    game = new GameData();
                    game.gameNum = line.split(" ")[1];
                }
                else if(line.startsWith("white")){
                    game.white = line.split(" ")[1];
                }
                else if(line.startsWith("black")){
                    game.black = line.split(" ")[1];
                }
                else if(line.startsWith("End")){
                    fens.add(game);
                    game = null;
                }
                else{
                    game.fensray.add(line);
                }
            }
            
        }
        catch(Exception e){
            System.out.println(e);
        }
        return fens;
    }
    public static void main(String[] arg){
        
    }
}
