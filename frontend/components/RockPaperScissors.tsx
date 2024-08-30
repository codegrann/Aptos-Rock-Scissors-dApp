import React, { useState, useEffect } from 'react';
import { AptosClient, Types, AptosAccount } from 'aptos';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Buffer } from 'buffer';

// Initialize Aptos client
const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');

function RockPaperScissors() {
  // State hooks
  const [player1, setPlayer1] = useState<AptosAccount | null>(null);
  const [player2Address, setPlayer2Address] = useState('');
  const [scores, setScores] = useState({ player1: 0, player2: 0, rounds: 0 });
  const { account } = useWallet(); // Get connected wallet address

  // Update player1 when account changes
  useEffect(() => {
    if (account) {
      setPlayer1(new AptosAccount(new Uint8Array(Buffer.from(account.address.slice(2), 'hex'))));
    }
  }, [account]);

  // Function to start the game
  const startGame = async () => {
    if (!player1 || !player2Address) {
      console.error('Player 1 or Player 2 address is not set');
      return;
    }

    if (!isValidAddress(player2Address)) {
      console.error('Invalid address format for Player 2');
      return;
    }

    const payload: Types.TransactionPayload_EntryFunctionPayload = {
      type: 'entry_function_payload',
      function: 'rock_paper_scissors_addr::rock_paper_scissors::start_game',
      arguments: [player2Address],
      type_arguments: [],
    };

    try {
      const txnRequest = await client.generateTransaction(player1.address().toString(), payload);
      const signedTxn = await client.signTransaction(player1, txnRequest);
      const transactionRes = await client.submitTransaction(signedTxn);
      await client.waitForTransaction(transactionRes.hash);
      fetchScores(player1.address().toString());
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // Function to make a move
  const makeMove = async (move: string) => {
    if (!player1) {
      console.error('Player 1 is not set');
      return;
    }

    const moveMap: Record<string, number> = { rock: 0, paper: 1, scissors: 2 };

    if (!(move in moveMap)) {
      console.error('Invalid move');
      return;
    }

    const payload: Types.TransactionPayload_EntryFunctionPayload = {
      type: 'entry_function_payload',
      function: 'rock_paper_scissors_addr::rock_paper_scissors::make_move',
      arguments: [moveMap[move]],
      type_arguments: [],
    };

    try {
      const txnRequest = await client.generateTransaction(player1.address().toString(), payload);
      const signedTxn = await client.signTransaction(player1, txnRequest);
      const transactionRes = await client.submitTransaction(signedTxn);
      await client.waitForTransaction(transactionRes.hash);
      fetchScores(player1.address().toString());
    } catch (error) {
      console.error('Error making move:', error);
      
    }
  };

  // Function to fetch scores
  const fetchScores = async (playerAddress: string) => {
    try {
      const response = await client.getAccountResource(
        playerAddress,
        'rock_paper_scissors_addr::rock_paper_scissors::Game'
      );

      const data = response.data as { player1_score: number; player2_score: number; rounds: number };

      setScores({ player1: data.player1_score, player2: data.player2_score, rounds: data.rounds });
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    }
  };

  // Validate address format
  const isValidAddress = (address: string) => {
    const addressRegex = /^0x[a-fA-F0-9]{64}$/;
    return addressRegex.test(address);
  };

  // Reset scores
  const resetGame = () => {
    setScores({ player1: 0, player2: 0, rounds: 0 });
  };

  return (
    <div>
      <h1>Rock Paper Scissors</h1>
      <div>
        <input
          type="text"
          placeholder="Player 2 Address"
          value={player2Address}
          onChange={(e) => setPlayer2Address(e.target.value)}
        />
      </div>
      <button onClick={startGame}>Start Game</button>
      <button onClick={() => makeMove('rock')}>Rock</button>
      <button onClick={() => makeMove('paper')}>Paper</button>
      <button onClick={() => makeMove('scissors')}>Scissors</button>
      <div>
        <h2>Scores</h2>
        <p>Player 1: {scores.player1}</p>
        <p>Player 2: {scores.player2}</p>
        <p>Rounds Played: {scores.rounds}</p>
      </div>
      <button onClick={resetGame}>Restart Game</button>
    </div>
  );
}

export default RockPaperScissors;
