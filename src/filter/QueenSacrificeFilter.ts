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

  const captureRegex = /([QRNB])?([a-h1-8])x([a-h][1-8])/;

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

      if (isWhiteQueenCapture || isBlackQueenCapture) {
        let otherQueenPosition = isWhiteQueenCapture
          ? blackQueenPosition
          : whiteQueenPosition;
        if (captureMatch[i] === "Q") {
          otherQueenPosition = targetSquare;
        }
        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);
        const nextTargetSquare = nextCaptureMatch?.[3];
        const nextMoveIsQueenCapture = nextTargetSquare === otherQueenPosition;
        return !nextMoveIsQueenCapture && i !== lastMoveIndex;
      }
    }

    // Update queen positions if the queens move
    if (move.startsWith("Q")) {
      // Extract the last two chars (the board position) if it's a capture, or from index 1 if not
      const newSquare = move.includes("x") ? move.slice(-2) : move.slice(1);

      if (i % 2 === 0) {
        // White's turn (even index)
        whiteQueenPosition = newSquare;
      } else {
        // Black's turn (odd index)
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
    const pgns = usePgnsStore().pgns.get(video.id) || [];

    return pgns.some((pgn: Pgn) => {
      return isQueenSacrifice(pgn.pgn);
    });
  }

  equals(other: VideoFilter): boolean {
    return other instanceof QueenSacrificeFilter;
  }
}
