import { VideoFilter } from "@/model/VideoFilter";
import { Video } from "@/model/Video";
import { Pgn } from "@/model/Pgn";
import { usePgnsStore } from "@/store/pgnStore"; // Assuming you're using a store for PGNs

function isSacrifice(pgn: string, pieceType: "Q" | "R" | "N" | "B"): boolean {
  const moves = pgn
    .replace(/\d+\.\s+/g, "") // Remove move numbers
    .trim() // Trim whitespace
    .split(/\s+/); // Split by spaces

  const captureRegex = /([QRNB])?([a-h])?x([a-h][1-8])(=[QRNB])?/;

  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];

    const captureMatch = move.match(captureRegex);
    if (captureMatch) {
      const capturedPiece = captureMatch[1] || "P"; // 'P' means pawn if no letter is provided (default for pawn captures)

      // Check if the move corresponds to a valid sacrifice condition based on the piece type
      if (pieceType === "Q" && capturedPiece === "Q") {
        // The queen was captured - check if it was captured by a rook, knight, bishop, or pawn
        if (["R", "N", "B", "P"].includes(moves[i + 1]?.[0])) {
          return true; // Queen sacrifice
        }
      } else if (pieceType === "R" && capturedPiece === "R") {
        // The rook was captured - check if it was captured by a knight, bishop, or pawn
        if (["N", "B", "P"].includes(moves[i + 1]?.[0])) {
          return true; // Rook sacrifice
        }
      } else if (
        (pieceType === "N" || pieceType === "B") &&
        (capturedPiece === "N" || capturedPiece === "B")
      ) {
        // A minor piece was captured - check if it was captured by a pawn
        if (moves[i + 1]?.[0] === "P") {
          return true; // Minor piece sacrifice
        }
      }
    }
  }

  // If no sacrifice was found
  return false;
}

export class SacrificeFilter implements VideoFilter {
  constructor(private readonly pieceType: "Q" | "R" | "N" | "B") {}

  name(): string {
    return `${this.pieceType} Sacrifice`;
  }

  test(video: Video): boolean {
    // Get the PGNs for the given video using the PGN store
    const pgns = usePgnsStore().pgns.get(video.id) || [];

    return pgns.some((pgn: Pgn) => {
      return isSacrifice(pgn.pgn, this.pieceType);
    });
  }

  equals(other: VideoFilter): boolean {
    return (
      other instanceof SacrificeFilter && this.pieceType === other.pieceType
    );
  }
}
