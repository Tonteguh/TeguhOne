type PeerInstance = any;
type MediaConnection = any;

declare global {
  interface Window {
    Peer?: any;
  }
}

const PEERJS_URLS = [
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
  'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js',
];

function loadPeerJS(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('WebRTC hanya berjalan di browser.'));
  }

  if (window.Peer) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let index = 0;

    const loadNext = () => {
      if (window.Peer) {
        resolve();
        return;
      }

      if (index >= PEERJS_URLS.length) {
        reject(
          new Error(
            'Library WebRTC gagal dimuat. Periksa koneksi internet.'
          )
        );
        return;
      }

      const src = PEERJS_URLS[index++];

      const existing = document.querySelector(
        `script[src="${src}"]`
      ) as HTMLScriptElement | null;

      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => loadNext(),
          { once: true }
        );
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        if (window.Peer) {
          resolve();
        } else {
          loadNext();
        }
      };

      script.onerror = () => {
        script.remove();
        loadNext();
      };

      document.head.appendChild(script);
    };

    loadNext();
  });
}

export class TeguhWebRTC {
  private peer: PeerInstance | null = null;
  private activeCall: MediaConnection | null = null;
  private localStream: MediaStream | null = null;

  private readonly storageKey = 'teguhone_webrtc_peer_id_v2';

  async init(): Promise<string> {
    await loadPeerJS();

    if (this.peer && !this.peer.destroyed) {
      return this.peer.id;
    }

    const Peer = window.Peer;

    if (!Peer) {
      throw new Error('PeerJS belum tersedia.');
    }

    let peerId = localStorage.getItem(this.storageKey) || '';

    if (!peerId) {
      peerId =
        'teguhone-' +
        crypto.randomUUID().replace(/-/g, '').slice(0, 12);

      localStorage.setItem(this.storageKey, peerId);
    }

    try {
      this.peer = new Peer(peerId, {
        debug: 1,

        config: {
          iceServers: [
            {
              urls: 'stun:stun.l.google.com:19302',
            },
            {
              urls: 'stun:stun1.l.google.com:19302',
            },
            {
              urls: 'stun:stun2.l.google.com:19302',
            },
          ],
        },
      });
    } catch {
      throw new Error('Gagal membuat koneksi WebRTC.');
    }

    return new Promise((resolve, reject) => {
      const peer = this.peer;

      if (!peer) {
        reject(new Error('Peer WebRTC tidak tersedia.'));
        return;
      }

      let settled = false;

      const timeout = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(
            new Error(
              'WebRTC belum terhubung. Periksa internet dan coba muat ulang.'
            )
          );
        }
      }, 20000);

      peer.on('open', (id: string) => {
        if (settled) return;

        settled = true;
        window.clearTimeout(timeout);

        localStorage.setItem(this.storageKey, id);

        resolve(id);
      });

      peer.on('error', (error: any) => {
        console.error('TeguhOne WebRTC error:', error);

        if (
          error?.type === 'unavailable-id' ||
          error?.type === 'invalid-id'
        ) {
          localStorage.removeItem(this.storageKey);
        }

        if (!settled) {
          settled = true;
          window.clearTimeout(timeout);

          reject(
            new Error(
              error?.type === 'peer-unavailable'
                ? 'ID tujuan tidak ditemukan atau sedang offline.'
                : error?.message ||
                  'Koneksi WebRTC mengalami masalah.'
            )
          );
        }
      });

      peer.on('disconnected', () => {
        console.warn('WebRTC signaling disconnected.');

        try {
          peer.reconnect();
        } catch (error) {
          console.warn('Reconnect gagal:', error);
        }
      });

