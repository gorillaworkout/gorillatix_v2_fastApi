export type TicketViewerProps = {
  id: string;
  eventName: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  quantity: number;
  totalPrice: number;
  status: string;
  customerName: string;
};

export type StatusTicketProps = "confirmed" | "cancelled" | "used" | "Pending" | "Error" | "expire" | "paid" | "waiting_payment"