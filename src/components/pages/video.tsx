import { useEffect, useRef, useState, VFC } from "react";
import "../../styles/video.scss";
import Peer from "skyway-js";
import { Layout } from "../Layout/Layout";

const getLocalStream = async (): Promise<MediaStream> => {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  return localStream;
};

const setVideo = (video: HTMLVideoElement, stream: MediaStream): void => {
  video.srcObject = stream;
  video.play().catch((err) => {
    console.error(err);
  });
};

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
      if (!video1Ref.current || !video2Ref.current) return;
      const peer = new Peer({
        key: "1e179486-5b5e-46ac-b8ac-1f014b82918a",
        debug: 0,
      });
      let lsm: MediaStream | undefined;
      const isVacancy1 = !video1Ref.current.srcObject;
      const isVacancy2 = !video2Ref.current.srcObject;
      if (isVacancy1 || isVacancy2) {
        console.log("参戦");

        const localStream = await getLocalStream();
        lsm = localStream;
        setVideo(video1Ref.current, localStream);
      }
      peer.on("open", () => {
        const room = peer.joinRoom("room-id2", {
          mode: "mesh",
          stream: lsm,
        });
        room.once("open", () => {
          console.log("=== You joined ===");
        });
        room.on("peerJoin", (peerId) => {
          console.log(`=== ${peerId} joined ===`);
        });
        room.on("stream", (stream) => {
          console.log("stream");
          if (!video1Ref.current || !video2Ref.current) return;
          if (!video1Ref.current.srcObject) {
            video1Ref.current.srcObject = stream;
          }
          if (!video2Ref.current.srcObject) {
            video2Ref.current.srcObject = stream;
          }
        });
      });
    })().catch((e) => {
      console.error(e);
    });
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
