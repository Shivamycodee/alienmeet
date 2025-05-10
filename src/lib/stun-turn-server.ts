

const FREE_STUN_Server = [
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun.ideasip.com:3478' }, 
]

const PAID_STUN_Server =  [
  {urls: "stun:stun.relay.metered.ca:80"}
]

const FREE_TURN_SERVER = [

         // Valid TURN servers 

      {
        urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'webrtc'
    },
    {
      urls: 'turn:192.158.29.39:3478?transport=tcp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
  },
  {
    urls: 'turn:relay.backups.cz?transport=tcp',
    credential: 'webrtc',
    username: 'webrtc'
},

]

const PAID_TURN_SERVER = [
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "92543b85605b2b03eea4e66b",
    credential: "WTIpZo3LmgfNF28W",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "92543b85605b2b03eea4e66b",
    credential: "WTIpZo3LmgfNF28W",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "92543b85605b2b03eea4e66b",
    credential: "WTIpZo3LmgfNF28W",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "92543b85605b2b03eea4e66b",
    credential: "WTIpZo3LmgfNF28W",
  },
]


export {FREE_STUN_Server,PAID_STUN_Server,FREE_TURN_SERVER,PAID_TURN_SERVER};