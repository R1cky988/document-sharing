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

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const getDocumentContent = async (id) => {
  const response = await api.get(`/documents/${id}/view`, {
    responseType: "blob",
  });

  return {
    blob: response.data,
    contentType: response.headers["content-type"],
  };
};

export const toggleStar = async (id) => {
    const response = await api.post(`/documents/${id}/toggle-star`);
    return response.data;
};

export const getStarredDocuments = async (page = 0, size = 10) => {
  const response = await api.get(
    `/documents/starred?page=${page}&size=${size}`
  );
  return response.data;
};

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const shareDocument = async (docId, email) => {
  const response = await api.post(`/documents/${docId}/share`, {
    email: email
  });
  
  return response.data; 
};

export const getDocumentPermissions = async (docId) => {
  const response = await api.get(`/documents/${docId}/permissions`, {
    params: { size: 100 } 
  });
  return response.data;
};

export const generateShareLink = async (docId, shareType) => {
  const response = await api.post(`/shared/${docId}/generate`, null, {
    params: {
      shareType: shareType.toUpperCase()
    }
  });
  
  return response.data; 
};

export const revokeDocumentPermission = async (docId, email) => {
  const response = await api.delete(`/documents/${docId}/permissions`, {
    params: { email } 
  });
  return response.data;
};

export const deleteDocument = async (id) => {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
};

export const removeMyPermission = async (id) => {
  const res = await api.delete(`/documents/${id}/permission`);
  return res.data;
};

export const downloadDocument = async (docId) => {
  const response = await api.get(`documents/${docId}/download`, {
    responseType: "blob", 
  });
  return response; 
};

export const getSharedDocumentContent = async (token) => {
  const response = await api.get(`/shared/view/${token}`, {
    responseType: "blob", 
  });

  const contentType = response.headers["content-type"];

  let fileName = "shared_document";
  const disposition = response.headers["content-disposition"];
  if (disposition && disposition.includes("filename=")) {
    fileName = disposition
      .split("filename=")[1]
      .replace(/['"]/g, ""); 
  }

  return {
    blob: response.data,   
    contentType,         
    fileName,              
  };
};

export const formatSize = (bytes) => {
  if (!bytes) return "0 B";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};
