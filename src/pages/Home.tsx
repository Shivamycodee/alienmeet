import { useRef, useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import axios from "axios";
import ChatBox from "../components/ChatBox";
import ClipLoader from "react-spinners/ClipLoader";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import { IoCameraReverse } from "react-icons/io5";
import Toast from "react-hot-toast";
import {
  // FREE_STUN_Server,
  FREE_TURN_SERVER,
  PAID_TURN_SERVER,
} from "../lib/stun-turn-server";
import { MdPhotoCamera } from "react-icons/md";
import { BiSolidCameraOff } from "react-icons/bi";
import { useMediaQuery } from 'react-responsive'

// ------------------ WSS SERVER CONNECTION STRINGS STARTS ------------------ //

// const WSS_LOCAL_URI = "ws://localhost:8080";
//  let WSS_URI = WSS_LOCAL_URI;
let WSS_URI = import.meta.env.VITE_SERVER_WSS;

//  let HTTPS_URI = "http://localhost:8080/getTotalLivePeers";
let HTTPS_URI = import.meta.env.VITE_SERVER_HTTPS;

// ------------------ WSS SERVER CONNECTION STRINGS ENDS ------------------ //


interface RemotePeer {
  id: string | null;
  stream: MediaStream | null;
}

interface Message {
  text: string;
  sender: "local" | "remote";
}

export default function Home() {
  const [peerId, setPeerId] = useState("");
  const [remotePeers, setRemotePeers] = useState<RemotePeer | null>(null);
  const [joined, setJoined] = useState(false);
  const [livePeers, setLivePeers] = useState(0);
  const [canChangePeer, setCanChangePeer] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendDataChannel, setSendDataChannel] = useState<RTCDataChannel>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPermissionGranted, setIsPermissionGranted] =
    useState<boolean>(false);
  const [isMute, setIsMute] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [leadingPeer, setLeadingPeer] = useState<boolean>(false);
  const [currentFacingMode, setCurrentFacingMode] = useState<
    "user" | "environment"
  >("user");
  const [spc, setScp] = useState<any>(null);

  const webcamVideo = useRef<HTMLVideoElement>(null);
  let peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStream = useRef<MediaStream | null>(null);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDesktop = useMediaQuery({ minWidth: 768 });

  const { sendJsonMessage,getWebSocket } = useWebSocket(joined ? WSS_URI : null, {
    onMessage: (event) => {
      const message = JSON.parse(event.data);
      handleSignalingMessage(message);
    },
    onOpen: () => {},
    shouldReconnect: () => true,
  });

  // When remotePeers updates, create new connections as needed.
  // If we're the new joiner and already have media, initiate negotiation.
  useEffect(() => {
    if (remotePeers?.id) {
      if (!peerConnections.current.has(remotePeers.id)) {
        createPeerConnection(remotePeers.id);
        if (localStream.current) {
          negotiateConnection(remotePeers.id);
        }
      }
    }
  }, [remotePeers]);

  useEffect(() => {
    if (remotePeers?.stream && joined) {
      setCanChangePeer(true);
      setMessageInput("");
      setMessages([]);
    } else if (canChangePeer) {
      setCanChangePeer(false);
    }
  }, [joined, remotePeers]);

  function handleLocalStream(stream: MediaStream) {
    const oldStream = localStream.current;

    localStream.current = stream;
    if (webcamVideo.current) webcamVideo.current.srcObject = stream;

    if (spc) {
      // Replace tracks in the peer connection
      const senders = spc.getSenders();
      stream.getTracks().forEach((newTrack) => {
        const sender = senders.find(
          (s: any) => s.track?.kind === newTrack.kind
        );
        if (sender) {
          sender.replaceTrack(newTrack);
        } else {
          spc.addTrack(newTrack, stream);
        }
      });

      // Stop the old tracks after replacing
      if (oldStream) {
        oldStream.getTracks().forEach((track) => track.stop());
      }
    }
  }

  const connectToAlien = () => {

    if(!localStream.current) {
      Toast.error("Please allow camera access first!");
      return;
    }

    setJoined(true);
    setIsLoading(true);
  };


  // Send message function
  const sendMessage = (e:any) => {

    e.preventDefault();

    if (
      sendDataChannel &&
      sendDataChannel?.readyState === "open" &&
      messageInput != "" &&
      messageInput != null
    ) {
      sendDataChannel?.send(messageInput);
      setMessages((prev) => [...prev, { text: messageInput, sender: "local" }]);
      setMessageInput("");
    }
  };

  const setupDataChannel = (dataChannel: RTCDataChannel) => {
  dataChannel.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "video-status") {
        setRemoteVideoEnabled(message.enabled);
        return;
      }
      // Existing message handling...
    } catch (e) {
      // Handle regular messages
      setMessages((prev) => [...prev, { text: event.data, sender: "remote" }]);
    }
  };
};
  
  // ------------------ Handling Peer connection using createPeerConnection ------------------ //

  const createPeerConnection = (remotePeerId: string): RTCPeerConnection => {

    if (peerConnections.current.has(remotePeerId)) {
      return peerConnections.current.get(remotePeerId)!;
    }

    const baseSTUN = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];

    const turn_servers = FREE_TURN_SERVER.concat(PAID_TURN_SERVER);
    const servers: any = baseSTUN.concat(turn_servers);

    const pc = new RTCPeerConnection({
      iceServers: servers,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendJsonMessage({
          type: "ice-candidate",
          candidate: event.candidate,
          target: remotePeerId,
          sender: peerId,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        console.log("ICE CONNECTION STATE FAILED");
      }
    };

    // Add this: Create a data channel
    const dataChannel = pc.createDataChannel("chat");
    setSendDataChannel(dataChannel);
    setupDataChannel(dataChannel); // Handle data channel events

    // For the answerer (peer receiving the offer):
    pc.ondatachannel = (event) => {
      const dataChannel = event.channel;
      setSendDataChannel(dataChannel);
      setupDataChannel(dataChannel);
    };


    // Update your ontrack handler
      // Update your ontrack handler
    pc.ontrack = (event) => { 

        if (event.track.kind === "video") {
    // Handle video track specifically
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!event.streams[0]) return;

    // Clear existing video tracks
    const remoteStream = remoteStreamRef.current;
    if (remoteStream) {
      remoteStream.getVideoTracks().forEach(track => track.stop());
    }

    // Add new video track
    const newStream = new MediaStream([
      ...(remoteStream?.getAudioTracks() || []),
      event.track
    ]);

    remoteStreamRef.current = newStream;
    videoElement.srcObject = newStream;
  } else {
    // Handle audio track
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(
      new MediaStream([event.track])
    );
    source.connect(audioContext.destination);
  }

      const newStream = new MediaStream();

      // Copy existing tracks if any
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((track) => {
          newStream.addTrack(track);
        });
      }

      // Add new track
      newStream.addTrack(event.track);

      // Update references
      remoteStreamRef.current = newStream;
      
      // Force React update with new stream instance
      setRemotePeers({
        id: remotePeerId,
        stream: new MediaStream(newStream), // Fresh instance for React
      });
      
      // Handle playback safely
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      
    };

    // Add local tracks if available.
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current!);
      });
    }

    peerConnections.current.set(remotePeerId, pc);
    setScp(pc);
    return pc;
  };

  const handleSignalingMessage = async (message: any) => {
    try {
      switch (message.type) {
        case "total-live-peer":
          setLivePeers(message.length);
          break;
        case "your-id":
          console.log("YOUR PEER ID IS : ",message.id)
          setPeerId(message.id);
          break;
        case "waiting":
          // console.log('keep sending message for check every 4 seconds...');
          break;
        case "start":
          setLeadingPeer(message.sendOffer);
          setRemotePeers({
            id: message.peer,
            stream: null,
          });
          break;

        case "offer": {
          const pcOffer = createPeerConnection(message.sender);
          // Set remote description only if we’re not already negotiating.
          if (
            pcOffer.signalingState === "stable" ||
            pcOffer.signalingState === "have-local-offer"
          ) {
            await pcOffer.setRemoteDescription(
              new RTCSessionDescription(message.offer)
            );
            const answer = await pcOffer.createAnswer();
            await pcOffer.setLocalDescription(answer);
            sendJsonMessage({
              type: "answer",
              answer: answer,
              target: message.sender,
              sender: peerId,
            });
          } else {
            console.warn(
              `Skipping offer processing from ${message.sender} due to signaling state:`,
              pcOffer.signalingState
            );
          }
          break;
        }
        case "answer": {
          const pc = peerConnections.current.get(message.sender);
          if (!pc) return;
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(
              new RTCSessionDescription(message.answer)
            );
          } else {
            console.warn("Ignoring answer in state:", pc.signalingState);
          }
          break;
        }

        case "ice-candidate": {
          const pcIce = peerConnections.current.get(message.sender);
          if (pcIce) {
            await pcIce.addIceCandidate(new RTCIceCandidate(message.candidate));
          }
          break;
        }

        case "switch-person":
          setRemotePeers({
            id: null,
            stream: null,
          });
          remoteStreamRef.current = null;
            // Reset video element immediately
         if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.pause();
         }

         peerConnections.current.forEach((pc) => pc.close());
         peerConnections.current.clear();

          peerConnections.current = new Map();
          break;

        case "peer-disconnected": {
          setRemotePeers(null);

          // Properly clean up video element
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.pause(); // ⚠️⚠️
          }

          if(remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((track) => track.stop());
          }
          remoteStreamRef.current = null;

          // Clean up peer connection
          const pc = peerConnections.current.get(message.sender);
          if (pc) {
            pc.getSenders().forEach((sender) => {
              if (sender.track) sender.track.stop();
            });
            pc.close();
            peerConnections.current.delete(message.sender);
          }
          break;
        }
      }
    } catch (error) {
      console.error("handleSignalingMessage: ", error);
    }
  };

  // Switch Person...
  const switchPerson = async () => {

     // Clear existing remote stream reference
  remoteStreamRef.current = null; // 🆕 Add this

  // Reset video element immediately
  if (videoRef.current) {
    videoRef.current.srcObject = null;
    videoRef.current.pause();
  }

    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    if (!canChangePeer) return Toast("Connect to someone to skip!");

    setRemotePeers({
      id: null,
      stream: null,
    });

    peerConnections.current = new Map();

    sendJsonMessage({
      type: "switch-person",
      sender: peerId,
      current: remotePeers?.id,
    });
  };

  // Create an offer and send it if the connection is ready.
  const negotiateConnection = async (remotePeerId: string) => {
    const pc = peerConnections.current.get(remotePeerId);
    if (!pc) return;

    // Only negotiate if the connection is in a stable state.
    if (pc.signalingState !== "stable") {
      console.warn(
        `Negotiation skipped for ${remotePeerId} because signaling state is ${pc.signalingState}`
      );
      return;
    }

    try {
      if (leadingPeer) {
        return;
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendJsonMessage({
        type: "offer",
        offer: offer,
        target: remotePeerId,
        sender: peerId,
      });
    } catch (error) {
      console.error("Negotiation error:", error);
    }
  };

  const disconnectRemoteStream = ()=>{

    setJoined(false);
    const ws = getWebSocket(); // Get the WebSocket instance
    if (ws) {
      ws.close(); // Close the connection
      // console.log("WebSocket disconnected");
    }

    setLivePeers((prev) => prev - 1);

    setRemotePeers({
      id: null,
      stream: null,
    });
    remoteStreamRef.current = null;
    setIsLoading(false);
    setLeadingPeer(false);
    setCanChangePeer(false);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause(); // ⚠️⚠️
    }

    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    peerConnections.current = new Map();
    setMessages([]);
    setMessageInput("");
    setSendDataChannel(undefined);

  }


  // ---------------------------------- Not webRTC logic ---------------------------------- //

  // handle mute and unmute....

  const toggleMute = async () => {
    const newMuteState = !isMute;

    setIsMute(newMuteState);
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
    }
  };

  const toggleVideo = async () => {
  const newVideoState = !videoEnabled;
  setVideoEnabled(newVideoState);

  // Toggle local video track
  if (localStream.current) {
    const videoTrack = localStream.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = newVideoState;
      
      // Send status to remote peer
      if (sendDataChannel?.readyState === "open") {
        sendDataChannel.send(JSON.stringify({
          type: "video-status",
          enabled: newVideoState
        }));
      }
    }
  }
};

  // getting camera access and all that..
  async function checkAndRequestMedia() {
    if (localStream.current) {
      return;
    }

    // console.log("User Agent is : ",navigator.userAgent)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          //  width: { ideal: 320 },
          //  height: { ideal: 240 },
          //  frameRate: { ideal: 15 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      handleLocalStream(stream);
      setIsPermissionGranted(true);
    } catch (error) {
      console.error("Error while checking/requesting permissions:", error);
      setIsPermissionGranted(false);
    }
  }

  async function handleReverseCamera() {
    const result = await hasBackCamera();
    if (!result) return Toast.error("No Back Cam Found");

    // stop the current stream...
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    try {
      // Flip the camera mode
      const temp = currentFacingMode === "user" ? "environment" : "user";

      setCurrentFacingMode(temp);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: temp,
          // width: { ideal: 320 },
          // height: { ideal: 240 },
          // frameRate: { ideal: 15 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      handleLocalStream(stream);
    } catch (error) {
      console.error("Failed to switch camera:", error);
    }
  }

  // get initial peer count
  useEffect(() => {
    axios(HTTPS_URI)
      .then((res) => {
        if (typeof res?.data?.length == "number") setLivePeers(res.data.length);
      })
      .catch((e: Error) => console.error("http request error: ", e));
  }, []);

  // clear user video & audio stream when app unmounts...
  useEffect(() => {
    checkAndRequestMedia();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Add this useEffect hook to your component
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    if (joined) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [joined]);

  async function lowerVideoQuality() {
    if (!spc) return;
    const sender = spc.getSenders().find((s:any) => s.track?.kind === "video");
    if (!sender) return;
  
    const params = sender.getParameters();
    if (!params.encodings) {
      params.encodings = [{}];
    }
  
    // Lower the target bitrate to 150 kbps
    params.encodings[0].maxBitrate = 150_000;  
    // Optional: reduce frame rate
    params.encodings[0].maxFramerate = 10;     
  
    try {
      await sender.setParameters(params);
      // toast("Lowered video quality for congestion");
    } catch (err) {
      // toast("failed lower");
      console.warn("Could not lower quality:", err);
    }
  }


  async function restoreHighQuality() {
    if (!spc) return;
    const sender = spc.getSenders().find((s:any) => s.track?.kind === "video");
    if (!sender) return;
  
    const params = sender.getParameters();
    if (params.encodings?.[0]) {
      delete params.encodings[0].maxBitrate;
      delete params.encodings[0].maxFramerate;
    }
  
    try {
      await sender.setParameters(params);
      // toast("Restored video quality");
    } catch (err) {
      // toast("failed restore");
      console.warn("Could not restore quality:", err);
    }
  }
  
  


  // inside your component, after you have a peer connection `pc`
useEffect(() => {
  if (!spc || !joined) return;

  let lastBytesSent = 0;
  const interval = setInterval(async () => {
    const stats = await spc.getStats();
    stats.forEach((report:any) => {
      if (report.type === "outbound-rtp" && report.kind === "video") {
        const bytesSent = report.bytesSent;
        const bitrate = ((bytesSent - lastBytesSent) * 8) / 2_000; // kbps over 2s
        lastBytesSent = bytesSent;

        // console.log("BITRATE IS : ",bitrate)
        // Simple threshold check (e.g. < 200 kbps)
        if (bitrate < 250) {
          lowerVideoQuality();
        } else {
          restoreHighQuality();
        }
      }
    });
  }, 5000);

  return () => clearInterval(interval);
}, [spc, joined]);


  async function hasBackCamera(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      // Look for any video device that is likely the back camera
      const hasBack = videoDevices.some((device) => {
        const label = device.label.toLowerCase();
        return label.includes("back") || label.includes("environment");
      });

      return hasBack;
    } catch (error) {
      console.error("Could not check camera availability:", error);
      return false;
    }
  }

  return (
    <>
      <div className="fixed main-button font-[500] px-8 py-2 gray-shadow z-10 top-2 left-2 md:left-auto md:right-4">
        Live : {livePeers}
      </div>

      <div className="universe-container relative mt-[5.5vh] md:mt-auto md:mr-[var(--marginRightFix)] py-2 md:h-screen flex flex-col items-center overflow-y-hidden">
        {/* cams holder */}
        <div
          className={`flex flex-col-reverse gap-[8px] md:gap-4 md:flex-row w-full h-[72vh] md:h-auto justify-center md:justify-between md:px-4`}
        >

          {/* Local video stream */}

<div
  onClick={checkAndRequestMedia}
  className="relative flex-1 w-full md:max-w-[43vw] h-[34vh] max-h-[60vh] md:h-[50vh] md:aspect-video cursor-pointer"
  style={{
    backgroundColor: isPermissionGranted ? "inherit" : "var(--element-bg)",
  }}
>
  {/* Floating menu container */}
  <div className="absolute top-2 right-2 md:top-auto md:bottom-2 z-20">
    {/* Menu button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
      }}
      className="cursor-pointer p-2 rounded-full bg-[var(--element-bg)] transition-transform duration-200 hover:scale-110"
      aria-label="Control menu"
    >
      <svg
        className="w-4 h-4 md:w-6 md:h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        />
      </svg>
    </button>

    {/* Menu items */}
    <div
      className={`absolute right-0 mt-2 md:-mt-46 md:w-40 bg-[var(--element-bg)]/90 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-300 ${
        menuOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      
      <div className="flex flex-col p-1 md:p-2 space-y-2">
        {/* Mic Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="cursor-pointer flex items-center space-x-2 p-2 hover:bg-white/10 rounded-md transition-colors"
        >
          {isMute ? (
            <FaMicrophoneSlash className="text-white text-lg" />
          ) : (
            <FaMicrophone className="text-white text-lg" />
          )}

        {isDesktop && (
        <span className="text-white text-sm">
          {isMute ? "Unmute Mic" : "Mute Mic"}
        </span>
      )}
          
        </button>

        {/* Camera Rotate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleReverseCamera();
          }}
          className="cursor-pointer flex items-center space-x-2 p-2 hover:bg-white/10 rounded-md transition-colors"
        >
          <IoCameraReverse className="text-white text-lg" />

         { isDesktop &&
          <span className="text-white text-sm">Flip Camera</span>
          }

        </button>

        {/* Video Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleVideo();
          }}
          className="cursor-pointer flex items-center space-x-2 p-2 hover:bg-white/10 rounded-md transition-colors"
        >
          {videoEnabled ? (
            <BiSolidCameraOff className="text-white text-lg" />
          ) : (
            <MdPhotoCamera className="text-white text-lg" />
          )}

{ isDesktop &&
          <span className="text-white text-sm">
            {videoEnabled ? "Turn Off Video" : "Turn On Video"}
          </span>
}

        </button>
      </div>

    </div>
    
  </div>

  {/* Rest of your video element and permission prompt */}
  <video
    ref={webcamVideo}
    autoPlay
    playsInline
    muted
    onLoadedMetadata={() => webcamVideo.current?.play()}
    className={`w-full h-full object-cover transform bg-[var(--element-bg)] ${
      currentFacingMode === "user" ? "scale-x-[-1]" : ""
    } md:max-w-[43vw] max-h-[60vh] md:h-[50vh] ${
      !videoEnabled ? "hidden" : ""
    }`}
  />

  {!isPermissionGranted && (
    <div
      onClick={checkAndRequestMedia}
      className="absolute inset-0 flex items-center justify-center text-white text-[20px] font-[600]"
    >
      Allow Camera & Mic
    </div>
  )}

  {/* Camera off indicator */}
  {!videoEnabled && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <BiSolidCameraOff className="text-white text-4xl" />
    </div>
  )}
</div>

          {/* ---------------------------------- Remote video stream with animated close button --------------------------------------------- */}
<div
  onClick={connectToAlien}
  className="relative flex-1 w-full h-[34vh] md:max-w-[43vw] max-h-[60vh] md:h-[50vh] aspect-video cursor-pointer"
  style={{
    backgroundColor:
      isPermissionGranted && remotePeers?.stream
        ? "inherit"
        : "var(--element-bg)",
  }}
>

  {!remoteVideoEnabled && remotePeers?.stream && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
    <BiSolidCameraOff className="text-white text-4xl" />
  </div>
)}

  {/* Animated Close Button at Top-Right */}
  {remotePeers?.stream && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        disconnectRemoteStream();
      }}
      aria-label="Close remote stream"
      className="
        cursor-pointer
        absolute top-2 right-2 z-20
        p-2 rounded-full
        bg-black/50
        transform transition-transform duration-200
        hover:scale-110
        focus:outline-none
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white animate-pulse-once"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  )}

           {/* remote video here  */}
<video
  ref={videoRef}
  autoPlay
  playsInline
  className={`w-full object-cover transform bg-[var(--element-bg)] scale-x-[-1] h-[34vh] md:max-w-[43vw] max-h-[60vh] md:h-[50vh] ${
    !remoteVideoEnabled ? "hidden" : ""
  }`}
/>

  {!remotePeers?.stream ? (
    <div className="absolute inset-0 flex items-center justify-center text-white text-[20px] font-[600]">
      {isLoading ? (
        <ClipLoader color="white" loading size={30} />
      ) : (
        <button className="main-button text-[18px] md:text-[20px] p-[4px] md:p-2 cursor-pointer">
          Click to talk to aliens
        </button>
      )}
    </div>
  ) : null}

  
</div>



        </div>

        <div className="flex-1 flex flex-col justify-end w-full fixed md:relative bottom-0 z-11">
          <ChatBox
            messages={messages}
            sendMessage={sendMessage}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            switchPerson={switchPerson}
          />
        </div>
      </div>
    </>
  );
}
