import { VideoFilter } from "@/model/VideoFilter";
import { Video } from "@/model/Video";
import { Pgn } from "@/model/Pgn";
import { usePgnsStore } from "@/stores/pgnsStore";

function isQueenSacrifice(pgn: string): boolean {
  const moves = pgn
    .replace(/\d+\.\s+/g, "") // Remove move numbers
    .trim()
    .split(/\s+/); // Split by spaces

  const captureRegex = /([QRNB])?([a-h])?x([a-h][1-8])(=[QRNB])?/;

  // Track whether the queen has been captured
  let queenPosition: string | null = "d1"; // Start with default queen position

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    const captureMatch = move.match(captureRegex);
    if (captureMatch) {
      const capturingPiece = captureMatch[1] || "P"; // Default to pawn if no piece letter is present
      const targetSquare = captureMatch[3]; // The square where the piece is captured

      // If a queen is on the target square, it has been captured
      if (queenPosition && queenPosition === targetSquare) {
        // console.log("Queen captured on", targetSquare);

        // Check the next move for a queen recapture (exchange)
        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);

        // If the next move is a queen capture, it's an exchange
        if (nextCaptureMatch && nextCaptureMatch[1] === "Q") {
          console.log("Queen exchange, not a sacrifice.");
          return false; // Queen exchange, not a sacrifice
        }

        // If no immediate queen recapture, it's a sacrifice
        console.log("> it's a queen sacrifice!");
        return true;
      }

      // Update queen position if the queen moves (non-capture)
      if (capturingPiece === "Q") {
        queenPosition = targetSquare;
      }
    }
  }

  // If no queen sacrifice was found
  return false;
}

export class QueenSacrificeFilter implements VideoFilter {
  constructor() {}

  name(): string {
    return "Queen Sacrifice";
  }

  test(video: Video): boolean {
    // Get the PGNs for the given video using the PGN store
    const pgns = usePgnsStore().pgns.get(video.id) || [];

    return pgns.some((pgn: Pgn) => {
      return isQueenSacrifice(pgn.pgn);
    });
  }

  equals(other: VideoFilter): boolean {
    return other instanceof QueenSacrificeFilter;
  }
}
