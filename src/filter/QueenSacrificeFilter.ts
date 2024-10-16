import { VideoFilter } from "@/model/VideoFilter";
import { Video } from "@/model/Video";
import { Pgn } from "@/model/Pgn";
import { usePgnsStore } from "@/stores/pgnsStore";

/* 
  There are some outlying cases where the queen sacrifice may be wrongly detected:
  - A blunder where the queen is captured without any compensation. However, it is unlikely that such games would be analyzed in the first place.
  - A queen exchange combination lasting more than 2 moves happens, such as if there is a check played as an in-between move to a queen exchange.

  There are also some cases where the queen sacrifice may not be detected:
  - This function does not currently the scenario in which a queen exchange takes place and, later, a pawn is promoted to a queen, and then sacrified.
*/
function isQueenSacrifice(pgn: string): boolean {
  const moves = pgn
    .replace(/\d+\.\s+/g, "") // Remove move numbers
    .trim()
    .split(/\s+/); // Split by spaces

  // Regular expression to match captures (e.g., dxe5, Qxe2)
  const captureRegex = /([QRNB])?([a-h])?x([a-h][1-8])(=[QRNB])?/;

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
        // The PGN does give us the capturing piece notation. If it's a queen capturing
        // a queen, that is an exchange, and ends calculation if total queen count is 2.
        if (captureMatch[1] === "Q") {
          return false;
        }

        // Otherwise, we need to check the next move to see if it's a queen recapture,
        // which would also represent an exchange.
        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);
        const nextTargetSquare = nextCaptureMatch?.[3];
        const nextMoveIsQueenCapture = nextTargetSquare === blackQueenPosition;

        // If the next move is not a queen recapture, and if it's not the last move,
        // i.e. a checkmate or resignation, then it's a queen sacrifice.
        if (!nextMoveIsQueenCapture && i !== lastMoveIndex) {
          return true;
        } else {
          return false;
        }
      } else if (isBlackQueenCapture) {
        if (captureMatch[1] === "Q") {
          return false;
        }

        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);
        const nextTargetSquare = nextCaptureMatch?.[3];
        const nextMoveIsQueenCapture = nextTargetSquare === whiteQueenPosition;

        if (!nextMoveIsQueenCapture && i !== lastMoveIndex) {
          return true;
        } else {
          return false;
        }
      } else {
        continue;
      }
    } else {
      // Handle non-capture moves (including queen moves)
      // If the move is made by the White Queen
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
