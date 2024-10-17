import { VideoFilter } from "@/model/VideoFilter";
import { Video } from "@/model/Video";
import { Pgn } from "@/model/Pgn";
import { usePgnsStore } from "@/stores/pgnsStore";

/* 
  There are some cases where a queen sacrifice may be wrongly detected:
  - A blunder where the queen is captured without any compensation. However, it is unlikely that such games would be analyzed on the channel.
  - A queen exchange combination, such as a check in-between move before recapturing the other queen.

  There are also some cases where the queen sacrifice may not be detected:
  - This function does not currently handle the scenario in which a queen exchange takes place and, later, a pawn is promoted to a queen, and then sacrificed.
*/
function isQueenSacrifice(pgn: string): boolean {
  const moves = pgn
    .replace(/\d+\.\s+/g, "") // Remove move numbers
    .trim()
    .split(/\s+/); // Split by spaces

  const captureRegex = /([QRNB])?([a-h])?x([a-h][1-8])?/;

  let whiteQueenPosition = "d1"; // White Queen starts at d1
  let blackQueenPosition = "d8"; // Black Queen starts at d8

  const lastMoveIndex = moves.length - 1;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    const captureMatch = move.match(captureRegex);

    // If it's a capture move
    if (captureMatch) {
      const targetSquare = captureMatch[3]; // The square where the capture happens

      const isWhiteQueenCapture = targetSquare === whiteQueenPosition;
      const isBlackQueenCapture = targetSquare === blackQueenPosition;

      if (isWhiteQueenCapture) {
        if (captureMatch[1] === "Q") {
          // If it's a queen capturing a queen, it's an exchange, not a sacrifice
          return false;
        }

        // Otherwise, check if the next move is a queen recapture (indicating an exchange)
        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);
        const nextTargetSquare = nextCaptureMatch?.[3];
        const nextMoveIsQueenCapture = nextTargetSquare === blackQueenPosition;

        // If the next move is not a queen recapture, and it’s not an exchange, return true
        return !nextMoveIsQueenCapture && i !== lastMoveIndex;
      } else if (isBlackQueenCapture) {
        // If it's a queen capturing a queen, it's an exchange, not a sacrifice
        if (captureMatch[1] === "Q") {
          return false;
        }

        // Otherwise, check if the next move is a queen recapture (indicating an exchange)
        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);
        const nextTargetSquare = nextCaptureMatch?.[3];
        const nextMoveIsQueenCapture = nextTargetSquare === whiteQueenPosition;

        // If the next move is not a queen recapture, and it’s not an exchange, return true
        return !nextMoveIsQueenCapture && i !== lastMoveIndex;
      }
    }

    // Update queen positions if the queens move
    if (move.startsWith("Q")) {
      if (i % 2 === 0) {
        // White's turn (even index)
        const newSquare = move.slice(1); // Extract the square from the move (e.g., Qd2 -> d2)
        whiteQueenPosition = newSquare;
      } else {
        // Black's turn (odd index)
        const newSquare = move.slice(1); // Extract the square from the move (e.g., Qd2 -> d2)
        blackQueenPosition = newSquare;
      }
    }
  }

  // No queen sacrifice detected
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
