import api from "./api"; 

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};


export const uploadAvatar = async (base64Image) => {
  const file = dataURLtoFile(base64Image, "avatar.png");

  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data; 
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/users/info", profileData); 
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put("/users/change-password", {
    oldPassword: passwordData.current,  
    newPassword: passwordData.next,
  });
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/users/me");
  return response.data;
}