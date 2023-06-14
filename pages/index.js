import Head from "next/head";
import styles from "../styles/Home.module.css";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  token,
} from "@metaplex-foundation/js";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { useState } from "react";
import { walletAdapterIdentity } from "@metaplex-foundation/js";

import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import {
  Metadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";

const collection = new PublicKey(
  "J2Kde4dWUTmPvcgXVs95v1sEtynf3BXd8Qv5Xw7e6BJT" // test collection
);

function mergeTransactions(txs, blockhash) {
  const t = txs[0].toTransaction({
    blockhash,
  });
  txs.slice(1).forEach((tx) => {
    tx.toTransaction({ blockhash }).instructions.forEach((ix) => {
      t.add(ix);
    });
  });
  return t;
}

export default function Home() {
  const [nft, setNft] = useState(null);
  const wallet = useWallet();

  const airDrop = async () => {
    // const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const connection = new Connection(
      "https://api.metaplex.solana.com/"
    );
    const mx = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );
    const t1 = await mx
      .nfts()
      .builders()
      .create(
        {
          uri: "https://raw.githubusercontent.com/Pantheon-Studios/create-nft-solana/main/assets/nft.json",
          name: "Test NFT #1",
          sellerFeeBasisPoints: 750,
          tokenStandard: TokenStandard.ProgrammableNonFungible,
          tokenOwner: new PublicKey(
            "2Ne1qr6SxgVciCDHk2p2DZYXYGNvVLqhncPTuSu3CSHa" // teri
            // "3dTR6xHyk7D2dpRKjGi6C4TvxqLi4era747TdTevdSYj" // marti
          ),
          collection: collection,
        },
        { commitment: "finalized" }
      );

    const t2 = await mx
      .nfts()
      .builders()
      .create(
        {
          uri: "https://raw.githubusercontent.com/Coding-and-Crypto/Rust-Solana-Tutorial/master/nfts/mint-nft/assets/example.json",
          name: "Test NFT #2",
          sellerFeeBasisPoints: 750,
          tokenStandard: TokenStandard.ProgrammableNonFungible,
          tokenOwner: new PublicKey(
            // "2Ne1qr6SxgVciCDHk2p2DZYXYGNvVLqhncPTuSu3CSHa" // teri
            "3dTR6xHyk7D2dpRKjGi6C4TvxqLi4era747TdTevdSYj" // marti
          ),
          collection: collection,
        },
        { commitment: "finalized" }
      );

    // const merged = mergeTransactions(
    //   [t1, t2],
    //   (await connection.getLatestBlockhash()).blockhash
    // );

    const blockhash = (await connection.getLatestBlockhash())
      .blockhash;

    // const signed = await wallet.signAllTransactions([
    //   t1.toTransaction({ blockhash }),
    //   t2.toTransaction({ blockhash }),
    // ]);

    // const signed = [
    //   await wallet.signTransaction(t1.toTransaction({ blockhash })),
    //   await wallet.signTransaction(t2.toTransaction({ blockhash })),
    // ];

    // console.log(signed);

    // const promises = signed.map((tx) =>
    //   connection.sendRawTransaction(tx.serialize())
    // );
    // const results = await Promise.all(promises);

    // console.log("results", results);

    // console.log(wallet.publicKey.toString());

    // const tokenSinger = t1.getSigners()[2];

    // t1.feePayer = wallet.publicKey;
    // t1.recentBlockhash = blockhash;
    // t1.sign(tokenSinger);

    // const signedTx = await wallet.signTransaction(t1.toTransaction());

    // const txResult = await connection.sendRawTransaction(signedTx.serialize());
    // console.log(txResult);

    // works
    // await metaplex.rpc().sendAndConfirmTransaction(transactionBuilder);

    // const signedTx = await mx
    //   .identity()
    //   .signTransaction(t1.toTransaction({ blockhash }));

    const transactionBuilders = [t1, t2];

    const transactionsSignedByKeypair = transactionBuilders
      .map((tx) => tx.toTransaction({ blockhash }))
      .map((tx, i) => {
        for (const signer of transactionBuilders[i].getSigners()) {
          if (signer._keypair) {
            tx.partialSign(signer);
          }
        }
        return tx;
      });

    const transactionsSignedByWallet =
      await wallet.signAllTransactions(transactionsSignedByKeypair);

    const promises = transactionsSignedByWallet.map((tx) =>
      connection.sendRawTransaction(tx.serialize())
    );

    const results = await Promise.allSettled(promises);

    console.log("results", results);

    // ---
    // works
    // let tx = t1.toTransaction({ blockhash });
    // console.log("tx", tx);
    // for (const signer of t1.getSigners()) {
    //   if (signer._keypair) {
    //     tx.partialSign(signer);
    //   }
    //   console.log("signer", signer);
    //   console.log("tx", tx);
    // }
    // tx = await wallet.signTransaction(tx);

    // console.log(t1);
    // const txResult = await connection.sendRawTransaction(tx.serialize());

    // console.log("txresuykt", txResult);
    // ---

    // await wallet.sendTransaction(t1.toTransaction({ blockhash }), connection);

    // console.log("create result", createResult);

    // const verifyResult = await mx.nfts().verifyCollection({
    //   collectionMintAddress: collection,
    //   mintAddress: createResult.nft.mint.address,
    // });

    // console.log("verify result", verifyResult);

    // const mintResult = await mx.nfts().mint({
    //   nftOrSft: createResult.nft,
    //   toOwner: new PublicKey("2Ne1qr6SxgVciCDHk2p2DZYXYGNvVLqhncPTuSu3CSHa"),
    //   amount: token(1),
    // });

    // console.log("mint result", mintResult);

    // const signerman = new Keypair();
    // const result = await mx.nfts().create({
    //   updateAuthority: signerman,
    //   mintAuthority: signerman,
    //   useNewMint: signerman,
    //   mintTokens: true,
    //   tokenOwner: wallet?.publicKey,
    //   tokenStandard: TokenStandard.ProgrammableNonFungible,
    //   uri: "https://arweave.net/Al7yuB-ew-3LoD0hvhXzGElLgZnX2S4qZMC5w0STc7s",
    //   name: "test pNFT",
    //   sellerFeeBasisPoints: 0,
    // });

    // setNft(createResult.nft);
  };

  async function updateCollection() {
    // their address 55mQPP2GhjpEdhLc5G8bKLWykT2ff7gHDG5bVyvoPPAa
    const connection = new Connection(
      "https://api.metaplex.solana.com/"
    );
    const mx = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );
    const nft = await mx.nfts().findByMint({
      mintAddress: new PublicKey(
        "J2Kde4dWUTmPvcgXVs95v1sEtynf3BXd8Qv5Xw7e6BJT"
      ),
    });
    const createResult = await mx.nfts().update({
      nftOrSft: nft,
      uri: "https://solana-airdrop.vercel.app/collection",
      isCollection: true,
      name: "r3cycle",
      sellerFeeBasisPoints: 750,
      creators: [
        {
          address: new PublicKey(
            "55mQPP2GhjpEdhLc5G8bKLWykT2ff7gHDG5bVyvoPPAa"
          ),
          share: 100,
        },
      ],
    });
    console.log("create coollection result", createResult);
  }

  async function createCollection() {
    const connection = new Connection(
      "https://api.metaplex.solana.com/"
    );
    const mx = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );
    const createResult = await mx.nfts().create({
      uri: "https://solana-airdrop.vercel.app/collection",
      isCollection: true,
      name: "r3cycle",
      sellerFeeBasisPoints: 750,
    });
    console.log("create coollection result", createResult);
  }

  async function verify() {
    const connection = new Connection(
      "https://api.metaplex.solana.com/"
    );
    const mx = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    );
    const verifyResult = await mx.nfts().verifyCollection({
      collectionMintAddress: collection,
      mintAddress: new PublicKey(
        "H3oUn5ieZikKGbUn9WfDpyGMYHuCCiHc3NDLHgUQmagr"
      ),
    });
    console.log("verify result", verifyResult);
  }

  return (
    <div>
      <Head>
        <title>Metaplex and Next.js example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.App}>
        <div className={styles.container}>
          <div className={styles.nftForm}>
            {wallet.connected ? (
              <>
                <button onClick={airDrop}>AirDrop</button>
                <button onClick={createCollection}>
                  Create Collection
                </button>
                <button onClick={verify}>verify</button>
                <button onClick={updateCollection}>update </button>
              </>
            ) : (
              "Please connect first"
            )}
          </div>
          {nft && (
            <div className={styles.nftPreview}>
              <h1>{nft.name}</h1>
              <img
                src={nft.json.image}
                alt="The downloaded illustration of the provided NFT address."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
