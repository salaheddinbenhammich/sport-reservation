import api from "./api";

export async function fetchStadiumDetails(id: string) {
  const { data } = await api.get(`/stadium/${id}`);
  return data;
}

export async function fetchSessions(
  stadiumId: string,
  dateISO?: string
): Promise<
  {
    _id: string;
    startTime: string;
    endTime: string;
    price: number;
    date: string;
    status: "available" | "booked" | "canceled";
  }[]
> {
  const { data } = await api.get(`/sessions`, {
    params: { stadiumId, date: dateISO },
  });
  return data;
}


export async function fetchReviews(id: string) {
  const { data } = await api.get(`/stadium/${id}/reviews`);
  return data;
}

export async function submitRating(id: string, rating: number, comment?: string) {
  const { data } = await api.post(`/stadium/${id}/reviews`, {
    rating,
    comment,
  });
  return data;
}
