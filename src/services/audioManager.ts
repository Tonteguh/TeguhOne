/**
 * Global Audio Manager for TeguhOne
 * 
 * Aturan Logika Utama:
 * "kalau satu suara nyala yg lain harus mati jadi tak berbenturan ada dua suara atau video lebih yg nyala dlm satu waktu"
 * 
 * Mengatur pemutaran Radio, Tilawah Murotal, Video In-App, dan Text-to-Speech (TTS).
 */

export type AudioSourceType = 'radio' | 'tilawah' | 'video' | 'tts';

class GlobalAudioManager {
  private currentActiveSource: AudioSourceType | null = null;
  private stopCallbacks: Map<AudioSourceType, () => void> = new Map();
  private isTTSSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Daftarkan callback stop untuk masing-masing modul
   */
  public registerSource(type: AudioSourceType, stopFn: () => void) {
    this.stopCallbacks.set(type, stopFn);
  }

  public unregisterSource(type: AudioSourceType) {
    this.stopCallbacks.delete(type);
  }

  /**
   * Panggil sebelum memulai suara atau video apapun.
   * Ini akan mematikan semua sumber suara lainnya seketika!
   */
  public requestPlayback(source: AudioSourceType) {
    // Matikan TTS jika sedang bicara
    if (source !== 'tts' && this.isTTSSpeaking) {
      this.stopTTS();
    }

    // Matikan semua sumber lain yang sedang aktif
    this.stopCallbacks.forEach((stopFn, type) => {
      if (type !== source) {
        try {
          stopFn();
        } catch (e) {
          console.warn(`Error stopping audio source ${type}:`, e);
        }
      }
    });

    this.currentActiveSource = source;
  }

  public notifyPaused(source: AudioSourceType) {
    if (this.currentActiveSource === source) {
      this.currentActiveSource = null;
    }
  }

  public getActiveSource(): AudioSourceType | null {
    return this.currentActiveSource;
  }

  /**
   * Fitur Text-To-Speech (TTS) Bahasa Indonesia
   */
  public speakTTS(text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Fitur Text-to-Speech tidak didukung pada browser ini.');
      return false;
    }

    // Matikan suara lain terlebih dahulu
    this.requestPlayback('tts');

    window.speechSynthesis.cancel();

    // Bersihkan format markdown agar dibaca natural
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[-*]\s/g, ', ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pilih suara Indonesia jika tersedia
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang.startsWith('id') || v.lang.includes('ID')
    );
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    this.isTTSSpeaking = true;
    this.currentUtterance = utterance;

    utterance.onend = () => {
      this.isTTSSpeaking = false;
      this.currentUtterance = null;
      if (this.currentActiveSource === 'tts') {
        this.currentActiveSource = null;
      }
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('TTS speech error:', e);
      this.isTTSSpeaking = false;
      this.currentUtterance = null;
      if (this.currentActiveSource === 'tts') {
        this.currentActiveSource = null;
      }
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stopTTS() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isTTSSpeaking = false;
    this.currentUtterance = null;
    if (this.currentActiveSource === 'tts') {
      this.currentActiveSource = null;
    }
  }

  public isSpeaking(): boolean {
    return this.isTTSSpeaking;
  }
}

export const audioManager = new GlobalAudioManager();
