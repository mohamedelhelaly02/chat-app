interface ReactedBy {
  _id: string;
  username: string;
  avatar: string;
}

export interface Reaction {
  _id: string;
  reactedBy: ReactedBy;
  emoji: string;
  message: string;
}
