module rock_paper_scissors_addr::rock_paper_scissors {
    use aptos_framework::randomness;
    use aptos_framework::coin::APT;
    use std::signer;
    use std::string::String;
    use std::error;

    // Represents the state of a game between two players
    struct Game has key {
        player1: address,
        player2: address,
        player1_move: u8,
        player2_move: u8,
        player1_score: u64,
        player2_score: u64,
        rounds: u64,
    }

    const ROCK: u8 = 0;
    const PAPER: u8 = 1;
    const SCISSORS: u8 = 2;

    // ======================== Game Setup ========================

    public entry fun start_game(player1: &signer, player2: address) {
        let player1_address = signer::address_of(player1);
        let game = Game {
            player1: player1_address,
            player2: player2,
            player1_move: 255, // 255 indicates no move yet
            player2_move: 255,
            player1_score: 0,
            player2_score: 0,
            rounds: 0,
        };
        move_to(player1, game);
    }

    // ======================== Game Logic ========================

    public entry fun make_move(player: &signer, player_move: u8) acquires Game {
        let game = borrow_global_mut<Game>(signer::address_of(player));
        if (signer::address_of(player) == game.player1) {
            game.player1_move = player_move;
        } else if (signer::address_of(player) == game.player2) {
            game.player2_move = player_move;
        } else {
            error("Invalid player");
        }

        if (game.player1_move != 255 && game.player2_move != 255) {
            resolve_game(game);
        }
    }

    fun resolve_game(game: &mut Game) {
        let player1_move = game.player1_move;
        let player2_move = game.player2_move;

        // Determine the winner and update scores
        if (player1_move == player2_move) {
            // Tie, no score change
        } else if (
            (player1_move == ROCK && player2_move == SCISSORS) ||
            (player1_move == PAPER && player2_move == ROCK) ||
            (player1_move == SCISSORS && player2_move == PAPER)
        ) {
            game.player1_score += 1;
        } else {
            game.player2_score += 1;
        }

        // Reset moves for the next round
        game.player1_move = 255;
        game.player2_move = 255;
        game.rounds += 1;
    }

    // ======================== View Functions ========================

    #[view]
    public fun get_scores(player: address): (u64, u64, u64) acquires Game {
        let game = borrow_global<Game>(player);
        (game.player1_score, game.player2_score, game.rounds)
    }
}
