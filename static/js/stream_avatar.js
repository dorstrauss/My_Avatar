    'use strict';

    const DID_API_URL = window.DID_API.url;
    const DID_API_KEY = window.DID_API.key;
    const RTCPeerConnection = (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection).bind(window);

    let peerConnection;
    let streamId;
    let sessionId;
    let sessionClientAnswer;

    const talkVideo = document.getElementById('talk-video');
    const talkButton = document.getElementById('talk-button');
    const inputTextArea = document.getElementById('inputTextArea');
    const peerStatusLabel = document.getElementById('peer-status-label');
    const iceStatusLabel = document.getElementById('ice-status-label');
    const iceGatheringStatusLabel = document.getElementById('ice-gathering-status-label');
    const signalingStatusLabel = document.getElementById('signaling-status-label');
    const startingText = 'Hi i am dor 2.o, a digital version of dor. you can ask me anything.';

    let loopRunning = true;
    function startPlaceholderLoop(word) {
        const variations = [`${word}`, `${word}.`, `${word}..`, `${word}...`];
        let index = 0;
        let frame_change_time = 600;

        const intervalId = setInterval(() => {
            if (!loopRunning) {
                clearInterval(intervalId);
                inputTextArea.placeholder = 'Talk with me';
                return;
            }

            inputTextArea.placeholder = variations[index];
            index = (index + 1) % variations.length;
        }, frame_change_time);
    }

    async function connectToStream() {
      if (peerConnection && peerConnection.connectionState === 'connected') {
        return;
      }

      stopAllStreams();
      closePC();

      const sessionResponse = await fetch(`${DID_API_URL}/talks/streams`, {
        method: 'POST',
        headers: {'Authorization': `Basic ${DID_API_KEY}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({
          source_url: "https://dor-demo-s3.s3.eu-west-3.amazonaws.com/dor_as_a_futurstic_solider.jpg"
        }),
      });


      const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json()
      streamId = newStreamId;
      sessionId = newSessionId;

      try {
        sessionClientAnswer = await createPeerConnection(offer, iceServers);
      } catch (e) {
        console.log('error during streaming setup', e);
        stopAllStreams();
        closePC();
        return;
      }

      const sdpResponse = await fetch(`${DID_API_URL}/talks/streams/${streamId}/sdp`,
        {
          method: 'POST',
          headers: {Authorization: `Basic ${DID_API_KEY}`, 'Content-Type': 'application/json'},
          body: JSON.stringify({answer: sessionClientAnswer, session_id: sessionId})
        });

      loopRunning = false;
      inputTextArea.disabled = false;
    };

    talkVideo.addEventListener('ended', () => {
        startPlaceholderLoop('Connecting');
        connectToStream();
    });

    talkButton.onclick = async () => {
        talkButton.style.display = 'none';
        inputTextArea.style.display = 'block';
        inputTextArea.disabled = true;
        talkVideo.play();
    };


    function onIceCandidate(event) {
        console.log('onIceCandidate', event);
        if (event.candidate) {
            const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

            fetch(`${DID_API_URL}/talks/streams/${streamId}/ice`,
            {
                method: 'POST',
                headers: {Authorization: `Basic ${DID_API_KEY}`, 'Content-Type': 'application/json'},
                body: JSON.stringify({ candidate, sdpMid, sdpMLineIndex, session_id: sessionId})
            });
        }
    }

    function onIceConnectionStateChange() {
        if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
            stopAllStreams();
            closePC();
        }
        if (peerConnection.iceConnectionState === 'connected') {
            talkButton.removeAttribute('disabled');
            talkButton.textContent = 'Start';
        }
    }

    function onTrack(event) {
        const remoteStream = event.streams[0];
        setVideoElement(remoteStream);
    }

    async function createPeerConnection(offer, iceServers) {
        if (!peerConnection) {
            peerConnection = new RTCPeerConnection({iceServers});
            peerConnection.addEventListener('icecandidate', onIceCandidate, true);
            peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
            peerConnection.addEventListener('track', onTrack, true);
        }

        await peerConnection.setRemoteDescription(offer);
        console.log('set remote sdp OK');

        const sessionClientAnswer = await peerConnection.createAnswer();
        console.log('create local sdp OK');

        await peerConnection.setLocalDescription(sessionClientAnswer);
        console.log('set local sdp OK');

        return sessionClientAnswer;
    }

    function setVideoElement(stream) {
        if (!stream) return;
        inputTextArea.textContent = 'Talk with me'
        talkVideo.srcObject = stream;

        // safari hotfix
        if (talkVideo.paused) {
            talkVideo.play().then(_ => {}).catch(e => {});
        }
    }

    function stopAllStreams() {
        if (talkVideo.srcObject) {
            console.log('stopping video streams');
            talkVideo.srcObject.getTracks().forEach(track => track.stop());
            talkVideo.srcObject = null;
        }
    }

    function closePC(pc = peerConnection) {
        if (!pc) return;
        console.log('stopping peer connection');
        pc.close();
        pc.removeEventListener('icecandidate', onIceCandidate, true);
        pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
        pc.removeEventListener('track', onTrack, true);
        iceGatheringStatusLabel.innerText = '';
        signalingStatusLabel.innerText = '';
        iceStatusLabel.innerText = '';
        peerStatusLabel.innerText = '';
        console.log('stopped peer connection');
        if (pc === peerConnection) {
            peerConnection = null;
        }
    }

    async function getChatbotAnswer(input_text) {
        const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
        try {
            var chatbotAnswer = await fetch(CHATBOT_ENDPOINT_URL, {
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken,},
            body: JSON.stringify({input_text: input_text})
            });

            var answerTextJson = await chatbotAnswer.json();
            var answerText = answerTextJson.answer;
            return answerText;
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    }

    async function createStream(input_text) {
        if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
            var answerText = await getChatbotAnswer(input_text);
            console.log(answerText);
            return;

            const talkResponse = await fetch(`${DID_API_URL}/talks/streams/${streamId}`,
              {
                method: 'POST',
                headers: { Authorization: `Basic ${DID_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  script: {
                    type: 'text',
                    subtitles: 'false',
                    provider: {
                      type: 'microsoft',
                      voice_id: 'en-US-DavisNeural'
                    },
                    ssml: 'false',
                    input: answerText
                  },
                  config: {fluent: 'false', pad_audio: '0.0', stitch: 'true'},
                  'session_id': sessionId
                })
              });

              loopRunning = false;
        }
    };

    inputTextArea.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            var inputText = inputTextArea.value;
            inputTextArea.value = '';
            loopRunning = true;
            startPlaceholderLoop('Thinking')
            createStream(inputText);
        }
    });