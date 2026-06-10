import api from "./api";

export const trackProduct = async (url, targetPrice, alertPreference) => {

try {

const response =
await api.post(
"/products/track",
{
url,
targetPrice: targetPrice ? Number(targetPrice) : null,
alertPreference: alertPreference || "EMAIL"
}
);

return response.data;

}
catch(error){

throw error;

}

};

export const getProducts = async () => {

try{

const response =
await api.get(
"/products"
);

return response.data;

}
catch(error){

throw error;

}

};

export const removeProduct = async(id)=>{

try{

await api.delete(
`/products/${id}`
);

}
catch(error){

throw error;

}

};

export const getPriceHistory =
async(id)=>{

try{

const response=

await api.get(
`/products/${id}/history`
);

return response.data;

}
catch(error){

throw error;

}

};

export const getStats =
async()=>{

try{

const response=

await api.get(
"/products/stats"
);

return response.data;

}
catch(error){

throw error;

}

};

export const triggerTestAlert = async (id) => {
  try {
    const response = await api.post(`/products/${id}/test-alert`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVapidPublicKey = async () => {
  try {
    const response = await api.get("/notifications/vapid-public-key");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const subscribeToPush = async (subscription) => {
  try {
    const response = await api.post("/notifications/subscribe", subscription);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAlerts = async () => {
  try {
    const response = await api.get("/products/alerts");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPublicDeals = async () => {
  try {
    const response = await api.get("/products/public-deals");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getHistory = async () => {
  try {
    const response = await api.get("/products/history");
    return response.data;
  } catch (error) {
    throw error;
  }
};