import api from "./api";

export const trackProduct = async (url) => {

try {

const response =
await api.post(
"/products/track",
{
url
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