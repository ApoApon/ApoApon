import { off } from "process";
import { useEffect, useRef, useState, VFC } from "react";
import "../../styles/video.scss";
// import Peer from "skyway-js";
import { Layout } from "../Layout/Layout";

const getLocalStream = async (): Promise<MediaStream> => {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  return localStream;
};

// const setVideo = (video: HTMLVideoElement, stream: MediaStream): void => {
//   console.log(video.srcObject);

//   video.srcObject = stream;
//   video.play().catch((err) => {
//     console.error(err);
//   });
// };

export const Video: VFC = () => {
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  // const [isPlayer, setIsPlayer] = useState(false);
  // const [peer, setPeer] = useState<Peer | null>(null);
  const [vote, setVote] = useState<"p1" | "p2" | "none">("none");
  const [voteRatio, setVoteRatio] = useState<number>(3);

  useEffect(() => {
    setInterval(() => {
      const random = Math.floor(Math.random() * 2);
      setVoteRatio((prev) => {
        if (prev === 4 || Math.random() > 0.5) return prev - random;
        return prev + random;
      });
    }, 1500);
  }, []);

  // set up peer
  useEffect(() => {
    console.log("effect");
    (async () => {
      // レイアウト確認用
      const localStream = await getLocalStream().catch((e) => {
        console.error(e);
      });
      if (!video1Ref.current || !video2Ref.current || !localStream) return;
      video1Ref.current.srcObject = localStream;
      video2Ref.current.srcObject = localStream;
    })().catch((e) => {
      console.error(e);
    });

    // (async () => {
    //   if (!video1Ref.current || !video2Ref.current) return;
    //   const peer = new Peer({
    //     key: "",
    //     debug: 0,
    //   });
    //   let lsm: MediaStream | undefined;
    //   if (isPlayer) {
    //     const { localStream } = await getLocalStream();
    //     lsm = localStream;
    //     setVideo(video1Ref.current, localStream);
    //   }
    //   peer.on("open", (id) => {
    //     const room = peer.joinRoom("room-id2", {
    //       mode: "mesh",
    //       stream: lsm,
    //     });
    //     room.once("open", () => {
    //       console.log("=== You joined ===");
    //     });
    //     room.on("peerJoin", (peerId) => {
    //       console.log(`=== ${peerId} joined ===`);
    //     });
    //     room.on("stream", async (stream) => {
    //       console.log("stream");
    //       if (!video1Ref.current || !video2Ref.current) return;
    //       if (!video1Ref.current.srcObject) {
    //         video1Ref.current.srcObject = stream;
    //       }
    //       if (!video2Ref.current.srcObject) {
    //         video2Ref.current.srcObject = stream;
    //       }
    //       console.log("あなたは感染者");
    //     });
    //   });
    // })();
  }, []);

  return (
    <Layout>
      <div className="videoPage">
        <div className="access">121人視聴中</div>
        <div className="videos">
          <div className="videoItem">
            <p className="userName">Player1</p>
            <video ref={video1Ref} autoPlay muted playsInline></video>
          </div>
          <div className="videoItem">
            <p className="userName">Player2</p>
            <video ref={video2Ref} autoPlay muted playsInline></video>
          </div>
        </div>

        <div className="percent">
          <div
            className="percentRed"
            style={{
              width: `${(voteRatio + (vote === "p1" ? 1 : 0)) * 20}%`,
            }}
          ></div>
        </div>

        <div className="vote">
          <button
            className="vote-button"
            onClick={() => {
              setVote("p1");
            }}
          >
            Player1
          </button>
          <button
            className="vote-button"
            onClick={() => {
              setVote("p2");
            }}
          >
            Player2
          </button>
        </div>
      </div>
    </Layout>
  );
};
