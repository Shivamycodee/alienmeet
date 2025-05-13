---
title: About alienmeet?
author: shivam yadav
date: 2025-05-13
tags: webRTC, decentralized, community
index: 1
description: "AlienMeet’s mission: meet new people online. No borders. Just people. With decentralized WebRTC, video & audio go peer‑to‑peer—no slow servers, no third parties. Enjoy faster connections, lower latency, and true privacy."
oneLiner: "No borders. Just people."
---


# Why Build AlienMeet?

I’ve built multiple apps using [WebRTC](https://webrtc.org/), like [Dverse](https://dverse-git.vercel.app/videocall). Compared to video calls on platforms like WhatsApp or Google Meet, I found WebRTC to be significantly faster. This is because it eliminates the third party through which all data is routed, resulting in improved speed and enhanced privacy.  
That’s why I built **AlienMeet** — a faster, more private way to connect.

# Centralized vs Decentralized Video Calls

![centralized (zoom) vs decentralized (alienmeet)](https://camo.githubusercontent.com/6e2934de1e06892b851a563e8d87d3c98ee1154ed6075d8d7754f0cd120f309b/68747470733a2f2f626c6f676765656b2e6d652f6e6974726f7061636b5f7374617469632f467a48626757547959574c6c794d4b4a425957704f62635071634d76724b4b692f6173736574732f696d616765732f6f7074696d697a65642f7265762d636436353764312f626c6f676765656b2e6d652f77702d636f6e74656e742f75706c6f6164732f323031392f30352f3230313930352d776562736f636b65742d76732d646174616368616e6e656c2e6a7067)

# How it works

- When the user provides camera and microphone permissions and clicks on **'Talk to Aliens'**, a WebSocket connection is created to a server. The server assigns a `peerId` to the system and attempts to find an open peer to match the user with. Once a match is found, the server shares their WebSocket connections with each other, and the frontend code handles all the sending and receiving of audio and video streams.

- As you can see, there is no centralization here. The server is only used to connect random peers with each other. This kind of server is called a **Signaling Server**, and it does not store any user data.


# Tech Used

  - The entire project is built using **TypeScript**.
    
-   **Vite.js** is used for frontend development.
    
-   **Node.js** is used for the server application.

# Overview of webRTC 

In simple terms, **WebRTC** enables two systems to connect and exchange media streams (like video and audio) directly without using a third-party server. WebRTC uses JavaScript APIs such as **RTCPeerConnection** and **RTCDataChannel** to connect, listen, and transmit streams. It also employs **ICE Candidates**, **STUN servers**, and **TURN servers** to establish and maintain peer-to-peer connections.