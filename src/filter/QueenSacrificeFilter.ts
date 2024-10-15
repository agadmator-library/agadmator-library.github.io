import { VideoFilter } from "@/model/VideoFilter";
import { Video } from "@/model/Video";
import { Pgn } from "@/model/Pgn";
import { usePgnsStore } from "@/stores/pgnsStore";

// NOTE:
// There are some outlying cases where the queen sacrifice is not detected.
// - A queen exchange happens but not on subsequent moves will be considered a queen sacrifice.
// - A queen exchange that happens after a non-subsequent queen exchange interpreted as a queen sacrifice.

// TODO - we need to check whole game for queen exchange
// TODO - ensure it isn't last move of game

function isQueenSacrifice(pgn: string): boolean {
  const moves = pgn
    .replace(/\d+\.\s+/g, "") // Remove move numbers
    .trim()
    .split(/\s+/); // Split by spaces

  // Regular expression to match captures (e.g., dxe5, Qxe2)
  const captureRegex = /([QRNB])?([a-h])?x([a-h][1-8])(=[QRNB])?/;

  // Track the initial positions of the queens
  let whiteQueenPosition = "d1"; // White Queen starts at d1
  let blackQueenPosition = "d8"; // Black Queen starts at d8

  // let hasQueenExchangeOccurred = false;

  for (let i = 0; i < moves.length; i++) {
    // if (hasQueenExchangeOccurred) {
    //   return false;
    // }

    const move = moves[i];

    // Match the move against the capture regex
    const captureMatch = move.match(captureRegex);

    // If it's a capture
    if (captureMatch) {
      const targetSquare = captureMatch[3]; // The square where the capture happens

      const isWhiteQueenCapture = targetSquare === whiteQueenPosition;
      const isBlackQueenCapture = targetSquare === blackQueenPosition;

      if (isWhiteQueenCapture) {
        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);
        const nextTargetSquare = nextCaptureMatch?.[3];
        const nextMoveIsQueenCapture = nextTargetSquare === blackQueenPosition;

        if (!nextMoveIsQueenCapture) {
          return true;
        } else {
          return false;
        }
      }

      if (isBlackQueenCapture) {
        const nextMove = moves[i + 1];
        const nextCaptureMatch = nextMove?.match(captureRegex);
        const nextTargetSquare = nextCaptureMatch?.[3];
        const nextMoveIsQueenCapture = nextTargetSquare === whiteQueenPosition;

        if (!nextMoveIsQueenCapture) {
          return true;
        } else {
          return false;
        }
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
