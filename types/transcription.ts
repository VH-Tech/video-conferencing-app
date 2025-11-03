export interface TranscriptMessage {
  id: string
  userName: string
  text: string
  isFinal: boolean
  timestamp: Date
}

export interface TranscriptionState {
  isActive: boolean
  isSupported: boolean
  messages: TranscriptMessage[]
  error: string | null
}

export interface DailyTranscriptionMessage {
  fromId: string
  data: {
    user_name: string
    text: string
    is_final: boolean
    session_id?: string
    participant_id?: string
  }
}
