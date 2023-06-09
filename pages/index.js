import Head from "next/head";
import styles from "../styles/Home.module.css";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  token,
} from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { walletAdapterIdentity } from "@metaplex-foundation/js";

import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import {
  Metadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
export default function Home() {
  const [nft, setNft] = useState(null);
  const wallet = useWallet();

  const fetchNft = async () => {
    // const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const connection = new Connection("https://api.metaplex.solana.com/");
    const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
    const createResult = await mx.nfts().create(
      {
        uri: "https://raw.githubusercontent.com/Coding-and-Crypto/Rust-Solana-Tutorial/master/nfts/mint-nft/assets/example.json",
        name: "Teri's NFT",
        sellerFeeBasisPoints: 750,
        tokenStandard: TokenStandard.ProgrammableNonFungible,
        tokenOwner: new PublicKey(
          "2Ne1qr6SxgVciCDHk2p2DZYXYGNvVLqhncPTuSu3CSHa"
        ),
      },
      { commitment: "finalized" }
    );

    console.log("create result", createResult);

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

    setNft(createResult.nft);
  };
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
              <button onClick={fetchNft}>Create</button>
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
