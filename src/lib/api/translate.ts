import { apiCall } from './client';

export const translateApi = {
  async translate(text: string, from: string, to: string) {
    return apiCall('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, from, to }),
    });
  },

  async speakText(text: string, language: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  },
};
