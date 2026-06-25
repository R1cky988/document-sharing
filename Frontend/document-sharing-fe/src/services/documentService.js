import api from "./api";

export const getMyDocuments = async (
  page = 0,
  size = 10
) => {
  const response = await api.get(
    `/documents/my-document?page=${page}&size=${size}`
  );

  return response.data;
};