      peer.on('close', () => {
        console.warn('WebRTC signaling ditutup.');
      });
    });
  }

  onIncoming(
    handler: (call: MediaConnection) => void
  ): void {
    if (!this.peer) return;

    this.peer.off?.('call');

    this.peer.on('call', (call: MediaConnection) => {
      console.log('TChat incoming call:', call.peer);

      handler(call);
    });
  }

  async getLocalStream(
    video: boolean
  ): Promise<MediaStream> {
    if (!window.isSecureContext) {
      throw new Error(
        'Kamera dan mikrofon membutuhkan HTTPS. Buka TeguhOne melalui GitHub Pages/HTTPS.'
      );
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Browser perangkat ini tidak mendukung akses kamera/mikrofon.'
      );
    }

    this.stopLocalStream();

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },

          video: video
            ? {
                facingMode: 'user',
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
              }
            : false,
        });

      this.localStream = stream;

      return stream;
    } catch (error: any) {
      console.error('getUserMedia error:', error);

      if (error?.name === 'NotAllowedError') {
        throw new Error(
          'Izin kamera/mikrofon ditolak. Izinkan akses dari pengaturan browser.'
        );
      }

      if (error?.name === 'NotFoundError') {
        throw new Error(
          'Kamera atau mikrofon tidak ditemukan pada perangkat.'
        );
      }

      if (error?.name === 'NotReadableError') {
        throw new Error(
          'Kamera/mikrofon sedang digunakan aplikasi lain.'
        );
      }

      throw new Error(
        error?.message ||
          'Tidak dapat mengakses kamera/mikrofon.'
      );
    }
  }

  call(
    remotePeerId: string,
    stream: MediaStream
  ): MediaConnection {
    if (!this.peer || this.peer.destroyed) {
      throw new Error(
        'TChat WebRTC belum siap. Muat ulang aplikasi.'
      );
    }

    const target = remotePeerId.trim();

    if (!target) {
      throw new Error(
        'ID TChat tujuan belum dimasukkan.'
      );
    }

    if (target === this.peer.id) {
      throw new Error(
        'ID tujuan tidak boleh sama dengan ID HP sendiri.'
      );
    }

    const video =
      stream.getVideoTracks().length > 0;

    const call = this.peer.call(
      target,
      stream,
      {
        metadata: {
          app: 'TeguhOne',
          protocol: 'WebRTC',
          version: 2,
          video,
          createdAt: Date.now(),
        },
      }
    );

    if (!call) {
      throw new Error(
        'Panggilan tidak dapat dibuat.'
      );
    }

    this.activeCall = call;

    return call;
  }

  answer(
    call: MediaConnection,
    stream: MediaStream
  ): MediaConnection {
    if (!call) {
      throw new Error(
        'Panggilan masuk tidak tersedia.'
      );
    }

    this.activeCall = call;

    call.answer(stream);

    return call;
  }

  attachRemote(
    call: MediaConnection,
    onStream: (stream: MediaStream) => void,
    onClose: () => void,
    onError: (error: any) => void
  ): void {
    if (!call) return;

    call.on(
      'stream',
      (stream: MediaStream) => {
        console.log(
          'TChat remote stream received:',
          stream.getTracks().map(
            (track) => track.kind
          )
        );

        onStream(stream);
      }
    );

    call.on('close', () => {
      console.log('TChat call closed.');
      onClose();
    });

    call.on('error', (error: any) => {
      console.error(
        'TChat call error:',
        error
      );

      onError(error);
    });
  }

  stopLocalStream(): void {
    if (!this.localStream) return;

    this.localStream
      .getTracks()
      .forEach((track) => {
        try {
          track.stop();
        } catch {}
      });

    this.localStream = null;
  }

  end(): void {
    try {
      this.activeCall?.close();
    } catch {}

    this.activeCall = null;

    this.stopLocalStream();
  }

  getCurrentPeerId(): string {
    return this.peer?.id || '';
  }

  isReady(): boolean {
    return !!(
      this.peer &&
      !this.peer.destroyed &&
      this.peer.open
    );
  }
}

export const webrtcPeer =
  new TeguhWebRTC();
