// import React, { useState, useEffect } from 'react';
// import { AptosClient, Types, AptosAccount } from 'aptos';
// import { useWallet } from '@aptos-labs/wallet-adapter-react';
// import { Buffer } from 'buffer';

// // Initialize Aptos client
// const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');

// function RockPaperScissors() {
//   // State hooks
//   const [player1, setPlayer1] = useState<AptosAccount | null>(null);
//   const [player2Address, setPlayer2Address] = useState('');
//   const [scores, setScores] = useState({ player1: 0, player2: 0, rounds: 0 });
//   const { account } = useWallet(); // Get connected wallet address

//   // Update player1 when account changes
//   useEffect(() => {
//     if (account) {
//       setPlayer1(new AptosAccount(new Uint8Array(Buffer.from(account.address.slice(2), 'hex'))));
//     }
//   }, [account]);

//   // Function to start the game
//   const startGame = async () => {
//     if (!player1 || !player2Address) {
//       console.error('Player 1 or Player 2 address is not set');
//       return;
//     }

//     if (!isValidAddress(player2Address)) {
//       console.error('Invalid address format for Player 2');
//       return;
//     }

//     const payload: Types.TransactionPayload_EntryFunctionPayload = {
//       type: 'entry_function_payload',
//       function: 'rock_paper_scissors_addr::rock_paper_scissors::start_game',
//       arguments: [player2Address],
//       type_arguments: [],
//     };

//     try {
//       const txnRequest = await client.generateTransaction(player1.address().toString(), payload);
//       const signedTxn = await client.signTransaction(player1, txnRequest);
//       const transactionRes = await client.submitTransaction(signedTxn);
//       await client.waitForTransaction(transactionRes.hash);
//       fetchScores(player1.address().toString());
//     } catch (error) {
//       console.error('Error starting game:', error);
//     }
//   };

//   // Function to make a move
//   const makeMove = async (move: string) => {
//     if (!player1) {
//       console.error('Player 1 is not set');
//       return;
//     }

//     const moveMap: Record<string, number> = { rock: 0, paper: 1, scissors: 2 };

//     if (!(move in moveMap)) {
//       console.error('Invalid move');
//       return;
//     }

//     const payload: Types.TransactionPayload_EntryFunctionPayload = {
//       type: 'entry_function_payload',
//       function: 'rock_paper_scissors_addr::rock_paper_scissors::make_move',
//       arguments: [moveMap[move]],
//       type_arguments: [],
//     };

//     try {
//       const txnRequest = await client.generateTransaction(player1.address().toString(), payload);
//       const signedTxn = await client.signTransaction(player1, txnRequest);
//       const transactionRes = await client.submitTransaction(signedTxn);
//       await client.waitForTransaction(transactionRes.hash);
//       fetchScores(player1.address().toString());
//     } catch (error) {
//       console.error('Error making move:', error);
      
//     }
//   };

//   // Function to fetch scores
//   const fetchScores = async (playerAddress: string) => {
//     try {
//       const response = await client.getAccountResource(
//         playerAddress,
//         'rock_paper_scissors_addr::rock_paper_scissors::Game'
//       );

//       const data = response.data as { player1_score: number; player2_score: number; rounds: number };

//       setScores({ player1: data.player1_score, player2: data.player2_score, rounds: data.rounds });
//     } catch (error) {
//       console.error('Failed to fetch scores:', error);
//     }
//   };

//   // Validate address format
//   const isValidAddress = (address: string) => {
//     const addressRegex = /^0x[a-fA-F0-9]{64}$/;
//     return addressRegex.test(address);
//   };

//   // Reset scores
//   const resetGame = () => {
//     setScores({ player1: 0, player2: 0, rounds: 0 });
//   };

//   return (
//     <div>
//       <h1>Rock Paper Scissors</h1>
//       <div>
//         <input
//           type="text"
//           placeholder="Player 2 Address"
//           value={player2Address}
//           onChange={(e) => setPlayer2Address(e.target.value)}
//         />
//       </div>
//       <button onClick={startGame}>Start Game</button>
//       <button onClick={() => makeMove('rock')}>Rock</button>
//       <button onClick={() => makeMove('paper')}>Paper</button>
//       <button onClick={() => makeMove('scissors')}>Scissors</button>
//       <div>
//         <h2>Scores</h2>
//         <p>Player 1: {scores.player1}</p>
//         <p>Player 2: {scores.player2}</p>
//         <p>Rounds Played: {scores.rounds}</p>
//       </div>
//       <button onClick={resetGame}>Restart Game</button>
//     </div>
//   );
// }

// export default RockPaperScissors;

import React, { useState, useEffect } from 'react';
import { AptosClient, Types } from 'aptos';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Initialize Aptos client
const client = new AptosClient('https://fullnode.testnet.aptoslabs.com');

function RockPaperScissors() {
  const [player1Address, setPlayer1Address] = useState<string>('');
  const [player2Address, setPlayer2Address] = useState<string>('');
  const [scores, setScores] = useState({ player1: 0, player2: 0, rounds: 0 });
  const [result, setResult] = useState<number | null>(null);
  const { account, signAndSubmitTransaction } = useWallet();

  // Update player1Address when account changes
  useEffect(() => {
    if (account) {
      setPlayer1Address(account.address);
    }
  }, [account]);

  // Function to start the game
  const startGame = async () => {
    if (!player1Address || !player2Address) {
      console.error('Player 1 or Player 2 address is not set');
      return;
    }

    const payload: Types.TransactionPayload_EntryFunctionPayload = {
      type: 'entry_function_payload',
      function: 'rock_paper_scissors_addr::rock_paper_scissors::start_game',
      arguments: [player2Address],
      type_arguments: [],
    };

    try {
      const response = await signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      fetchScores(player1Address);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  // Function to make a move
  const makeMove = async (move: string) => {
    if (!player1Address) {
      console.error('Player 1 address is not set');
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
      const response = await signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      fetchScores(player1Address);
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
      setScores({
        player1: response.data.player1_score,
        player2: response.data.player2_score,
        rounds: response.data.rounds,
      });
      setResult(response.data.result); // Fetch result if needed
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Rock-Paper-Scissors Game</h1>

      <div>
        <label>Player 2 Address:</label>
        <input
          type="text"
          value={player2Address}
          onChange={(e) => setPlayer2Address(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
        <button onClick={startGame} style={{ marginLeft: '10px' }}>
          Start Game
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => makeMove('rock')}>Rock</button>
        <button onClick={() => makeMove('paper')} style={{ marginLeft: '10px' }}>
          Paper
        </button>
        <button onClick={() => makeMove('scissors')} style={{ marginLeft: '10px' }}>
          Scissors
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Scores</h3>
        <p>Player 1: {scores.player1}</p>
        <p>Player 2: {scores.player2}</p>
        <p>Rounds Played: {scores.rounds}</p>
      </div>

      {result !== null && (
        <div style={{ marginTop: '20px' }}>
          <h3>Game Result</h3>
          <p>{result === 2 ? 'You Win!' : result === 3 ? 'Computer Wins!' : 'It\'s a Draw!'}</p>
        </div>
      )}
    </div>
  );
}

export default RockPaperScissors;
