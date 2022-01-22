import { useEffect, useRef, VFC } from "react";
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
    //     key: "e6787414-79f4-4e6e-8658-9bc814d731fc",
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
          <div className="percentRed"></div>
        </div>

        <div className="vote">
          <button className="vote-button">Player1</button>
          <button className="vote-button">Player2</button>
        </div>
      </div>
    </Layout>
  );
};
