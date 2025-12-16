export interface ReservationCreatedEmailDto {
  organizerName: string;
  organizerEmail: string;
  bookingReference: string;
  stadiumName: string;
  stadiumLocation: string;
  date: string;
  time: string;
  totalPrice: number;
  numberOfPlayers: number;
  isSplitPayment: boolean;
  sessions: Array<{
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  }>;
}

export interface InvitationEmailDto {
  playerName: string;
  playerEmail: string;
  organizerName: string;
  bookingReference: string;
  stadiumName: string;
  stadiumLocation: string;
  date: string;
  time: string;
  totalPrice: number;
  shareAmount?: number; // Only for split payment
  isSplitPayment: boolean;
  paymentUrl?: string; // Link to payment page
}

export interface PaymentConfirmationEmailDto {
  username: string;
  email: string;
  bookingReference: string;
  stadiumName: string;
  date: string;
  time: string;
  amountPaid: number;
  isFullyConfirmed: boolean; // true if all participants paid
  pendingParticipants?: number; // number of people still need to pay
}
