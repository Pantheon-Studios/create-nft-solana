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

const collection = new PublicKey(
  "D9vMrcwxYEzzL29m6AAnsQ8Mdn614ya6AqyefkDq7Do9" // test collection
);

export default function Home() {
  const [nft, setNft] = useState(null);
  const wallet = useWallet();

  const airDrop = async () => {
    // const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const connection = new Connection("https://api.metaplex.solana.com/");
    const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
    const createResult = await mx.nfts().create(
      {
        uri: "https://raw.githubusercontent.com/Pantheon-Studios/create-nft-solana/main/assets/nft.json",
        name: "Test NFT #1",
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

    console.log("create result", createResult);

    const verifyResult = await mx.nfts().verifyCollection({
      collectionMintAddress: collection,
      mintAddress: createResult.nft.mint.address,
    });

    console.log("verify result", verifyResult);

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

  async function createCollection() {
    const connection = new Connection("https://api.metaplex.solana.com/");
    const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
    const createResult = await mx.nfts().create({
      uri: "https://raw.githubusercontent.com/Pantheon-Studios/create-nft-solana/main/assets/collection.json",
      isCollection: true,
      name: "Test Collection",
      sellerFeeBasisPoints: 750,
    });
    console.log("create coollection result", createResult);
  }

  async function verify() {
    const connection = new Connection("https://api.metaplex.solana.com/");
    const mx = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
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
                <button onClick={createCollection}>Create Collection</button>
                <button onClick={verify}>verify</button>
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
