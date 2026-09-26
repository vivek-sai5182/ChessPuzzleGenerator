// const http = require("http");
// const { exec } = require("child_process");

// http.createServer((req, res) => {
//   if (req.url === "/regenerate") {
//     console.log("Regenerating puzzles...");

//     exec("cd backend && java -cp .;gson-2.10.1.jar getPuzzles", (err) => {
//       if (err) {
//         console.error(err);
//         res.end("FAILED");
//       } else {
//         console.log("Puzzle generation complete.");
//         res.end("DONE");
//       }
//     });
//   } 
//   else {
//     res.end("OK");
//   }
// }).listen(3000, () => {
//   console.log("Gateway running at http://localhost:3000");
// });
