export interface Repo {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}
